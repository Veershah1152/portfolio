import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (message.length < 20) {
      return NextResponse.json(
        { error: "Message must be at least 20 characters." },
        { status: 400 }
      );
    }

    // Save to Supabase
    const supabase = await createClient();
    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
    }

    // Send email via Resend (optional — only if API key is set)
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL_TO) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Portfolio Contact <noreply@portfolio.dev>",
          to: [process.env.CONTACT_EMAIL_TO],
          subject: `[Portfolio] New message from ${name}${subject ? `: ${subject}` : ""}`,
          text: `From: ${name} <${email}>\n\n${message}`,
          html: `
            <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a0a0f; color: #e0e0e0; border: 1px solid #333;">
              <h2 style="color: #4ade80; margin: 0 0 16px;">New Contact Message</h2>
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #4ade80;">${email}</a></p>
              ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
              <hr style="border-color: #333; margin: 16px 0;" />
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        // Email sending is non-critical — still return success
        console.error("Email send error:", emailErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
