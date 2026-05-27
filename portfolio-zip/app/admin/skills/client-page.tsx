"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Check, X, Loader2, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/lib/supabase/types";

interface ClientSkillsPageProps {
  initialSkills: Skill[];
}

export function ClientSkillsPage({ initialSkills }: ClientSkillsPageProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states for adding/editing
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [percentage, setPercentage] = useState(80);
  const [isLearning, setIsLearning] = useState(false);
  const [orderIndex, setOrderIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const supabase = createClient();

  // Group skills by category
  const categories = Array.from(new Set(skills.map((s) => s.category)));

  const handleEditStart = (skill: Skill) => {
    setEditingId(skill.id);
    setName(skill.name);
    setCategory(skill.category);
    setPercentage(skill.percentage || 0);
    setIsLearning(skill.is_learning);
    setOrderIndex(skill.order_index || 0);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setCategory("");
    setPercentage(80);
    setIsLearning(false);
    setOrderIndex(0);
  };

  const handleSave = async (id?: string) => {
    if (!name || !category) {
      toast.error("Name and Category are required");
      return;
    }

    setSaving(true);
    try {
      if (id) {
        // Edit mode
        const { error } = await supabase
          .from("skills")
          .update({
            name: name.trim(),
            category: category.trim(),
            percentage: isLearning ? null : percentage,
            is_learning: isLearning,
            order_index: orderIndex,
          })
          .eq("id", id);

        if (error) throw error;

        setSkills((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  name: name.trim(),
                  category: category.trim(),
                  percentage: isLearning ? undefined : percentage,
                  is_learning: isLearning,
                  order_index: orderIndex,
                }
              : s
          )
        );
        setEditingId(null);
        toast.success("Skill updated");
      } else {
        // Add mode
        const { data, error } = await supabase
          .from("skills")
          .insert({
            name: name.trim(),
            category: category.trim(),
            percentage: isLearning ? null : percentage,
            is_learning: isLearning,
            order_index: orderIndex,
          })
          .select()
          .single();

        if (error) throw error;

        setSkills((prev) => [...prev, data]);
        setShowAddForm(false);
        toast.success("Skill added successfully");
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
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;

      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success("Skill removed");
    } catch (err) {
      toast.error("Failed to delete skill");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top action */}
      <div className="flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground">
          SKILL_COUNT: {skills.length.toString().padStart(2, "0")}
        </div>
        {!showAddForm && !editingId && (
          <button
            onClick={() => {
              setShowAddForm(true);
              setCategory(categories[0] || "");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-phosphor text-void font-mono text-xs uppercase tracking-widest rounded hover:shadow-phosphor transition-all"
            id="add-skill-btn"
          >
            <Plus className="size-3.5" /> Add Skill
          </button>
        )}
      </div>

      {/* Add New Skill Form (Inline block) */}
      {showAddForm && (
        <div className="bg-card ring-1 ring-phosphor/30 rounded-lg p-5 space-y-4">
          <h3 className="font-mono text-[11px] text-phosphor uppercase tracking-wider">// Compile New Skill</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Skill Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kotlin"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-1.5 font-mono text-xs text-foreground"
                id="new-skill-name"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Languages"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-1.5 font-mono text-xs text-foreground"
                id="new-skill-category"
              />
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Percentage ({percentage}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                disabled={isLearning}
                value={percentage}
                onChange={(e) => setPercentage(parseInt(e.target.value))}
                className="w-full h-8 accent-phosphor bg-transparent cursor-pointer"
                id="new-skill-percentage"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-center">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Learning Mode</label>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isLearning}
                  onChange={(e) => setIsLearning(e.target.checked)}
                  className="sr-only peer"
                  id="new-skill-is-learning"
                />
                <div className="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground peer-checked:after:bg-void after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-phosphor"></div>
                <span className="ml-2 font-mono text-[10px] text-muted-foreground uppercase">WIP</span>
              </label>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Index</label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-1.5 font-mono text-xs text-foreground"
                id="new-skill-order"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border/40">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ring-1 ring-border text-muted-foreground rounded hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 bg-phosphor text-void font-mono text-[10px] uppercase tracking-wider rounded hover:shadow-phosphor transition-all disabled:opacity-40"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Add
            </button>
          </div>
        </div>
      )}

      {/* Skills Grouped Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const catSkills = skills.filter((s) => s.category === cat).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          return (
            <div key={cat} className="bg-card ring-1 ring-border rounded-lg p-5 space-y-4">
              <h3 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.25em] border-b border-border/40 pb-2 flex justify-between">
                <span>{cat}</span>
                <span className="text-muted-foreground text-[9px]">{catSkills.length} entries</span>
              </h3>

              <div className="space-y-3">
                {catSkills.map((skill) => {
                  const isEditing = editingId === skill.id;
                  return (
                    <div key={skill.id} className="p-3 bg-background/40 ring-1 ring-border/40 rounded flex flex-col gap-2 transition-all">
                      {isEditing ? (
                        // Edit inputs
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-mono text-[8px] text-muted-foreground">Name</label>
                              <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-card ring-1 ring-border focus:ring-phosphor rounded px-2 py-1 font-mono text-[11px]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-mono text-[8px] text-muted-foreground">Category</label>
                              <input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-card ring-1 ring-border focus:ring-phosphor rounded px-2 py-1 font-mono text-[11px]"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <div className="space-y-1 col-span-2">
                              <label className="font-mono text-[8px] text-muted-foreground">Progress ({percentage}%)</label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                disabled={isLearning}
                                value={percentage}
                                onChange={(e) => setPercentage(parseInt(e.target.value))}
                                className="w-full accent-phosphor cursor-pointer"
                              />
                            </div>
                            <div className="space-y-1 flex flex-col justify-center">
                              <label className="font-mono text-[8px] text-muted-foreground mb-0.5">WIP</label>
                              <input
                                type="checkbox"
                                checked={isLearning}
                                onChange={(e) => setIsLearning(e.target.checked)}
                                className="size-3.5 accent-phosphor"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t border-border/20">
                            <button
                              onClick={handleCancel}
                              className="size-7 grid place-items-center rounded bg-secondary/40 border border-border text-muted-foreground"
                            >
                              <X className="size-3" />
                            </button>
                            <button
                              onClick={() => handleSave(skill.id)}
                              disabled={saving}
                              className="size-7 grid place-items-center rounded bg-phosphor text-void hover:shadow-phosphor transition-all disabled:opacity-40"
                            >
                              {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Standard view
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm text-foreground font-medium truncate">{skill.name}</h4>
                              {skill.is_learning ? (
                                <span className="flex items-center gap-0.5 text-[8px] font-mono uppercase bg-amber-flare/10 text-amber-flare ring-1 ring-amber-flare/20 px-1 py-0.2 rounded shrink-0">
                                  <BookOpen className="size-2" /> Learning
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] text-phosphor shrink-0">{skill.percentage}%</span>
                              )}
                            </div>
                            {!skill.is_learning && (
                              <div className="w-full bg-secondary/50 h-1 mt-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-phosphor h-full rounded-full transition-all duration-500"
                                  style={{ width: `${skill.percentage || 0}%` }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => handleEditStart(skill)}
                              className="size-7 grid place-items-center rounded hover:bg-secondary/60 text-muted-foreground hover:text-phosphor transition-colors"
                            >
                              <Edit2 className="size-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(skill.id)}
                              className="size-7 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
