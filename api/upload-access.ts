import { getAuthorizedUser } from "./_supabase";
import { isApprovedUploader, isConfiguredOwnerEmail, UPLOAD_OWNER_EMAIL_ENV } from "./_upload-owner";

type RequestLike = { method?: string; headers: Record<string, string | string[] | undefined> };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void; setHeader: (name: string, value: string) => void };

function fail(res: ResponseLike, code: number, error: string) { res.status(code).json({ error }); }

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return fail(res, 405, "Method not allowed.");
  const user = await getAuthorizedUser(req.headers);
  if (!user) return fail(res, 401, "Sign in before checking upload access.");

  const ownerEmail = process.env[UPLOAD_OWNER_EMAIL_ENV];
  if (!isConfiguredOwnerEmail(ownerEmail)) return fail(res, 500, "Publisher access is not configured.");
  return res.status(200).json({ canUpload: isApprovedUploader(user.email, ownerEmail) });
}
