import { createClient } from "@/lib/supabase/server";
import { ClientTimelinePage } from "./client-page";
import type { TimelineEntry } from "@/lib/supabase/types";

export default async function AdminTimelinePage() {
  const supabase = await createClient();

  const { data: timeline } = await supabase
    .from("timeline")
    .select("*")
    .order("start_date", { ascending: false });

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Chronology
        </p>
        <h1 className="text-2xl font-medium text-foreground">Timeline Logs</h1>
      </div>

      <ClientTimelinePage initialTimeline={timeline || []} />
    </div>
  );
}
