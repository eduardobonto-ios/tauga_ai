
-- chat sessions
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat_sessions TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create sessions" ON public.chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read sessions" ON public.chat_sessions FOR SELECT TO anon, authenticated USING (true);

-- questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  question text NOT NULL,
  answered boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert questions" ON public.questions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read questions" ON public.questions FOR SELECT TO anon, authenticated USING (true);

-- contact leads
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  unanswered_question text,
  conversation jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.contact_leads TO anon, authenticated;
GRANT ALL ON public.contact_leads TO service_role;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert leads" ON public.contact_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anyone can read leads" ON public.contact_leads FOR SELECT TO anon, authenticated USING (true);

-- app settings (single row)
CREATE TABLE public.app_settings (
  id int PRIMARY KEY DEFAULT 1,
  pdf_name text,
  pdf_uploaded_at timestamptz,
  pdf_webhook_url text,
  chat_webhook_url text NOT NULL DEFAULT 'https://eduardobonto.app.n8n.cloud/webhook/hotel-chat',
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anyone can upsert settings" ON public.app_settings FOR INSERT TO anon, authenticated WITH CHECK (id = 1);
CREATE POLICY "anyone can update settings" ON public.app_settings FOR UPDATE TO anon, authenticated USING (id = 1) WITH CHECK (id = 1);

INSERT INTO public.app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
