"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Mail, MailOpen, Trash2, Calendar, User, ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactMessage } from "@/lib/supabase/types";

interface ClientMessagesPageProps {
  initialMessages: ContactMessage[];
}

export function ClientMessagesPage({ initialMessages }: ClientMessagesPageProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const supabase = createClient();

  const handleMarkRead = async (msg: ContactMessage, read: boolean) => {
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ read })
        .eq("id", msg.id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read } : m))
      );

      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) => (prev ? { ...prev, read } : null));
      }

      toast.success(read ? "Marked as read" : "Marked as unread");
    } catch (err) {
      toast.error("Failed to update message status");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
      console.error(err);
    }
  };

  const handleSelectMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await handleMarkRead(msg, true);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left panel: list of messages */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters */}
        <div className="flex gap-1.5 border-b border-border/40 pb-3">
          {(["all", "unread", "read"] as const).map((f) => (
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
              {f} ({messages.filter((m) => f === "all" || (f === "unread" ? !m.read : m.read)).length})
            </button>
          ))}
        </div>

        {/* Message Items */}
        <div className="space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {filteredMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all flex flex-col gap-1.5",
                selectedMessage?.id === msg.id
                  ? "bg-phosphor/5 border-phosphor/50 shadow-phosphor-soft"
                  : msg.read
                  ? "bg-card/40 border-border/60 opacity-70 hover:opacity-100 hover:border-border"
                  : "bg-card border-border/90 font-medium hover:border-phosphor/40"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> {formatDate(msg.created_at)}
                </span>
                {!msg.read && (
                  <span className="size-1.5 rounded-full bg-amber-flare shadow-amber animate-pulse shrink-0" />
                )}
              </div>
              <h3 className="text-sm text-foreground truncate">{msg.subject || "No Subject"}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate">
                {msg.name} &lt;{msg.email}&gt;
              </p>
            </button>
          ))}

          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm border border-dashed border-border/60 rounded-lg">
              No messages found.
            </div>
          )}
        </div>
      </div>

      {/* Right panel: message detail */}
      <div className="lg:col-span-3">
        {selectedMessage ? (
          <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-6 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header metadata */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/40">
                <div className="space-y-1.5 min-w-0">
                  <span className="font-mono text-[10px] text-phosphor tracking-wider uppercase">
                    Transmission ID: {selectedMessage.id.slice(0, 8).toUpperCase()}
                  </span>
                  <h2 className="text-lg font-medium text-foreground leading-snug">
                    {selectedMessage.subject || "No Subject"}
                  </h2>
                  <div className="flex flex-col gap-0.5 font-mono text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User className="size-3.5 text-phosphor" /> {selectedMessage.name}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1.5 hover:text-phosphor transition-colors">
                      <Mail className="size-3.5" /> {selectedMessage.email}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleMarkRead(selectedMessage, !selectedMessage.read)}
                    className="size-8 grid place-items-center rounded bg-secondary/50 border border-border/60 hover:text-phosphor hover:border-phosphor/40 transition-all text-muted-foreground"
                    title={selectedMessage.read ? "Mark as unread" : "Mark as read"}
                  >
                    {selectedMessage.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="size-8 grid place-items-center rounded bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all"
                    title="Delete message"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-background/30 p-4 rounded border border-border/40 min-h-[180px]">
                {selectedMessage.message}
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="size-3" /> Received: {new Date(selectedMessage.created_at).toLocaleString()}</span>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Portfolio Contact"}`}
                className="flex items-center gap-1 text-phosphor hover:text-foreground transition-colors uppercase tracking-wider font-semibold"
              >
                Draft Reply <ArrowRight className="size-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/60 rounded-lg min-h-[400px]">
            <MessageSquare className="size-12 text-muted-foreground/35 mb-4" />
            <p className="font-mono text-sm text-muted-foreground">
              Select a message from the terminal feed to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
