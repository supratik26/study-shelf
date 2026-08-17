import { getAuthorizedUser, getServerSupabase } from "./_supabase.js";

type RequestLike = { method?: string; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void; setHeader: (name: string, value: string) => void };

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  if (!(await getAuthorizedUser(req.headers))) return res.status(401).json({ error: "Sign in before previewing a note." });
  const rawId = req.query?.noteId;
  const noteId = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!noteId || !/^[0-9a-f-]{36}$/i.test(noteId)) return res.status(400).json({ error: "Invalid note identifier." });
  const supabase = getServerSupabase();
  const { data: note, error } = await supabase.from("notes").select("storage_path, original_file_name, file_type").eq("id", noteId).single();
  if (error || !note) return res.status(404).json({ error: "This note is no longer available." });
  const { data: signed, error: signError } = await supabase.storage.from("notes").createSignedUrl(note.storage_path, 300);
  if (signError || !signed?.signedUrl) return res.status(500).json({ error: "The preview could not be prepared." });
  return res.status(200).json({ previewUrl: signed.signedUrl, fileName: note.original_file_name, fileType: note.file_type });
}
