import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { notFound } from "next/navigation";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Deployments
        </p>
        <h1 className="text-2xl font-medium text-foreground">Edit Deployment</h1>
      </div>

      <ProjectForm initialData={project} />
    </div>
  );
}
