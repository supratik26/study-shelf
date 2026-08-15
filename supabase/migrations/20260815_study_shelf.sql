-- Study Shelf external-hosting schema for Supabase Postgres, Auth, and Storage.
-- Run this migration in the Supabase SQL Editor before deploying the migrated app.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 180),
  description text,
  course text not null check (char_length(course) between 2 and 180),
  term text check (char_length(term) <= 100),
  tags text[] not null default '{}',
  original_file_name text not null check (char_length(original_file_name) between 1 and 255),
  file_type text not null check (file_type in ('pdf', 'docx', 'pptx', 'txt', 'md')),
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 10485760),
  storage_path text not null unique,
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_owner_id_idx on public.notes(owner_id);
create index if not exists notes_title_idx on public.notes(title);
create index if not exists notes_course_idx on public.notes(course);
create index if not exists notes_file_type_idx on public.notes(file_type);
create index if not exists notes_created_at_idx on public.notes(created_at desc);
create index if not exists notes_tags_idx on public.notes using gin(tags);

alter table public.profiles enable row level security;
alter table public.notes enable row level security;

create policy "authenticated members can read profiles"
on public.profiles for select to authenticated using (true);

create policy "users can update their own profile"
on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "authenticated members can read shared notes"
on public.notes for select to authenticated using (true);

create policy "users can insert their own notes"
on public.notes for insert to authenticated with check ((select auth.uid()) = owner_id);

create policy "users can update their own notes"
on public.notes for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "users can remove their own notes"
on public.notes for delete to authenticated using ((select auth.uid()) = owner_id);

create or replace function public.register_note_download(p_note_id uuid)
returns table (storage_path text, original_file_name text, next_download_count integer)
language sql
security invoker
set search_path = public
as $$
  update public.notes
  set download_count = download_count + 1,
      updated_at = now()
  where id = p_note_id
  returning notes.storage_path, notes.original_file_name, notes.download_count;
$$;

grant execute on function public.register_note_download(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'notes',
  'notes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/x-markdown'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "authenticated members can read shared note files"
on storage.objects for select to authenticated using (bucket_id = 'notes');

create policy "users can upload to their own folder"
on storage.objects for insert to authenticated with check (
  bucket_id = 'notes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "users can remove files from their own folder"
on storage.objects for delete to authenticated using (
  bucket_id = 'notes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
