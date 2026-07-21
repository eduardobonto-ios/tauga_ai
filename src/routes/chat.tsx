import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categorize } from "@/lib/categorize";
import { proxyChatMessage, proxyContactLead } from "@/lib/n8n-proxy";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with Cincinnati Hotel Concierge" },
      {
        name: "description",
        content: "Ask the Cincinnati Hotel AI concierge about rooms, dining, and amenities.",
      },
      { property: "og:title", content: "Cincinnati Hotel Concierge Chat" },
      {
        property: "og:description",
        content: "Real-time AI answers based on the hotel information document.",
      },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const FALLBACK_HINTS = [
  /i(?:'m| am) sorry/i,
  /don'?t have that information/i,
  /i don'?t know/i,
  /not sure/i,
  /no information/i,
  /cannot find/i,
  /couldn'?t find/i,
];

function looksUnanswered(text: string) {
  return FALLBACK_HINTS.some((rx) => rx.test(text));
}

function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>(
    "https://eduardobonto.app.n8n.cloud/webhook/hotel-chat",
  );
  const [contactWebhookUrl, setContactWebhookUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Welcome to Cincinnati Hotel. I'm your virtual concierge — ask me about our rooms, dining, amenities or services.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [lastUnanswered, setLastUnanswered] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // create a session + fetch settings once
  useEffect(() => {
    (async () => {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("chat_webhook_url, contact_webhook_url")
        .eq("id", 1)
        .maybeSingle();
      if (settings?.chat_webhook_url) setWebhookUrl(settings.chat_webhook_url);
      if (settings?.contact_webhook_url) setContactWebhookUrl(settings.contact_webhook_url);
      const { data } = await supabase
        .from("chat_sessions")
        .insert({})
        .select("id")
        .single();
      if (data?.id) setSessionId(data.id);
    })();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [sending]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setSending(true);

    const category = categorize(text);

    try {
      // Forwarded through our own server (see src/lib/n8n-proxy.ts) instead of
      // fetching n8n directly from the browser, which n8n's webhook blocks
      // with a CORS error before we ever see its real response.
      const result = await proxyChatMessage({
        data: { url: webhookUrl, sessionId, message: text, history: nextMessages },
      });
      if (!result.ok) {
        throw new Error(result.message || `Request failed (${result.status})`);
      }
      let reply = "";
      if (result.contentType.includes("application/json")) {
        const j = JSON.parse(result.body);
        reply =
          j.reply ??
          j.output ??
          j.answer ??
          j.message ??
          j.text ??
          (typeof j === "string" ? j : "") ??
          "";
        if (!reply && Array.isArray(j) && j[0]) {
          reply = j[0].reply ?? j[0].output ?? j[0].answer ?? j[0].text ?? "";
        }
      } else {
        reply = result.body;
      }
      reply =
        reply?.toString().trim() ||
        "I'm sorry, I don't have that information right now.";

      const unanswered = looksUnanswered(reply);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);

      if (sessionId) {
        await supabase.from("questions").insert({
          session_id: sessionId,
          category,
          question: text,
          answered: !unanswered,
        });
      }

      if (unanswered) {
        setLastUnanswered(text);
        setShowContact(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having trouble reaching the concierge right now. Please try again in a moment.",
        },
      ]);
      toast.error("Could not reach the concierge service.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-gold">
              Cincinnati Hotel
            </div>
            <h1 className="text-xl">Concierge</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {messages.map((m, i) => (
          <Bubble key={i} msg={m} />
        ))}
        {sending && (
          <div className="flex items-center gap-1 self-start rounded-2xl bg-muted px-4 py-3 text-muted-foreground">
            <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
          </div>
        )}
        {showContact && lastUnanswered && (
          <ContactCard
            sessionId={sessionId}
            question={lastUnanswered}
            conversation={messages}
            contactWebhookUrl={contactWebhookUrl}
            onDone={() => setShowContact(false)}
          />
        )}
      </div>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask about rooms, dining, amenities..."
            className="min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        </div>
      </footer>
    </main>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
        isUser
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-card text-card-foreground"
      }`}
    >
      {msg.content}
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="inline-block h-2 w-2 animate-bounce rounded-full bg-current"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

function ContactCard({
  sessionId,
  question,
  conversation,
  contactWebhookUrl,
  onDone,
}: {
  sessionId: string | null;
  question: string;
  conversation: Msg[];
  contactWebhookUrl: string | null;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const valid = useMemo(
    () => form.name.trim() && form.phone.trim() && /.+@.+\..+/.test(form.email),
    [form],
  );

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    const { error } = await supabase.from("contact_leads").insert({
      session_id: sessionId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      unanswered_question: question,
      conversation: conversation as unknown as never,
    });
    if (error) {
      setSaving(false);
      toast.error("Could not send your details. Please try again.");
      return;
    }
    // The lead is safely stored above regardless of what happens next, so a
    // failure here shouldn't block the guest's "thank you" confirmation —
    // it just means the internal email notification didn't go out.
    if (contactWebhookUrl) {
      const result = await proxyContactLead({
        data: {
          url: contactWebhookUrl,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          question,
          conversation,
        },
      });
      if (!result.ok) {
        console.error("Contact-lead email notification failed:", result.message);
      }
    }
    setSaving(false);
    toast.success("Thank you — our team will reach out shortly.");
    onDone();
  }

  return (
    <div className="self-start w-full max-w-md rounded-2xl border border-gold/40 bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-gold">
        <Mail className="h-4 w-4" />
        <div className="text-xs uppercase tracking-[0.2em]">Leave your details</div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        We'll have a Cincinnati Hotel representative follow up personally.
      </p>
      <div className="space-y-2">
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onDone}
          className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
        <button
          onClick={submit}
          disabled={!valid || saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          {saving ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
