import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/admin/PostForm";
import { notFound } from "next/navigation";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Transmissions
        </p>
        <h1 className="text-2xl font-medium text-foreground">Edit Entry</h1>
      </div>

      <PostForm initialData={post} />
    </div>
  );
}
