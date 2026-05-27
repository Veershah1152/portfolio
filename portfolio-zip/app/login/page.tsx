"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Authentication failed", { description: error.message });
      } else {
        toast.success("Access granted");
        router.push(redirect);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-phosphor animate-pulse shadow-phosphor" />
            <span className="font-mono text-xs tracking-[0.3em] text-phosphor uppercase">
              Admin Access
            </span>
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            Authentication Required
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            Provide credentials to access the control panel.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-card/80 ring-1 ring-border rounded-lg p-6 glass-card"
        >
          {/* Email */}
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
            >
              Identity
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-background/60 ring-1 ring-border focus:ring-phosphor outline-none rounded font-mono text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="block font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
            >
              Passphrase
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-background/60 ring-1 ring-border focus:ring-phosphor outline-none rounded font-mono text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-phosphor text-void py-2.5 text-sm font-semibold rounded hover:shadow-phosphor active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed font-mono tracking-widest uppercase mt-2"
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Authenticating</>
            ) : (
              <><Lock className="size-4" /> Authenticate</>
            )}
          </button>
        </form>

        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground tracking-wider">
          ENCRYPTED CONNECTION · TLS 1.3
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
