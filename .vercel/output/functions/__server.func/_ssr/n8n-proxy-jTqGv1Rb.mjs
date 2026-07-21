import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/n8n-proxy-jTqGv1Rb.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function forward(url, init) {
	let res;
	try {
		res = await fetch(url, init);
	} catch (err) {
		return {
			ok: false,
			status: 0,
			message: err instanceof Error ? `Could not reach the n8n webhook: ${err.message}` : "Could not reach the n8n webhook."
		};
	}
	const body = await res.text();
	if (!res.ok) return {
		ok: false,
		status: res.status,
		message: body?.slice(0, 500) || `n8n webhook responded with ${res.status}`
	};
	const contentType = res.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) try {
		const parsed = JSON.parse(body);
		if (parsed && typeof parsed === "object" && "success" in parsed && parsed.success === false) {
			const message = parsed.message;
			return {
				ok: false,
				status: res.status,
				message: typeof message === "string" ? message : "n8n workflow reported failure."
			};
		}
	} catch {}
	return {
		ok: true,
		status: res.status,
		body,
		contentType
	};
}
var proxyChatMessage_createServerFn_handler = createServerRpc({
	id: "ac9a2b5bf460e71fe6aa6f74f3582443a8ff12a1088a1707f180f005a3172587",
	name: "proxyChatMessage",
	filename: "src/lib/n8n-proxy.ts"
}, (opts) => proxyChatMessage.__executeServer(opts));
var proxyChatMessage = createServerFn({ method: "POST" }).validator((data) => data).handler(proxyChatMessage_createServerFn_handler, async ({ data }) => {
	if (!data.url) return {
		ok: false,
		status: 0,
		message: "Chat webhook URL is not configured."
	};
	return forward(data.url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId: data.sessionId,
			message: data.message,
			history: data.history
		})
	});
});
var proxyPdfUpload_createServerFn_handler = createServerRpc({
	id: "4eb28529079347c9b9717df7ebccd8de323e9ad7861e2d85111ef3ac08f424c1",
	name: "proxyPdfUpload",
	filename: "src/lib/n8n-proxy.ts"
}, (opts) => proxyPdfUpload.__executeServer(opts));
var proxyPdfUpload = createServerFn({ method: "POST" }).validator((data) => data).handler(proxyPdfUpload_createServerFn_handler, async ({ data }) => {
	if (!data.url) return {
		ok: false,
		status: 0,
		message: "PDF webhook URL is not configured."
	};
	return forward(data.url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			fileName: data.fileName,
			fileBase64: data.fileBase64
		})
	});
});
var proxyContactLead_createServerFn_handler = createServerRpc({
	id: "e712d25f8761b97dd5b74f2f20761797847b8e812489d9c4a48878357ea01031",
	name: "proxyContactLead",
	filename: "src/lib/n8n-proxy.ts"
}, (opts) => proxyContactLead.__executeServer(opts));
var proxyContactLead = createServerFn({ method: "POST" }).validator((data) => data).handler(proxyContactLead_createServerFn_handler, async ({ data }) => {
	if (!data.url) return {
		ok: false,
		status: 0,
		message: "Contact-lead webhook URL is not configured."
	};
	return forward(data.url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			name: data.name,
			phone: data.phone,
			email: data.email,
			question: data.question,
			conversation: data.conversation
		})
	});
});
//#endregion
export { proxyChatMessage_createServerFn_handler, proxyContactLead_createServerFn_handler, proxyPdfUpload_createServerFn_handler };
