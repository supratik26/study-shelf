import { getAuthorizedUser, getServerSupabase } from "./_supabase";

type RequestLike = { method?: string; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void; setHeader: (name: string, value: string) => void };

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const user = await getAuthorizedUser(req.headers);
  if (!user) return res.status(401).json({ error: "Sign in before downloading a note." });
  const rawId = req.query?.noteId;
  const noteId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!noteId || !/^[0-9a-f-]{36}$/i.test(noteId)) return res.status(400).json({ error: "Invalid note identifier." });
  const supabase = getServerSupabase();
  const { data: registeredData, error: registerError } = await supabase.rpc("register_note_download", { p_note_id: noteId }).single();
  const registered = registeredData as { storage_path: string; original_file_name: string; next_download_count: number } | null;
  if (registerError || !registered) return res.status(404).json({ error: "This note is no longer available." });
  const { data: signed, error: signError } = await supabase.storage.from("notes").createSignedUrl(registered.storage_path, 60);
  if (signError || !signed?.signedUrl) return res.status(500).json({ error: "The download link could not be prepared." });
  return res.status(200).json({ downloadUrl: signed.signedUrl, fileName: registered.original_file_name });
}
