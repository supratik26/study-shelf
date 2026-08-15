import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { assertSupabaseConfigured, supabase } from "./supabase";

export type ExternalUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user";
};

function mapUser(user: User | null): ExternalUser | null {
  if (!user) return null;
  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  return { id: user.id, name: metadataName || user.email || null, email: user.email ?? null, role: "user" };
}

export async function sendExternalMagicLink(email: string) {
  assertSupabaseConfigured();
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export function useExternalAuth() {
  const [user, setUser] = useState<ExternalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError);
      setUser(mapUser(data.session?.user ?? null));
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const logout = useCallback(async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setUser(null);
  }, []);

  return useMemo(() => ({ user, loading, error, isAuthenticated: Boolean(user), refresh: async () => undefined, logout }), [error, loading, logout, user]);
}
