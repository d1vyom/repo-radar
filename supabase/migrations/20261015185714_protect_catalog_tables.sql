-- Catalog access goes through server-only application code. The service-role
-- client can read and synchronize; public API keys must not modify this data.
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_domains ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.repositories, public.repository_snapshots, public.domains, public.repository_domains
  FROM anon, authenticated;
