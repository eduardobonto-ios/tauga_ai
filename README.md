# Cincinnati Hotel — AI Concierge

A demo hotel chatbot platform: guests chat with an AI concierge that answers
questions strictly from an admin-uploaded PDF; admins upload that PDF and
watch live chat statistics. Built with React (TanStack Start), Supabase, and
n8n for the AI/automation layer.



## 1. Architecture & technology stack

```
┌──────────────┐        ┌───────────────────────┐        ┌────────────────────┐
│   Browser    │  HTTP  │  TanStack Start server │  HTTP  │       n8n          │
│  (React SPA) │───────▶│  (server functions —   │───────▶│  (workflows, AI    │
│              │◀───────│   src/lib/n8n-proxy.ts)│◀───────│   agent, OpenAI)   │
└──────┬───────┘        └───────────────────────┘        └──────────┬─────────┘
       │                                                             │
       │ supabase-js (anon key, RLS)                                 │ service role
       ▼                                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Supabase (Postgres)                        │
│  chat_sessions · questions · contact_leads · app_settings · documents   │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19 + [TanStack Start](https://tanstack.com/start) (file-based
  routing via TanStack Router, SSR via Nitro), TypeScript, Tailwind CSS,
  Radix UI primitives, Recharts (admin chart), Sonner (toasts).
- **Backend**: Node.js — TanStack Start **server functions**
  (`src/lib/n8n-proxy.ts`) run as Vercel Serverless Functions (Nitro's
  `vercel` preset, `nodejs22.x` runtime — not Vercel's Edge runtime). The
  browser never calls n8n directly; it calls these same-origin functions,
  which call n8n server-to-server.
- **Database**: Supabase (Postgres + Realtime), accessed from the browser via
  the anon/publishable key under Row Level Security policies that allow
  anonymous read/insert (per the brief: no real auth is required for this
  demo).
- **Automation / AI**: [n8n](https://n8n.io) workflows orchestrate PDF
  ingestion, the RAG chat agent, and the contact-lead email notification.
  OpenAI models power the chat completion and embeddings.
- **Vector store**: a `documents` table + `match_documents()` Postgres
  function (pgvector), queried by n8n's own Supabase credential — this table
  lives in whichever Supabase project n8n's "Supabase account" credential
  points to (see §6, this can be the same project as the app or a separate
  one dedicated to n8n).

### Why there's a server-side proxy at all

n8n Cloud webhooks don't return `Access-Control-Allow-Origin` headers, so a
browser calling them with `fetch()` directly gets blocked by CORS before the
app ever sees the real response — and if the workflow itself errors, that
looks like a second, unrelated network failure. `src/lib/n8n-proxy.ts`
defines three TanStack Start server functions (`proxyChatMessage`,
`proxyPdfUpload`, `proxyContactLead`) that run **server-to-server** instead,
where CORS doesn't apply. They also normalize n8n's response: an HTTP 200
whose JSON body explicitly says `"success": false` (a `Respond to Webhook`
node on a failure branch) is still treated as a failure, not silently shown
as success.

## 2. How the chatbot processes the PDF (RAG pipeline)

Two independent n8n workflows handle this, both callable via URLs stored in
the `app_settings` table (configurable from the admin dashboard):

### Ingestion — workflow "Hotel Admin - PDF Upload & Ingestion"

Triggered by the admin dashboard's upload control:

1. `admin.tsx` reads the selected PDF client-side and base64-encodes it
   (`FileReader.readAsDataURL`).
2. It's sent as JSON — `{ fileName, fileBase64 }` — through
   `proxyPdfUpload` to the **Admin Upload Webhook** node.
3. **Has File?** checks `$json.body.fileBase64` is non-empty.
4. **Base64 to Binary** converts it back to a binary file.
5. **Extract PDF Text** (n8n's "Extract From File" node) pulls the raw text.
6. **Has Text?** guards against unreadable/scanned PDFs with no extractable
   text.
7. **Clear Old Knowledge Base** deletes all existing rows from `documents` —
   the brief requires a single PDF that *replaces* the previous one, so the
   whole knowledge base is wiped before the new content is inserted.
8. **Prepare Document → Insert into Vector Store**: the text is chunked
   (Text Splitter), embedded (OpenAI Embeddings), and inserted into
   `documents` (Supabase Vector Store node, table `documents`, matching
   function `match_documents`).
9. **Respond Success** (or **Respond No File** / **Respond No Text** on the
   failure branches) returns a JSON result the app surfaces as a toast, and
   on success the app records `pdf_name` / `pdf_uploaded_at` in
   `app_settings`.

### Retrieval — workflow "Hotel Chatbot - RAG"

Triggered on every guest message:

1. `chat.tsx` POSTs `{ sessionId, message, history }` through
   `proxyChatMessage` to the **Chat Webhook** node.
2. **Has Message?** guards against empty input.
3. **Normalize Input → Hotel Assistant**: an AI Agent node with an OpenAI
   chat model, session memory (per `sessionId`), and a **vector store tool**
   (`hotel_knowledge_base`) that embeds the guest's question (KB Embeddings)
   and searches `documents` via `match_documents` for relevant chunks — this
   is what keeps answers grounded in the uploaded PDF instead of the model's
   general knowledge.
4. **Log Chat Event → Build Response → Respond Answer** returns the reply.
5. Client-side, `looksUnanswered()` (a small regex heuristic in `chat.tsx`)
   checks the reply for phrases like "I don't have that information" and, if
   matched, marks the question `answered: false` and shows the contact form.

**Important**: the embedding model used by "OpenAI Embeddings" (ingestion)
and "KB Embeddings" (retrieval) must be the *same* model — mixing embedding
models silently produces meaningless similarity search results, since vector
spaces aren't comparable across models even when dimensions happen to match.
`documents.embedding` is `vector(1536)`, matching `text-embedding-ada-002` /
`text-embedding-3-small`; if you switch to `text-embedding-3-large`, update
the column to `vector(3072)` in both places.

### Contact-lead notification

A second, independent webhook branch inside the same "Hotel Chatbot - RAG"
workflow (path e.g. `hotel-contact-lead`) receives
`{ name, phone, email, question, conversation }` from `ContactCard.submit()`
(`chat.tsx`) whenever a guest leaves their details after an unanswered
question, and emails a summary to the hotel team. The lead is always saved
to `contact_leads` first — the email is best-effort and never blocks the
guest-facing confirmation.

## 3. Admin dashboard: design & data flow

`src/routes/admin.tsx` is a single-page dashboard with three panels:

- **Live stats** (`chat_sessions` count, `questions` count/chart, unanswered
  count, `contact_leads` count). Chart categories come from
  `src/lib/categorize.ts` — a simple keyword-regex classifier
  (rooms/restaurant/prices/facilities/services/location/other) run
  client-side on each guest question before it's saved.
- **Knowledge base**: current PDF name/timestamp, and the upload control
  described in §2.
- **n8n webhook configuration**: three URL fields (chat, PDF-upload,
  contact-lead), persisted to `app_settings` — this is how you point the app
  at different n8n workflows without a code change or redeploy.

"Real-time" is implemented via Supabase Realtime: the dashboard subscribes
to Postgres changes on `questions`, `chat_sessions`, and `contact_leads`
(`supabase.channel("admin-stats").on("postgres_changes", ...)`) and
re-fetches all stats on any insert/update/delete — no polling.

## 4. Database schema

| Table            | Purpose                                                         |
| ----------------- | ---------------------------------------------------------------- |
| `chat_sessions`   | One row per guest chat session (created on `/chat` page load).   |
| `questions`       | Every guest question, its category, and whether it was answered. |
| `contact_leads`   | Name/phone/email + the unanswered question + full conversation.  |
| `app_settings`    | Singleton (`id = 1`) row: PDF metadata + the three webhook URLs.  |
| `documents`       | Vector store for the RAG pipeline (chunks + embeddings), managed entirely by n8n. |

All migrations live in `supabase/migrations/`, applied in filename order.
RLS is enabled on every app table with permissive anon policies (per the
brief, no real authentication is required for this demo) except `documents`,
which is locked down to the service role n8n uses.

## 5. Running locally

Requires Node.js and a `.env` with your Supabase project's URL and
publishable key (see `.env` — already present in this repo for the deployed
project):

```sh
npm i
npm run dev       # http://localhost:8080
```

Other scripts: `npm run build` (production build), `npm run preview`
(preview the built output), `npm run lint`, `npm run format`.

## 6. Deploying (public URL)

This repo builds for **Vercel** via Nitro's `vercel` preset
(`vite.config.ts` → `nitro: { preset: "vercel" }`), producing a standard
Node.js Serverless Function (`nodejs22.x`, not Vercel's Edge runtime):

```sh
npm run build          # outputs .vercel/output (Build Output API v3)
npx vercel deploy --prebuilt --prod
```

or simply connect the GitHub repo to a Vercel project and let Vercel build
it on every push (`npm run build` is auto-detected).

Set the same `.env` values (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, etc.) as Vercel project environment
variables so the deployed build can reach Supabase.

The **Supabase** project and **n8n** workflows are independent services that
must be reachable from wherever the app is deployed — no additional
configuration is needed beyond the `.env` values and the webhook URLs stored
in `app_settings` (editable from `/admin` without a redeploy).

## 7. Testing

There's no automated test suite in this project — verification is manual.
Suggested checklist after any change:

1. **PDF ingestion**: `/admin` → upload the hotel PDF → toast shows success
   → in n8n, open the "Hotel Admin - PDF Upload & Ingestion" workflow's
   Executions tab and confirm the run reaches **Insert into Vector Store →
   Respond Success** (not a "No File"/"No Text" branch).
2. **Answered question**: `/chat` → ask something covered by the PDF (e.g.
   "How much is the Deluxe Room?") → verify a grounded, correct answer.
3. **Unanswered question**: ask something not in the PDF → verify the
   apologetic fallback message and the contact form appearing.
4. **Contact lead**: submit the contact form → verify a new row in
   `contact_leads` and an email arriving at the configured recipients.
5. **Admin stats**: confirm the sessions/questions/leads counters and the
   "Questions by topic" chart update immediately (no manual refresh needed)
   while using `/chat` in another tab.

## 8. Extending the system

- **Question categories**: edit the `RULES` array and `CATEGORY_LABELS` in
  `src/lib/categorize.ts`.
- **Swapping n8n workflows/environments**: update the three URL fields on
  `/admin` — no code change needed, they're read from `app_settings` at
  runtime.
- **Changing the embedding model**: update both "OpenAI Embeddings" nodes in
  n8n *and* the `vector(N)` dimension on `documents.embedding`
  (`supabase/migrations/20260722023000_documents_vector_store.sql`) — they
  must always match.
- **New webhook integrations** (e.g. SMS instead of email for leads): follow
  the existing pattern in `src/lib/n8n-proxy.ts` — add a `createServerFn`
  that forwards a JSON payload to a configurable URL, call it from the
  relevant route, and add a settings column + admin UI field if the URL
  should be admin-configurable.
