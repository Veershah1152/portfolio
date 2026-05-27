"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link2, AlertCircle, CheckCircle2, Loader2, FileArchive } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LinkedInUploadPage() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFile = useCallback((f: File) => {
    const ext = f.name.toLowerCase().split(".").pop();
    if (ext !== "zip" && ext !== "pdf") {
      setError("Please upload a ZIP file or a PDF export of your LinkedIn profile.");
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/linkedin/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse LinkedIn data");
      }

      // Store parsed data in sessionStorage for the review page
      sessionStorage.setItem("linkedin_review_items", JSON.stringify(data.items));
      sessionStorage.setItem("linkedin_review_summary", JSON.stringify(data.summary));

      toast.success(`Found ${data.summary.total} items to review`);
      router.push("/admin/linkedin/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      toast.error("Failed to parse LinkedIn data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      {/* Header */}
      <div className="border-l-2 border-phosphor/40 pl-5">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="size-4 text-phosphor" />
          <p className="font-mono text-[10px] tracking-[0.3em] text-phosphor uppercase">LinkedIn Import</p>
        </div>
        <h1 className="text-2xl font-medium text-foreground">Import LinkedIn Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload your LinkedIn data export ZIP or Profile PDF to auto-populate your portfolio.
        </p>
      </div>

      {/* How to export guide */}
      <div className="bg-card/40 ring-1 ring-border/60 rounded-lg p-5 space-y-3">
        <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          How to Export LinkedIn Data
        </h2>
        <ol className="space-y-2 text-sm text-muted-foreground font-mono">
          {[
            "Go to LinkedIn → Me → Settings & Privacy",
            "Click \"Data Privacy\" → \"Get a copy of your data\"",
            "Select: Profile, Positions, Education, Skills, Certifications, Posts",
            "Click \"Request archive\" — LinkedIn sends a ZIP within 24h",
            "Upload the downloaded ZIP file here",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 text-phosphor">0{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          dragging
            ? "border-phosphor bg-phosphor/5 shadow-phosphor-soft"
            : file
            ? "border-phosphor/40 bg-phosphor/5"
            : "border-border/60 hover:border-phosphor/30 hover:bg-secondary/20"
        }`}
        onClick={() => !file && document.getElementById("linkedin-zip-input")?.click()}
      >
        <input
          id="linkedin-zip-input"
          type="file"
          accept=".zip,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <FileArchive className="size-10 text-phosphor mx-auto" />
              <p className="font-mono text-sm text-foreground">{file.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to parse
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-[11px] font-mono text-muted-foreground hover:text-destructive transition-colors"
              >
                Remove file
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              <Upload className="size-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-foreground font-medium">Drop your LinkedIn ZIP or Profile PDF here</p>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  or click to browse · Max 50MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-destructive/10 ring-1 ring-destructive/30 rounded-lg"
        >
          <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm font-mono text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full flex items-center justify-center gap-3 py-3.5 bg-phosphor text-void font-semibold rounded-lg hover:shadow-phosphor active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono tracking-widest uppercase text-sm"
        id="linkedin-upload-btn"
      >
        {loading ? (
          <><Loader2 className="size-4 animate-spin" /> Analyzing LinkedIn Data...</>
        ) : (
                  <><Link2 className="size-4" /> Analyze & Continue</>
        )}
      </button>

      {/* What gets imported */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Experience & Education", items: ["Work positions", "Degrees", "Schools"] },
          { label: "Certifications & Skills", items: ["Certificates", "Licenses", "Skills list"] },
          { label: "Posts & Projects", items: ["LinkedIn articles", "Status posts", "Projects section"] },
        ].map((cat) => (
          <div key={cat.label} className="bg-card/40 ring-1 ring-border/60 rounded-lg p-4">
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-phosphor mb-2">
              {cat.label}
            </h3>
            <ul className="space-y-1">
              {cat.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
                  <CheckCircle2 className="size-3 text-phosphor shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
