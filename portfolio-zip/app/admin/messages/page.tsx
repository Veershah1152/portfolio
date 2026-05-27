import { createClient } from "@/lib/supabase/server";
import { ClientMessagesPage } from "./client-page";
import type { ContactMessage } from "@/lib/supabase/types";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Inbox
        </p>
        <h1 className="text-2xl font-medium text-foreground">Contact Messages</h1>
      </div>

      <ClientMessagesPage initialMessages={messages || []} />
    </div>
  );
}
