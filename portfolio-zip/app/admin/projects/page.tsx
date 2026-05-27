import { createClient } from "@/lib/supabase/server";
import { ClientProjectsListPage } from "./client-page";
import type { Project } from "@/lib/supabase/types";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("order_index")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Deployments
        </p>
        <h1 className="text-2xl font-medium text-foreground">Manage Repository</h1>
      </div>

      <ClientProjectsListPage initialProjects={projects || []} />
    </div>
  );
}
