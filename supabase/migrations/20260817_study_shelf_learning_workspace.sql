-- Study Shelf learning workspace: private organization, revision, and collaboration features.

create table if not exists public.study_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text check (char_length(description) <= 300),
  color text not null default 'lilac' check (color in ('sage', 'sky', 'peach', 'lilac', 'butter', 'rose')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_collection_items (
  collection_id uuid not null references public.study_collections(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, note_id)
);

create table if not exists public.user_note_queue (
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  status text not null default 'up_next' check (status in ('up_next', 'in_progress', 'reviewed')),
  priority smallint not null default 2 check (priority between 1 and 3),
  scheduled_for date,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, note_id)
);

create table if not exists public.note_annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  page_reference text check (char_length(page_reference) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contribution_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 180),
  course text not null check (char_length(trim(course)) between 2 and 180),
  details text check (char_length(details) <= 1200),
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high')),
  status text not null default 'open' check (status in ('open', 'fulfilled', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  revision integer not null check (revision > 0),
  title text not null,
  description text,
  course text not null,
  term text,
  tags text[] not null default '{}',
  original_file_name text not null,
  file_type text not null,
  changed_at timestamptz not null default now(),
  unique (note_id, revision)
);

create table if not exists public.note_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid references public.notes(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 180),
  reminder_at timestamptz not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_collections_user_id_idx on public.study_collections(user_id, created_at desc);
create index if not exists study_collection_items_note_id_idx on public.study_collection_items(note_id);
create index if not exists user_note_queue_user_id_idx on public.user_note_queue(user_id, status, priority, scheduled_for);
create index if not exists note_annotations_user_note_idx on public.note_annotations(user_id, note_id, created_at desc);
create index if not exists contribution_requests_status_idx on public.contribution_requests(status, created_at desc);
create index if not exists note_versions_note_id_idx on public.note_versions(note_id, revision desc);
create index if not exists note_reminders_user_id_idx on public.note_reminders(user_id, is_done, reminder_at);

alter table public.study_collections enable row level security;
alter table public.study_collection_items enable row level security;
alter table public.user_note_queue enable row level security;
alter table public.note_annotations enable row level security;
alter table public.contribution_requests enable row level security;
alter table public.note_versions enable row level security;
alter table public.note_reminders enable row level security;

create policy "users manage their own collections" on public.study_collections
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "users manage items in their own collections" on public.study_collection_items
  for all to authenticated
  using (exists (select 1 from public.study_collections c where c.id = collection_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.study_collections c where c.id = collection_id and c.user_id = (select auth.uid())));

create policy "users manage their own study queue" on public.user_note_queue
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "users manage their own annotations" on public.note_annotations
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "authenticated members can read requests" on public.contribution_requests
  for select to authenticated using (true);
create policy "users create their own requests" on public.contribution_requests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update their own requests" on public.contribution_requests
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "authenticated members can read note history" on public.note_versions
  for select to authenticated using (true);

create policy "users manage their own reminders" on public.note_reminders
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into public.note_versions (note_id, revision, title, description, course, term, tags, original_file_name, file_type, changed_at)
select id, 1, title, description, course, term, tags, original_file_name, file_type, created_at
from public.notes
on conflict (note_id, revision) do nothing;

create or replace function public.capture_note_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.course is distinct from new.course
    or old.term is distinct from new.term
    or old.tags is distinct from new.tags
    or old.original_file_name is distinct from new.original_file_name
    or old.file_type is distinct from new.file_type then
    insert into public.note_versions (note_id, revision, title, description, course, term, tags, original_file_name, file_type)
    select new.id, coalesce(max(revision), 0) + 1, new.title, new.description, new.course, new.term, new.tags, new.original_file_name, new.file_type
    from public.note_versions
    where note_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists notes_capture_version on public.notes;
create trigger notes_capture_version
after update on public.notes
for each row execute function public.capture_note_version();
