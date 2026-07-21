-- Vector store backing n8n's "Hotel Chatbot - RAG" workflow (Supabase Vector
-- Store node: table "documents", query function "match_documents"). Only
-- n8n's own Supabase credential touches this table (via service_role, which
-- bypasses RLS), so no anon/authenticated policies are granted here.
create extension if not exists vector;

create table if not exists public.documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

create or replace function public.match_documents (
  query_embedding vector(1536),
  match_count int default null,
  filter jsonb default '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
