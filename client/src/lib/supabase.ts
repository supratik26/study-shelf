import { createClient } from "@supabase/supabase-js";

export const isExternalDeployment = import.meta.env.VITE_DEPLOY_TARGET === "vercel";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export function assertSupabaseConfigured() {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("This external deployment is missing its Supabase configuration.");
  }
}
