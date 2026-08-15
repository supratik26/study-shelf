import { createClient } from "@supabase/supabase-js";

export function getServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server configuration.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getAuthorizedUser(headers: Record<string, string | string[] | undefined>) {
  const raw = headers.authorization;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const token = value?.startsWith("Bearer ") ? value.slice(7) : undefined;
  if (!token) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
