
-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.report_status as enum ('open', 'in_progress', 'fixed', 'not_a_problem', 'duplicate');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Roles are viewable by everyone" on public.user_roles for select using (true);
create policy "Admins manage roles" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- Buildings
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);
alter table public.buildings enable row level security;
create policy "Buildings viewable by everyone" on public.buildings for select using (true);
create policy "Admins manage buildings" on public.buildings for all using (public.has_role(auth.uid(), 'admin'));

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories viewable by everyone" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.has_role(auth.uid(), 'admin'));

-- Reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  building_id uuid references public.buildings(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  floor text,
  room text,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Reports viewable by everyone" on public.reports for select using (true);
create policy "Authenticated users create reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Owners or admins update reports" on public.reports for update using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Owners or admins delete reports" on public.reports for delete using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create index reports_status_idx on public.reports(status);
create index reports_created_idx on public.reports(created_at desc);

-- Report media
create table public.report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  url text not null,
  media_type text not null default 'image',
  created_at timestamptz not null default now()
);
alter table public.report_media enable row level security;
create policy "Media viewable by everyone" on public.report_media for select using (true);
create policy "Report owners add media" on public.report_media for insert with check (
  exists (select 1 from public.reports r where r.id = report_id and r.user_id = auth.uid())
);
create policy "Owners or admins delete media" on public.report_media for delete using (
  exists (select 1 from public.reports r where r.id = report_id and (r.user_id = auth.uid() or public.has_role(auth.uid(), 'admin')))
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy "Comments viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Owners update comments" on public.comments for update using (auth.uid() = user_id);
create policy "Owners or admins delete comments" on public.comments for delete using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- Votes
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);
alter table public.votes enable row level security;
create policy "Votes viewable by everyone" on public.votes for select using (true);
create policy "Authenticated users vote" on public.votes for insert with check (auth.uid() = user_id);
create policy "Users update own vote" on public.votes for update using (auth.uid() = user_id);
create policy "Users delete own vote" on public.votes for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger reports_touch before update on public.reports for each row execute function public.touch_updated_at();
create trigger comments_touch before update on public.comments for each row execute function public.touch_updated_at();

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed buildings & categories
insert into public.buildings (name) values
  ('Building A'), ('Building B'), ('Laboratory'), ('Library'), ('Mosque'), ('Hall');

insert into public.categories (name, slug) values
  ('Cleanliness','cleanliness'),
  ('Electrical','electrical'),
  ('Internet/WiFi','internet'),
  ('Classroom Equipment','classroom'),
  ('Furniture','furniture'),
  ('Water','water'),
  ('Air Conditioner','ac'),
  ('Projector','projector'),
  ('Toilet','toilet'),
  ('Security','security'),
  ('Parking','parking'),
  ('Others','others');

-- Storage bucket
insert into storage.buckets (id, name, public) values ('report-media','report-media', true)
on conflict (id) do nothing;

create policy "Public read report-media"
  on storage.objects for select
  using (bucket_id = 'report-media');

create policy "Authenticated upload report-media"
  on storage.objects for insert
  with check (bucket_id = 'report-media' and auth.role() = 'authenticated');

create policy "Owners delete own report-media"
  on storage.objects for delete
  using (bucket_id = 'report-media' and owner = auth.uid());
