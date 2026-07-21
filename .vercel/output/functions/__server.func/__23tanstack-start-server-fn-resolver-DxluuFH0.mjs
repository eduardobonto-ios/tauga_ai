//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-DxluuFH0.js
var manifest = {
	"4eb28529079347c9b9717df7ebccd8de323e9ad7861e2d85111ef3ac08f424c1": {
		functionName: "proxyPdfUpload_createServerFn_handler",
		importer: () => import("./_ssr/n8n-proxy-jTqGv1Rb.mjs")
	},
	"ac9a2b5bf460e71fe6aa6f74f3582443a8ff12a1088a1707f180f005a3172587": {
		functionName: "proxyChatMessage_createServerFn_handler",
		importer: () => import("./_ssr/n8n-proxy-jTqGv1Rb.mjs")
	},
	"e712d25f8761b97dd5b74f2f20761797847b8e812489d9c4a48878357ea01031": {
		functionName: "proxyContactLead_createServerFn_handler",
		importer: () => import("./_ssr/n8n-proxy-jTqGv1Rb.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
