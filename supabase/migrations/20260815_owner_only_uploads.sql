-- Restrict new notes and direct Storage uploads to the approved Study Shelf owner.
-- Apply this migration in the Supabase SQL Editor after the base Study Shelf migration.

drop policy if exists "users can insert their own notes" on public.notes;
create policy "only the approved owner can insert notes"
on public.notes for insert to authenticated
with check (
  (select auth.uid()) = owner_id
  and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'supratikkundu2006@gmail.com'
);

drop policy if exists "users can upload to their own folder" on storage.objects;
create policy "only the approved owner can upload note files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'notes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'supratikkundu2006@gmail.com'
);
