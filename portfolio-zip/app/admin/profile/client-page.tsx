"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

interface ClientProfilePageProps {
  initialProfile: Profile | null;
}

export function ClientProfilePage({ initialProfile }: ClientProfilePageProps) {
  const [profile, setProfile] = useState<Partial<Profile>>(initialProfile || {});
  const [saving, setSaving] = useState(false);

  const [stats, setStats] = useState({
    ctfs: initialProfile?.stats?.ctfs ?? 0,
    vulnerabilities: initialProfile?.stats?.vulnerabilities ?? 0,
    commits: initialProfile?.stats?.commits ?? 0,
    streak: initialProfile?.stats?.streak ?? 0,
    projects: initialProfile?.stats?.projects ?? 0,
  });

  const [rolesInput, setRolesInput] = useState(initialProfile?.roles?.join(", ") || "");
  const [marqueeInput, setMarqueeInput] = useState(initialProfile?.marquee_items?.join(", ") || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStats((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const roles = rolesInput.split(",").map((r) => r.trim()).filter(Boolean);
    const marquee_items = marqueeInput.split(",").map((m) => m.trim().toUpperCase()).filter(Boolean);

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profile")
        .update({
          ...profile,
          stats,
          roles,
          marquee_items,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Profile Details */}
      <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
        <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
          // Operator Identity
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Operator Name</label>
            <input
              name="name"
              value={profile.name || ""}
              onChange={handleChange}
              required
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-name-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Professional Title</label>
            <input
              name="title"
              value={profile.title || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-title-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Location</label>
            <input
              name="location"
              value={profile.location || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-location-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Email Uplink</label>
            <input
              name="email"
              type="email"
              value={profile.email || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-email-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Availability Status</label>
            <select
              name="status"
              value={profile.status || "available"}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-status-input"
            >
              <option value="available">Available / Open To Work</option>
              <option value="busy">Busy / Active Projects</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Terminal Title</label>
            <input
              name="terminal_title"
              value={profile.terminal_title || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-terminal-title-input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Bio / Dossier summary</label>
          <textarea
            name="bio"
            value={profile.bio || ""}
            onChange={handleChange}
            rows={3}
            className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground resize-none"
            id="profile-bio-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Secondary Bio (Detailed)</label>
          <textarea
            name="bio_secondary"
            value={profile.bio_secondary || ""}
            onChange={handleChange}
            rows={4}
            className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground resize-none"
            id="profile-bio-secondary-input"
          />
        </div>
      </div>

      {/* Stats and Layout Config */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Statistics panel */}
        <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
            // Metrics / Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">CTF Score</label>
              <input
                type="number"
                name="ctfs"
                value={stats.ctfs}
                onChange={handleStatChange}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-ctfs-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Vulns Found</label>
              <input
                type="number"
                name="vulnerabilities"
                value={stats.vulnerabilities}
                onChange={handleStatChange}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-vulnerabilities-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Git Commits</label>
              <input
                type="number"
                name="commits"
                value={stats.commits}
                onChange={handleStatChange}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-commits-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Commit Streak</label>
              <input
                type="number"
                name="streak"
                value={stats.streak}
                onChange={handleStatChange}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-streak-input"
              />
            </div>
          </div>
        </div>

        {/* Roles and Marquee config */}
        <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
          <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
            // Interface Customization
          </h2>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">System Roles (comma separated)</label>
              <input
                value={rolesInput}
                onChange={(e) => setRolesInput(e.target.value)}
                placeholder="/usr/bin/developer, /usr/bin/builder"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-roles-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Marquee Items (comma separated)</label>
              <input
                value={marqueeInput}
                onChange={(e) => setMarqueeInput(e.target.value)}
                placeholder="TYPESCRIPT, REACT, NEXT_JS, SUPABASE"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="profile-marquee-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Network Links */}
      <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
        <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
          // External Network Uplinks
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Avatar URL</label>
            <input
              name="avatar_url"
              value={profile.avatar_url || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-avatar-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resume URL</label>
            <input
              name="resume_url"
              value={profile.resume_url || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-resume-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">GitHub URL</label>
            <input
              name="github_url"
              value={profile.github_url || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-github-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">LinkedIn URL</label>
            <input
              name="linkedin_url"
              value={profile.linkedin_url || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-linkedin-input"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Twitter URL</label>
            <input
              name="twitter_url"
              value={profile.twitter_url || ""}
              onChange={handleChange}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="profile-twitter-input"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-4 z-10 bg-panel/90 backdrop-blur ring-1 ring-border rounded-xl p-4 flex items-center justify-end shadow-phosphor-soft">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-phosphor text-void font-semibold rounded-lg hover:shadow-phosphor active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-widest"
          id="profile-save-btn"
        >
          {saving ? (
            <><Loader2 className="size-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="size-4" /> Save Profile</>
          )}
        </button>
      </div>
    </form>
  );
}
