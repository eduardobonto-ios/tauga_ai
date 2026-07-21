import { createServerFn } from "@tanstack/react-start";

// Both the chat widget and the admin PDF uploader used to `fetch()` the n8n
// webhook directly from the browser. n8n Cloud webhooks don't send back an
// `Access-Control-Allow-Origin` header, so the browser blocks the response
// with a CORS error before the app ever sees it — and if the workflow itself
// errors, that shows up as a second, unrelated-looking network failure.
//
// These server functions run on our own server instead, where CORS doesn't
// apply (it's a browser-only mechanism), and forward the request to n8n
// server-to-server. The browser only ever talks to same-origin code.

export type ProxyResult =
  | { ok: true; status: number; body: string; contentType: string }
  | { ok: false; status: number; message: string };

async function forward(url: string, init: RequestInit): Promise<ProxyResult> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message:
        err instanceof Error
          ? `Could not reach the n8n webhook: ${err.message}`
          : "Could not reach the n8n webhook.",
    };
  }
  const body = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body?.slice(0, 500) || `n8n webhook responded with ${res.status}`,
    };
  }
  const contentType = res.headers.get("content-type") ?? "";
  // n8n's "Respond to Webhook" nodes can report a workflow-level failure
  // (e.g. "no text extracted from PDF") while still returning HTTP 200 — an
  // HTTP-status-only check would treat that as success, so also honor an
  // explicit `success: false` in a JSON body.
  if (contentType.includes("application/json")) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        parsed &&
        typeof parsed === "object" &&
        "success" in parsed &&
        (parsed as { success: unknown }).success === false
      ) {
        const message = (parsed as { message?: unknown }).message;
        return {
          ok: false,
          status: res.status,
          message: typeof message === "string" ? message : "n8n workflow reported failure.",
        };
      }
    } catch {
      // Not JSON (or not the {success, message} shape) — fall through as success.
    }
  }
  return { ok: true, status: res.status, body, contentType };
}

export const proxyChatMessage = createServerFn({ method: "POST" })
  .validator(
    (data: {
      url: string;
      sessionId: string | null;
      message: string;
      history: unknown;
    }) => data,
  )
  .handler(async ({ data }): Promise<ProxyResult> => {
    if (!data.url) {
      return { ok: false, status: 0, message: "Chat webhook URL is not configured." };
    }
    return forward(data.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: data.sessionId,
        message: data.message,
        history: data.history,
      }),
    });
  });

export const proxyPdfUpload = createServerFn({ method: "POST" })
  .validator((data: { url: string; fileName: string; fileBase64: string }) => data)
  .handler(async ({ data }): Promise<ProxyResult> => {
    if (!data.url) {
      return { ok: false, status: 0, message: "PDF webhook URL is not configured." };
    }
    // The n8n workflow's "Has File?" check reads $json.body.fileBase64, then
    // runs it through a "Base64 to Binary" node — it expects the PDF as a
    // base64 string in a JSON body, not a multipart/form-data file upload.
    return forward(data.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: data.fileName, fileBase64: data.fileBase64 }),
    });
  });

export const proxyContactLead = createServerFn({ method: "POST" })
  .validator(
    (data: {
      url: string;
      name: string;
      phone: string;
      email: string;
      question: string;
      conversation: unknown;
    }) => data,
  )
  .handler(async ({ data }): Promise<ProxyResult> => {
    if (!data.url) {
      return { ok: false, status: 0, message: "Contact-lead webhook URL is not configured." };
    }
    return forward(data.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        question: data.question,
        conversation: data.conversation,
      }),
    });
  });
