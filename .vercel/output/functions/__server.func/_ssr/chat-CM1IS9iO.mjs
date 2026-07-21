import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-Br2YKhHo.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as proxyContactLead, n as categorize, r as proxyChatMessage } from "./n8n-proxy-Co8IS902.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as ArrowLeft, i as Send, o as Mail } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-CM1IS9iO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_HINTS = [
	/i(?:'m| am) sorry/i,
	/don'?t have that information/i,
	/i don'?t know/i,
	/not sure/i,
	/no information/i,
	/cannot find/i,
	/couldn'?t find/i
];
function looksUnanswered(text) {
	return FALLBACK_HINTS.some((rx) => rx.test(text));
}
function ChatPage() {
	const [sessionId, setSessionId] = (0, import_react.useState)(null);
	const [webhookUrl, setWebhookUrl] = (0, import_react.useState)("https://eduardobonto.app.n8n.cloud/webhook/hotel-chat");
	const [contactWebhookUrl, setContactWebhookUrl] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([{
		role: "assistant",
		content: "Welcome to Cincinnati Hotel. I'm your virtual concierge — ask me about our rooms, dining, amenities or services."
	}]);
	const [input, setInput] = (0, import_react.useState)("");
	const [sending, setSending] = (0, import_react.useState)(false);
	const [showContact, setShowContact] = (0, import_react.useState)(false);
	const [lastUnanswered, setLastUnanswered] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	const scrollRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		(async () => {
			const { data: settings } = await supabase.from("app_settings").select("chat_webhook_url, contact_webhook_url").eq("id", 1).maybeSingle();
			if (settings?.chat_webhook_url) setWebhookUrl(settings.chat_webhook_url);
			if (settings?.contact_webhook_url) setContactWebhookUrl(settings.contact_webhook_url);
			const { data } = await supabase.from("chat_sessions").insert({}).select("id").single();
			if (data?.id) setSessionId(data.id);
		})();
	}, []);
	(0, import_react.useEffect)(() => {
		inputRef.current?.focus();
	}, [sending]);
	(0, import_react.useEffect)(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth"
		});
	}, [messages, sending]);
	async function send() {
		const text = input.trim();
		if (!text || sending) return;
		setInput("");
		const nextMessages = [...messages, {
			role: "user",
			content: text
		}];
		setMessages(nextMessages);
		setSending(true);
		const category = categorize(text);
		try {
			const result = await proxyChatMessage({ data: {
				url: webhookUrl,
				sessionId,
				message: text,
				history: nextMessages
			} });
			if (!result.ok) throw new Error(result.message || `Request failed (${result.status})`);
			let reply = "";
			if (result.contentType.includes("application/json")) {
				const j = JSON.parse(result.body);
				reply = j.reply ?? j.output ?? j.answer ?? j.message ?? j.text ?? (typeof j === "string" ? j : "") ?? "";
				if (!reply && Array.isArray(j) && j[0]) reply = j[0].reply ?? j[0].output ?? j[0].answer ?? j[0].text ?? "";
			} else reply = result.body;
			reply = reply?.toString().trim() || "I'm sorry, I don't have that information right now.";
			const unanswered = looksUnanswered(reply);
			setMessages((m) => [...m, {
				role: "assistant",
				content: reply
			}]);
			if (sessionId) await supabase.from("questions").insert({
				session_id: sessionId,
				category,
				question: text,
				answered: !unanswered
			});
			if (unanswered) {
				setLastUnanswered(text);
				setShowContact(true);
			}
		} catch (err) {
			console.error(err);
			setMessages((m) => [...m, {
				role: "assistant",
				content: "I'm having trouble reaching the concierge right now. Please try again in a moment."
			}]);
			toast.error("Could not reach the concierge service.");
		} finally {
			setSending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-center justify-between px-4 py-4",
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
								children: "Concierge"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-16" })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: scrollRef,
				className: "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6",
				children: [
					messages.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bubble, { msg: m }, i)),
					sending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 self-start rounded-2xl bg-muted px-4 py-3 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, {}),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, { delay: .15 }),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dot, { delay: .3 })
						]
					}),
					showContact && lastUnanswered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactCard, {
						sessionId,
						question: lastUnanswered,
						conversation: messages,
						contactWebhookUrl,
						onDone: () => setShowContact(false)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-3xl items-end gap-2 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						ref: inputRef,
						value: input,
						onChange: (e) => setInput(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								send();
							}
						},
						rows: 1,
						placeholder: "Ask about rooms, dining, amenities...",
						className: "min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: send,
						disabled: sending || !input.trim(),
						className: "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" }), " Send"]
					})]
				})
			})
		]
	});
}
function Bubble({ msg }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user" ? "self-end bg-primary text-primary-foreground" : "self-start bg-card text-card-foreground"}`,
		children: msg.content
	});
}
function Dot({ delay = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block h-2 w-2 animate-bounce rounded-full bg-current",
		style: { animationDelay: `${delay}s` }
	});
}
function ContactCard({ sessionId, question, conversation, contactWebhookUrl, onDone }) {
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		phone: "",
		email: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const valid = (0, import_react.useMemo)(() => form.name.trim() && form.phone.trim() && /.+@.+\..+/.test(form.email), [form]);
	async function submit() {
		if (!valid || saving) return;
		setSaving(true);
		const { error } = await supabase.from("contact_leads").insert({
			session_id: sessionId,
			name: form.name.trim(),
			phone: form.phone.trim(),
			email: form.email.trim(),
			unanswered_question: question,
			conversation
		});
		if (error) {
			setSaving(false);
			toast.error("Could not send your details. Please try again.");
			return;
		}
		if (contactWebhookUrl) {
			const result = await proxyContactLead({ data: {
				url: contactWebhookUrl,
				name: form.name.trim(),
				phone: form.phone.trim(),
				email: form.email.trim(),
				question,
				conversation
			} });
			if (!result.ok) console.error("Contact-lead email notification failed:", result.message);
		}
		setSaving(false);
		toast.success("Thank you — our team will reach out shortly.");
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "self-start w-full max-w-md rounded-2xl border border-gold/40 bg-card p-5 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center gap-2 text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs uppercase tracking-[0.2em]",
					children: "Leave your details"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted-foreground",
				children: "We'll have a Cincinnati Hotel representative follow up personally."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring",
						placeholder: "Full name",
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring",
						placeholder: "Phone",
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring",
						placeholder: "Email",
						type: "email",
						value: form.email,
						onChange: (e) => setForm({
							...form,
							email: e.target.value
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onDone,
					className: "rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
					children: "Dismiss"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: submit,
					disabled: !valid || saving,
					className: "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40",
					children: saving ? "Sending…" : "Send"
				})]
			})
		]
	});
}
//#endregion
export { ChatPage as component };
