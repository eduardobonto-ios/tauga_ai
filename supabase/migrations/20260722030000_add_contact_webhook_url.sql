-- Optional n8n webhook that gets called when a guest submits the "leave your
-- details" contact form, so a workflow can email the hotel team about the
-- unanswered question. Falls back to not sending anything if unset.
alter table public.app_settings add column if not exists contact_webhook_url text;
