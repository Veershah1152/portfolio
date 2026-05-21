import { SectionHeader } from "./About";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" className="py-24 px-6 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader index="04" label="Secure Uplink" title="Open a channel" />

        <div className="grid lg:grid-cols-12 gap-px mt-12 bg-border/60">
          <div className="lg:col-span-5 bg-background p-8 space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              I read every message. Hackathons, internships, recruiter intros,
              CTF teammates, or just a sharp question about Android internals —
              this channel is open.
            </p>

            <ul className="space-y-3 font-mono text-sm">
              {[
                { Icon: Mail, label: "aarav@sharma.sec", href: "mailto:aarav@sharma.sec" },
                { Icon: Github, label: "github.com/aarav-sharma", href: "#" },
                { Icon: Linkedin, label: "linkedin.com/in/aarav-sharma", href: "#" },
                { Icon: Twitter, label: "@aarav_sec", href: "#" },
              ].map(({ Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group flex items-center gap-3 text-muted-foreground hover:text-phosphor transition-colors"
                  >
                    <Icon className="size-4" />
                    <span className="border-b border-transparent group-hover:border-phosphor">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-border/60 space-y-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
                Status: accepting briefings
              </div>
              <div>Location: New Delhi · IN — 28.6139° N, 77.2090° E</div>
              <div>Response window: &lt; 24h</div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="lg:col-span-7 bg-background p-8 space-y-5"
          >
            <Field label="Identifier" name="name" placeholder="Your full name" />
            <Field label="Origin" name="email" type="email" placeholder="you@domain.tld" />
            <Field label="Subject" name="subject" placeholder="What is this about?" />
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                Transmission
              </label>
              <textarea
                rows={5}
                placeholder="Plain text. Markdown welcome."
                className="w-full bg-card/60 ring-1 ring-border focus:ring-phosphor outline-none rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 transition-all resize-none"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                {sent ? "TRANSMISSION ACK · queued" : "ENCRYPTION: AES-256 · 0-rtt"}
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-phosphor text-primary-foreground px-4 py-2 text-xs font-semibold rounded ring-1 ring-phosphor hover:shadow-phosphor active:scale-[0.98] transition-all uppercase tracking-widest"
              >
                {sent ? "Sent" : "Transmit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-card/60 ring-1 ring-border focus:ring-phosphor outline-none rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 transition-all"
      />
    </div>
  );
}
