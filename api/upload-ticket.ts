import { randomUUID } from "node:crypto";
import { getAuthorizedUser, getServerSupabase } from "./_supabase";

type RequestLike = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void; setHeader: (name: string, value: string) => void };

const rules = {
  pdf: ["application/pdf"], docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"], txt: ["text/plain"], md: ["text/markdown", "text/x-markdown"],
} as const;
const maxBytes = 10 * 1024 * 1024;

function fail(res: ResponseLike, code: number, error: string) { res.status(code).json({ error }); }

export function validateUploadMetadata(body: Record<string, unknown>) {
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const fileType = typeof body.fileType === "string" ? body.fileType.toLowerCase() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : 0;
  if (!fileName || !Object.hasOwn(rules, fileType) || !Number.isFinite(fileSize) || fileSize <= 0 || fileSize > maxBytes) {
    return { ok: false as const, error: "Use a supported, non-empty note file up to 10 MB." };
  }
  const allowed = rules[fileType as keyof typeof rules];
  if (!allowed.includes(mimeType as never)) return { ok: false as const, error: "The file type does not match its allowed format." };
  return { ok: true as const, fileType };
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return fail(res, 405, "Method not allowed.");
  const user = await getAuthorizedUser(req.headers);
  if (!user) return fail(res, 401, "Sign in before uploading a note.");
  const body = (req.body ?? {}) as Record<string, unknown>;
  const validation = validateUploadMetadata(body);
  if (!validation.ok) return fail(res, 400, validation.error);
  const suffix = validation.fileType === "md" ? "md" : validation.fileType;
  const path = `${user.id}/${randomUUID()}.${suffix}`;
  const { data, error } = await getServerSupabase().storage.from("notes").createSignedUploadUrl(path, { upsert: false });
  if (error || !data) return fail(res, 500, "A secure upload link could not be created.");
  return res.status(200).json({ path, token: data.token });
}
