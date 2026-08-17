# Study Shelf feature migration status

The complete learning-workspace feature set requires the migration in `supabase/migrations/20260817_study_shelf_learning_workspace.sql` to be run against the existing Supabase project `swrvvehuxwkqhrlrznmk`.

The migration was executed successfully on 2026-08-17. It extends the existing notes schema with private collections, queue entries, annotations, contribution requests, note-history snapshots, and in-app reminder records; it does not remove or modify existing note records.

The Vercel production deployment for commit `5302c75` was verified as ready. The public Study Space route is live and correctly presents its authenticated workspace entry point to signed-out visitors.
