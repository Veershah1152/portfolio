"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GitBranch, Link as LinkIcon, AtSign, Mail, Send, Loader2, MapPin, Clock } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { SectionHeader } from "./About";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject is required").optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

interface ContactProps {
  profile: Profile;
}

export function Contact({ profile }: ContactProps) {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const socials = [
    { Icon: Mail, label: profile.email || "Email", href: profile.email ? `mailto:${profile.email}` : "#" },
    { Icon: GitBranch, label: profile.github_url ? "GitHub" : null, href: profile.github_url || "#" },
    { Icon: LinkIcon, label: profile.linkedin_url ? "LinkedIn" : null, href: profile.linkedin_url || "#" },
    { Icon: AtSign, label: profile.twitter_url ? "Twitter" : null, href: profile.twitter_url || "#" },
  ].filter((s) => s.label);

  const onSubmit = async (data: ContactForm) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
      reset();
      toast.success("Message transmitted successfully!", {
        description: "I'll get back to you within 24 hours.",
      });
    } catch {
      toast.error("Transmission failed", {
        description: "Please try again or email directly.",
      });
    }
  };

  return (
    <section id="contact" className="py-24 px-6 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader index="05" label="Secure Uplink" title="Open a channel" />

        <div className="grid lg:grid-cols-12 gap-px mt-12 bg-border/60">
          {/* Left: info */}
          <div className="lg:col-span-5 bg-background p-8 space-y-8">
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio_secondary || "I read every message. Let's connect."}
            </p>

            <ul className="space-y-3 font-mono text-sm">
              {socials.map(({ Icon, label, href }) => (
                <li key={String(label)}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-3 text-muted-foreground hover:text-phosphor transition-colors"
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="border-b border-transparent group-hover:border-phosphor truncate">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-border/60 space-y-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "size-1.5 rounded-full",
                  profile.status === "available" ? "bg-phosphor animate-pulse" : "bg-amber-flare"
                )} />
                Status:{" "}
                {profile.status === "available"
                  ? "Accepting briefings"
                  : profile.status === "busy"
                  ? "Limited availability"
                  : "Currently unavailable"}
              </div>
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-3" />
                  Location: {profile.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="size-3" />
                Response: &lt; 24h
              </div>
            </div>
          </div>

          {/* Right: form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-7 bg-background p-8 space-y-5"
          >
            <AnimatePresence>
              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-phosphor/10 ring-1 ring-phosphor/30 rounded font-mono text-sm text-phosphor"
                >
                  ✓ Transmission acknowledged. I&apos;ll be in touch soon.
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Identifier"
              id="contact-name"
              placeholder="Your full name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Field
              label="Origin"
              id="contact-email"
              type="email"
              placeholder="you@domain.tld"
              error={errors.email?.message}
              {...register("email")}
            />
            <Field
              label="Subject"
              id="contact-subject"
              placeholder="What is this about?"
              error={errors.subject?.message}
              {...register("subject")}
            />

            <div className="space-y-2">
              <label
                htmlFor="contact-message"
                className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
              >
                Transmission
              </label>
              <textarea
                id="contact-message"
                rows={5}
                placeholder="Plain text. Markdown welcome."
                className={cn(
                  "w-full bg-card/60 ring-1 outline-none rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 transition-all resize-none",
                  errors.message ? "ring-destructive/60" : "ring-border focus:ring-phosphor"
                )}
                {...register("message")}
              />
              {errors.message && (
                <p className="text-[11px] font-mono text-destructive">{errors.message.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                ENCRYPTION: TLS 1.3 · 0-RTT
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-phosphor text-void px-4 py-2 text-xs font-semibold rounded ring-1 ring-phosphor hover:shadow-phosphor active:scale-[0.98] transition-all uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Sending</>
                ) : (
                  <><Send className="size-3.5" /> Transmit</>
                )}
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
  id,
  type = "text",
  placeholder,
  error,
  ...rest
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full bg-card/60 ring-1 outline-none rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 transition-all",
          error ? "ring-destructive/60" : "ring-border focus:ring-phosphor"
        )}
        {...rest}
      />
      {error && (
        <p className="text-[11px] font-mono text-destructive">{error}</p>
      )}
    </div>
  );
}
