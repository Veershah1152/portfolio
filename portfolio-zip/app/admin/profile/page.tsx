import { createClient } from "@/lib/supabase/server";
import { ClientProfilePage } from "./client-page";
import type { Profile } from "@/lib/supabase/types";

export default async function AdminProfilePage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Settings
        </p>
        <h1 className="text-2xl font-medium text-foreground">Edit Operator Profile</h1>
      </div>

      <ClientProfilePage initialProfile={profile} />
    </div>
  );
}
