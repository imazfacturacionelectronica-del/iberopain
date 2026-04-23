-- Tabla maestra de protocolos
create table public.protocols (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  type text not null check (type in ('agudo', 'cronico', 'neuropatico', 'oncologico', 'intervencionismo')),
  status text not null default 'draft' check (status in ('published', 'draft', 'review_pending', 'archived')),
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Versiones de cada protocolo
create table public.protocol_versions (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id) on delete cascade,
  version_number int not null,
  content jsonb not null,
  bibliography jsonb not null default '[]',
  generated_by text not null default 'manual' check (generated_by in ('manual', 'claude-api')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  published_at timestamptz,
  search_summary text,
  created_at timestamptz not null default now(),
  unique (protocol_id, version_number)
);

-- FK circular: protocols.current_version_id → protocol_versions.id
alter table public.protocols
  add constraint fk_current_version
  foreign key (current_version_id)
  references public.protocol_versions(id)
  on delete set null
  deferrable initially deferred;

-- Log de jobs de actualización automática
create table public.protocol_update_jobs (
  id uuid primary key default gen_random_uuid(),
  protocol_id uuid not null references public.protocols(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  status text not null default 'running' check (status in ('running', 'draft_ready', 'approved', 'rejected', 'error')),
  sources_searched jsonb,
  draft_version_id uuid references public.protocol_versions(id),
  error_message text,
  completed_at timestamptz
);

-- Tabla de roles de usuario
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role text not null check (role in ('admin', 'medico', 'enfermera', 'directivo')),
  full_name text not null,
  created_at timestamptz not null default now()
);

-- Índices
create index idx_protocols_slug on public.protocols(slug);
create index idx_protocol_versions_protocol_id on public.protocol_versions(protocol_id);
create index idx_protocol_update_jobs_protocol_id on public.protocol_update_jobs(protocol_id);
create index idx_protocol_update_jobs_status on public.protocol_update_jobs(status);

-- RLS
alter table public.protocols enable row level security;
alter table public.protocol_versions enable row level security;
alter table public.protocol_update_jobs enable row level security;
alter table public.user_roles enable row level security;

-- Helper: obtener rol del usuario actual
create or replace function public.get_user_role()
returns text language sql security definer stable as $$
  select role from public.user_roles where user_id = auth.uid()
$$;

-- Policies: protocolos publicados — usuarios autenticados leen
create policy "auth_read_published_protocols"
  on public.protocols for select
  using (auth.uid() is not null and status = 'published');

create policy "admin_read_all_protocols"
  on public.protocols for select
  using (public.get_user_role() = 'admin');

create policy "admin_write_protocols"
  on public.protocols for all
  using (public.get_user_role() = 'admin');

-- Policies: versiones
create policy "auth_read_published_versions"
  on public.protocol_versions for select
  using (auth.uid() is not null and published_at is not null);

create policy "admin_read_all_versions"
  on public.protocol_versions for select
  using (public.get_user_role() = 'admin');

create policy "admin_write_versions"
  on public.protocol_versions for all
  using (public.get_user_role() = 'admin');

-- Policies: jobs
create policy "admin_manage_jobs"
  on public.protocol_update_jobs for all
  using (public.get_user_role() = 'admin');

-- Policies: roles
create policy "user_read_own_role"
  on public.user_roles for select
  using (user_id = auth.uid());

create policy "admin_manage_roles"
  on public.user_roles for all
  using (public.get_user_role() = 'admin');

-- Trigger: updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger protocols_updated_at
  before update on public.protocols
  for each row execute function public.set_updated_at();
