import { createClient } from "@/lib/supabase/server";
import { ClientSkillsPage } from "./client-page";
import type { Skill } from "@/lib/supabase/types";

export default async function AdminSkillsPage() {
  const supabase = await createClient();

  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("category")
    .order("order_index");

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Stack Settings
        </p>
        <h1 className="text-2xl font-medium text-foreground">Manage Skill Matrix</h1>
      </div>

      <ClientSkillsPage initialSkills={skills || []} />
    </div>
  );
}
