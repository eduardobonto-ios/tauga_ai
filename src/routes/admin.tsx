import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Upload, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS, type Category } from "@/lib/categorize";
import { proxyPdfUpload } from "@/lib/n8n-proxy";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Cincinnati Hotel Concierge" },
      {
        name: "description",
        content:
          "Upload the hotel knowledge PDF and view live chatbot statistics.",
      },
      { property: "og:title", content: "Cincinnati Hotel Admin Dashboard" },
      {
        property: "og:description",
        content: "Manage the AI concierge PDF and monitor live chat analytics.",
      },
    ],
  }),
  component: AdminPage,
});

type Settings = {
  pdf_name: string | null;
  pdf_uploaded_at: string | null;
  pdf_webhook_url: string | null;
  chat_webhook_url: string;
  contact_webhook_url: string | null;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function AdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [rows, setRows] = useState<{ category: string; answered: boolean }[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pdfHook, setPdfHook] = useState("");
  const [chatHook, setChatHook] = useState("");
  const [contactHook, setContactHook] = useState("");

  async function refresh() {
    const [{ data: s }, sess, qs, leads] = await Promise.all([
      supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("category, answered"),
      supabase.from("contact_leads").select("id", { count: "exact", head: true }),
    ]);
    if (s) {
      setSettings(s as Settings);
      setPdfHook(s.pdf_webhook_url ?? "");
      setChatHook(s.chat_webhook_url ?? "");
      setContactHook(s.contact_webhook_url ?? "");
    }
    setSessionsCount(sess.count ?? 0);
    setRows((qs.data as { category: string; answered: boolean }[]) ?? []);
    setLeadsCount(leads.count ?? 0);
  }

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("admin-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_leads" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1;
    return (Object.keys(CATEGORY_LABELS) as Category[]).map((k) => ({
      name: CATEGORY_LABELS[k],
      questions: counts[k] ?? 0,
    }));
  }, [rows]);

  const unanswered = rows.filter((r) => !r.answered).length;

  async function saveSettings() {
    const { error } = await supabase
      .from("app_settings")
      .update({
        pdf_webhook_url:
          pdfHook || "https://eduardobonto.app.n8n.cloud/webhook/hotel-admin-upload",
        chat_webhook_url: chatHook || "https://eduardobonto.app.n8n.cloud/webhook/hotel-chat",
        contact_webhook_url: contactHook || null,
      })
      .eq("id", 1);
    if (error) toast.error("Could not save settings");
    else {
      toast.success("Settings saved");
      refresh();
    }
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    const target = pdfHook || settings?.pdf_webhook_url || settings?.chat_webhook_url;
    if (!target) {
      toast.error("Configure a PDF webhook URL first.");
      return;
    }
    setUploading(true);
    try {
      const fileBase64 = await fileToBase64(file);
      // Forwarded through our own server (see src/lib/n8n-proxy.ts) instead of
      // fetching n8n directly from the browser, which n8n's webhook blocks
      // with a CORS error before we ever see its real response. The n8n
      // workflow expects the PDF as a base64 string in a JSON body (its
      // "Has File?" node checks $json.body.fileBase64), not a multipart
      // file upload.
      const result = await proxyPdfUpload({
        data: { url: target, fileName: file.name, fileBase64 },
      });
      if (!result.ok) {
        throw new Error(result.message || `Upload failed (${result.status})`);
      }
      await supabase
        .from("app_settings")
        .update({ pdf_name: file.name, pdf_uploaded_at: new Date().toISOString() })
        .eq("id", 1);
      toast.success("PDF forwarded to n8n and recorded.");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
            <h1 className="text-xl">Admin Dashboard</h1>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-3">
        <Stat label="Chat sessions" value={sessionsCount} />
        <Stat label="Questions asked" value={rows.length} />
        <Stat label="Contact leads" value={leadsCount} accent />

        <section className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl">Questions by topic</h2>
            <span className="text-xs text-muted-foreground">
              {unanswered} unanswered
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="questions" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-xl">Knowledge base</h2>
          <div className="mb-4 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Current PDF</span>
            </div>
            <div className="mt-1 font-medium">
              {settings?.pdf_name ?? "No PDF uploaded yet"}
            </div>
            {settings?.pdf_uploaded_at && (
              <div className="mt-1 text-xs text-muted-foreground">
                Updated {new Date(settings.pdf_uploaded_at).toLocaleString()}
              </div>
            )}
          </div>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 bg-gold/5 p-6 text-center text-sm transition hover:bg-gold/10 ${
              uploading ? "opacity-60" : ""
            }`}
          >
            <Upload className="h-5 w-5 text-gold" />
            <span className="font-medium">
              {uploading ? "Uploading…" : "Upload new PDF"}
            </span>
            <span className="text-xs text-muted-foreground">
              Replaces the previous file. Sent to n8n for indexing.
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onUpload}
              disabled={uploading}
            />
          </label>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-card ${
        accent
          ? "border-gold/40 bg-gold/10"
          : "border-border bg-card"
      }`}
    >
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-4xl font-semibold">{value}</div>
    </div>
  );
}
