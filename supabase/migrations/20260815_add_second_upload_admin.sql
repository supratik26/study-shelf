-- Apply in the Supabase SQL Editor after 20260815_owner_only_uploads.sql.
-- Keeps both approved upload administrators in sync with Vercel's comma-separated UPLOAD_OWNER_EMAIL value.

drop policy if exists "only the approved owner can insert notes" on public.notes;
create policy "only approved upload administrators can insert notes"
on public.notes for insert to authenticated
with check (
  (select auth.uid()) = owner_id
  and lower(coalesce((select auth.jwt() ->> 'email'), '')) in (
    'supratikkundu2006@gmail.com',
    'devilluciferbest@gmail.com'
  )
);

drop policy if exists "only the approved owner can upload note files" on storage.objects;
create policy "only approved upload administrators can upload note files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'notes'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(coalesce((select auth.jwt() ->> 'email'), '')) in (
    'supratikkundu2006@gmail.com',
    'devilluciferbest@gmail.com'
  )
);
