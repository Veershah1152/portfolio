import { createClient } from "@/lib/supabase/server";
import { ClientBlogListPage } from "./client-page";
import type { Post } from "@/lib/supabase/types";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Transmissions
        </p>
        <h1 className="text-2xl font-medium text-foreground">Blog Log</h1>
      </div>

      <ClientBlogListPage initialPosts={posts || []} />
    </div>
  );
}
