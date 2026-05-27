import { NextResponse } from "next/server";
import { parseLinkedInZip } from "@/lib/linkedin/parser";
import { parseLinkedInPdfText } from "@/lib/linkedin/pdfParser";
import { analyzeLinkedInData } from "@/lib/linkedin/analyzer";
import { createClient } from "@/lib/supabase/server";
import path from "path";
import { pathToFileURL } from "url";

// Polyfill global elements to prevent pdf-parse ReferenceError in Node environment
if (typeof global !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = global as any;
  if (!g.DOMMatrix) g.DOMMatrix = class {};
  if (!g.ImageData) g.ImageData = class {};
  if (!g.Path2D) g.Path2D = class {};
}
if (typeof globalThis !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gt = globalThis as any;
  if (!gt.DOMMatrix) gt.DOMMatrix = class {};
  if (!gt.ImageData) gt.ImageData = class {};
  if (!gt.Path2D) gt.Path2D = class {};
}

export const maxDuration = 30; // 30 second timeout for parsing

export async function POST(req: Request) {
  try {
    // Verify admin is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".zip") && !filename.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Please upload a ZIP file or a PDF export from LinkedIn." },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 50MB." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    let parsedData;

    if (filename.endsWith(".zip")) {
      parsedData = await parseLinkedInZip(buffer);
    } else {
      const pdfBuffer = Buffer.from(buffer);
      const { PDFParse } = await import("pdf-parse");
      
      const workerPath = path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
      PDFParse.setWorker(pathToFileURL(workerPath).toString());

      const parser = new PDFParse({ data: pdfBuffer });
      const pdfResult = await parser.getText();
      parsedData = parseLinkedInPdfText(pdfResult.text);
    }

    const reviewItems = analyzeLinkedInData(parsedData);

    const summary = {
      total: reviewItems.length,
      positions: reviewItems.filter((i) => i.type === "experience").length,
      education: reviewItems.filter((i) => i.type === "education").length,
      certifications: reviewItems.filter((i) => i.type === "certification").length,
      skills: reviewItems.filter((i) => i.type === "skill").length,
      posts: reviewItems.filter((i) => i.type === "post").length,
      projects: reviewItems.filter((i) => i.type === "project").length,
      autoInclude: reviewItems.filter((i) => i.action === "include").length,
      autoSkip: reviewItems.filter((i) => i.action === "skip").length,
    };

    return NextResponse.json({
      success: true,
      items: reviewItems,
      summary,
    });
  } catch (err) {
    console.error("LinkedIn parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse LinkedIn data. Please ensure you uploaded a valid LinkedIn export ZIP." },
      { status: 500 }
    );
  }
}
