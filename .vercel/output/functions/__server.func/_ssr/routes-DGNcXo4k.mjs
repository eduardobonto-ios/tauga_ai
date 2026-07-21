import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as ShieldCheck, t as UserRound } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DGNcXo4k.js
var import_jsx_runtime = require_jsx_runtime();
var hotel_hero_default = "/assets/hotel-hero-BCCjUJ8r.jpg";
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-screen w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: hotel_hero_default,
				alt: "Cincinnati Hotel lobby",
				width: 1600,
				height: 1e3,
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/90" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-primary-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-4 rounded-full border border-gold/60 px-4 py-1 text-xs uppercase tracking-[0.3em] text-gold",
						children: "Cincinnati Hotel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "max-w-3xl text-center text-5xl leading-tight md:text-7xl",
						children: [
							"Your stay, ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "italic text-gold",
								children: "gracefully"
							}),
							" answered."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-center text-base text-primary-foreground/80 md:text-lg",
						children: "Ask our AI concierge anything about rooms, dining, amenities and services — or step into the admin suite to manage the knowledge base."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 grid w-full max-w-2xl gap-5 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/chat",
							className: "group flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-8 text-left backdrop-blur transition hover:border-gold/60 hover:bg-white/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-full bg-gold/20 p-3 text-gold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl",
									children: "Regular User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-primary-foreground/70",
									children: "Chat with the Cincinnati Hotel concierge."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-2 text-sm text-gold group-hover:underline",
									children: "Enter chat →"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: "group flex flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-8 text-left backdrop-blur transition hover:border-gold/60 hover:bg-white/10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-full bg-gold/20 p-3 text-gold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-2xl",
									children: "Admin"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-primary-foreground/70",
									children: "Upload the hotel PDF and view live chat statistics."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-2 text-sm text-gold group-hover:underline",
									children: "Open dashboard →"
								})
							]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { Landing as component };
