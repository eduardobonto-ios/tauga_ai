import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-DxluuFH0.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/n8n-proxy-Co8IS902.js
var RULES = [
	["rooms", /\b(room|suite|bed|king|queen|twin|balcony|view|floor|check[- ]?in|check[- ]?out)\b/i],
	["restaurant", /\b(restaurant|breakfast|dinner|lunch|menu|food|bar|drink|cuisine|buffet|coffee)\b/i],
	["prices", /\b(price|cost|rate|fee|discount|cheap|expensive|how much|per night|charge|pay)\b/i],
	["facilities", /\b(pool|gym|spa|sauna|jacuzzi|wifi|parking|beach|garden|amenit|fitness)\b/i],
	["services", /\b(service|reception|concierge|laundry|shuttle|taxi|tour|booking|reserve|cancel|policy)\b/i],
	["location", /\b(location|address|where|near|nearby|airport|distance|direction|map)\b/i]
];
function categorize(text) {
	for (const [cat, rx] of RULES) if (rx.test(text)) return cat;
	return "other";
}
var CATEGORY_LABELS = {
	rooms: "Rooms",
	restaurant: "Restaurant",
	prices: "Prices",
	facilities: "Facilities",
	services: "Services",
	location: "Location",
	other: "Other"
};
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var proxyChatMessage = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("ac9a2b5bf460e71fe6aa6f74f3582443a8ff12a1088a1707f180f005a3172587"));
var proxyPdfUpload = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("4eb28529079347c9b9717df7ebccd8de323e9ad7861e2d85111ef3ac08f424c1"));
var proxyContactLead = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("e712d25f8761b97dd5b74f2f20761797847b8e812489d9c4a48878357ea01031"));
//#endregion
export { proxyPdfUpload as a, proxyContactLead as i, categorize as n, proxyChatMessage as r, CATEGORY_LABELS as t };
