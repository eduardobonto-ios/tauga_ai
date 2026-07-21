import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Br2YKhHo.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as proxyPdfUpload, t as CATEGORY_LABELS } from "./n8n-proxy-Co8IS902.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as RefreshCw, c as ArrowLeft, n as Upload, s as FileText } from "../_libs/lucide-react.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BMpc1cXP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			const comma = result.indexOf(",");
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}
function AdminPage() {
	const [settings, setSettings] = (0, import_react.useState)(null);
	const [sessionsCount, setSessionsCount] = (0, import_react.useState)(0);
	const [rows, setRows] = (0, import_react.useState)([]);
	const [leadsCount, setLeadsCount] = (0, import_react.useState)(0);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [pdfHook, setPdfHook] = (0, import_react.useState)("");
	const [chatHook, setChatHook] = (0, import_react.useState)("");
	const [contactHook, setContactHook] = (0, import_react.useState)("");
	async function refresh() {
		const [{ data: s }, sess, qs, leads] = await Promise.all([
			supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
			supabase.from("chat_sessions").select("id", {
				count: "exact",
				head: true
			}),
			supabase.from("questions").select("category, answered"),
			supabase.from("contact_leads").select("id", {
				count: "exact",
				head: true
			})
		]);
		if (s) {
			setSettings(s);
			setPdfHook(s.pdf_webhook_url ?? "");
			setChatHook(s.chat_webhook_url ?? "");
			setContactHook(s.contact_webhook_url ?? "");
		}
		setSessionsCount(sess.count ?? 0);
		setRows(qs.data ?? []);
		setLeadsCount(leads.count ?? 0);
	}
	(0, import_react.useEffect)(() => {
		refresh();
		const channel = supabase.channel("admin-stats").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "questions"
		}, refresh).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "chat_sessions"
		}, refresh).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "contact_leads"
		}, refresh).subscribe();
		return () => {
			supabase.removeChannel(channel);
		};
	}, []);
	const chartData = (0, import_react.useMemo)(() => {
		const counts = {};
		for (const r of rows) counts[r.category] = (counts[r.category] ?? 0) + 1;
		return Object.keys(CATEGORY_LABELS).map((k) => ({
			name: CATEGORY_LABELS[k],
			questions: counts[k] ?? 0
		}));
	}, [rows]);
	const unanswered = rows.filter((r) => !r.answered).length;
	async function onUpload(e) {
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
			const result = await proxyPdfUpload({ data: {
				url: target,
				fileName: file.name,
				fileBase64
			} });
			if (!result.ok) throw new Error(result.message || `Upload failed (${result.status})`);
			await supabase.from("app_settings").update({
				pdf_name: file.name,
				pdf_uploaded_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", 1);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-border bg-card",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-6 py-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Home"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs uppercase tracking-[0.25em] text-gold",
							children: "Cincinnati Hotel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl",
							children: "Admin Dashboard"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: refresh,
						className: "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Refresh"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Chat sessions",
					value: sessionsCount
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Questions asked",
					value: rows.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Contact leads",
					value: leadsCount,
					accent: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-baseline justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl",
							children: "Questions by topic"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted-foreground",
							children: [unanswered, " unanswered"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: chartData,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										stroke: "var(--color-border)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										stroke: "var(--color-muted-foreground)",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										allowDecimals: false,
										stroke: "var(--color-muted-foreground)",
										fontSize: 12
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										background: "var(--color-card)",
										border: "1px solid var(--color-border)",
										borderRadius: 8
									} }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "questions",
										fill: "var(--color-gold)",
										radius: [
											6,
											6,
											0,
											0
										]
									})
								]
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-card p-6 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-4 text-xl",
							children: "Knowledge base"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current PDF" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 font-medium",
									children: settings?.pdf_name ?? "No PDF uploaded yet"
								}),
								settings?.pdf_uploaded_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-xs text-muted-foreground",
									children: ["Updated ", new Date(settings.pdf_uploaded_at).toLocaleString()]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/50 bg-gold/5 p-6 text-center text-sm transition hover:bg-gold/10 ${uploading ? "opacity-60" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: uploading ? "Uploading…" : "Upload new PDF"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Replaces the previous file. Sent to n8n for indexing."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "application/pdf",
									className: "hidden",
									onChange: onUpload,
									disabled: uploading
								})
							]
						})
					]
				})
			]
		})]
	});
}
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-2xl border p-6 shadow-card ${accent ? "border-gold/40 bg-gold/10" : "border-border bg-card"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs uppercase tracking-[0.2em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 text-4xl font-semibold",
			children: value
		})]
	});
}
//#endregion
export { AdminPage as component };
