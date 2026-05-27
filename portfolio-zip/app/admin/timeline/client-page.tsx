"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, Loader2, Calendar, Briefcase, GraduationCap, Trophy, Award, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineEntry, TimelineType } from "@/lib/supabase/types";

interface ClientTimelinePageProps {
  initialTimeline: TimelineEntry[];
}

const typeConfig: Record<TimelineType, { label: string; icon: React.ElementType; color: string }> = {
  work: { label: "Work / Experience", icon: Briefcase, color: "text-phosphor" },
  education: { label: "Education", icon: GraduationCap, color: "text-phosphor" },
  achievement: { label: "Achievement", icon: Trophy, color: "text-amber-flare" },
  certification: { label: "Certification", icon: Award, color: "text-amber-flare" },
};

export function ClientTimelinePage({ initialTimeline }: ClientTimelinePageProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [type, setType] = useState<TimelineType>("work");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [icon, setIcon] = useState("Briefcase");
  const [tagsInput, setTagsInput] = useState("");
  const [url, setUrl] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | TimelineType>("all");

  const supabase = createClient();

  const handleEditStart = (entry: TimelineEntry) => {
    setEditingId(entry.id);
    setType(entry.type);
    setTitle(entry.title);
    setOrganization(entry.organization || "");
    setDescription(entry.description || "");
    setStartDate(entry.start_date || "");
    setEndDate(entry.end_date || "");
    setIcon(entry.icon || "Briefcase");
    setTagsInput(entry.tags?.join(", ") || "");
    setUrl(entry.url || "");
    setOrderIndex(entry.order_index || 0);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setType("work");
    setTitle("");
    setOrganization("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIcon("Briefcase");
    setTagsInput("");
    setUrl("");
    setOrderIndex(0);
  };

  const handleSave = async (id?: string) => {
    if (!title || !startDate) {
      toast.error("Title and Start Date are required");
      return;
    }

    setSaving(true);
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

    const payload = {
      type,
      title: title.trim(),
      organization: organization.trim() || null,
      description: description.trim() || null,
      start_date: startDate,
      end_date: endDate || null,
      icon,
      tags,
      url: url.trim() || null,
      order_index: orderIndex,
    };

    try {
      if (id) {
        // Update
        const { error } = await supabase
          .from("timeline")
          .update(payload)
          .eq("id", id);

        if (error) throw error;

        setTimeline((prev) =>
          prev.map((t) => (t.id === id ? ({ ...t, ...payload, tags } as any) : t))
        );
        setEditingId(null);
        toast.success("Timeline entry updated");
      } else {
        // Insert
        const { data, error } = await supabase
          .from("timeline")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        setTimeline((prev) => [data, ...prev]);
        setShowAddForm(false);
        toast.success("Timeline entry created");
      }
      resetForm();
    } catch (err) {
      toast.error("Operation failed");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;

    try {
      const { error } = await supabase.from("timeline").delete().eq("id", id);
      if (error) throw error;

      setTimeline((prev) => prev.filter((t) => t.id !== id));
      toast.success("Log entry removed");
    } catch (err) {
      toast.error("Failed to delete log");
      console.error(err);
    }
  };

  const filteredTimeline = timeline.filter((t) => filter === "all" || t.type === filter);

  return (
    <div className="space-y-8">
      {/* Filters and Add btn */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div className="flex flex-wrap gap-1.5">
          {(["all", "work", "education", "achievement", "certification"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded ring-1 transition-all",
                filter === f
                  ? "bg-phosphor text-void ring-phosphor"
                  : "text-muted-foreground ring-border hover:ring-phosphor/30"
              )}
            >
              {f} ({timeline.filter((t) => f === "all" || t.type === f).length})
            </button>
          ))}
        </div>
        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-phosphor text-void font-mono text-xs uppercase tracking-widest rounded hover:shadow-phosphor transition-all self-end sm:self-auto"
            id="add-timeline-btn"
          >
            <Plus className="size-3.5" /> Add Log Entry
          </button>
        )}
      </div>

      {/* Add / Edit Form Area */}
      {(showAddForm || editingId) && (
        <div className="bg-card ring-1 ring-phosphor/30 rounded-lg p-6 space-y-4">
          <h3 className="font-mono text-[11px] text-phosphor uppercase tracking-wider">
            {editingId ? "// Modify Chronology Log" : "// Append Chronology Log"}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as TimelineType;
                  setType(t);
                  // Auto choose matching icon defaults
                  if (t === "work") setIcon("Briefcase");
                  else if (t === "education") setIcon("GraduationCap");
                  else if (t === "achievement") setIcon("Trophy");
                  else if (t === "certification") setIcon("Award");
                }}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-type"
              >
                <option value="work">Work / Experience</option>
                <option value="education">Education</option>
                <option value="achievement">Achievement</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                required
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-title"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Organization</label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Google / Stanford University"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-org"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-start"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">End Date (leave blank for Present)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-end"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Log Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-icon"
              >
                <option value="Briefcase">Briefcase</option>
                <option value="GraduationCap">GraduationCap</option>
                <option value="Trophy">Trophy</option>
                <option value="Award">Award</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Next.js, Rust, Kubernetes"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-tags"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Attachment Link URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. https://credential-link.com"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                id="timeline-form-link"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detail your responsibilities, course syllabus, or details of the award..."
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground resize-none"
              id="timeline-form-description"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-border/40">
            <button
              onClick={handleCancel}
              className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider ring-1 ring-border text-muted-foreground rounded hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(editingId || undefined)}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 bg-phosphor text-void font-mono text-[10px] uppercase tracking-wider rounded hover:shadow-phosphor transition-all disabled:opacity-40"
              id="timeline-form-save-btn"
            >
              {saving ? (
                <><Loader2 className="size-3 animate-spin" /> Saving...</>
              ) : (
                <><Check className="size-3.5" /> Save Entry</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Logs Feed */}
      <div className="space-y-4">
        {filteredTimeline.map((item) => {
          const cfg = typeConfig[item.type] || typeConfig.work;
          const Icon = cfg.icon;
          return (
            <div
              key={item.id}
              className={cn(
                "bg-card/45 border hover:bg-card/60 p-5 rounded-lg flex flex-col md:flex-row gap-4 items-start transition-all",
                editingId === item.id ? "ring-1 ring-phosphor border-phosphor/50" : "border-border/60"
              )}
            >
              {/* Type icon indicator */}
              <div className={cn("size-9 grid place-items-center rounded bg-secondary/50 border border-border/40 shrink-0", cfg.color)}>
                <Icon className="size-4" />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                    {cfg.label}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {item.start_date} {item.end_date ? `to ${item.end_date}` : "to Present"}
                  </span>
                </div>
                
                <h3 className="text-base text-foreground font-medium">{item.title}</h3>
                {item.organization && (
                  <p className="text-xs text-phosphor/90 font-mono">{item.organization}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[70ch] whitespace-pre-wrap">{item.description}</p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.2 text-[8px] font-mono uppercase bg-secondary text-muted-foreground rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[9px] font-mono uppercase text-phosphor hover:underline pt-1"
                  >
                    <LinkIcon className="size-2.5" /> Attachment Link
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 shrink-0 self-end md:self-start pt-2 md:pt-0">
                <button
                  onClick={() => handleEditStart(item)}
                  className="size-8 grid place-items-center rounded hover:bg-secondary/75 text-muted-foreground hover:text-phosphor transition-colors border border-transparent hover:border-border/60"
                  title="Edit entry"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="size-8 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                  title="Delete entry"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTimeline.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-lg">
            <p className="font-mono text-sm text-muted-foreground">No events recorded in this epoch.</p>
          </div>
        )}
      </div>
    </div>
  );
}
