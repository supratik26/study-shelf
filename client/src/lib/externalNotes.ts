import { useQuery } from "@tanstack/react-query";
import type { NoteFileType } from "@shared/notes";
import { assertSupabaseConfigured, isExternalDeployment, supabase } from "./supabase";

export type ExternalNote = {
  id: string;
  title: string;
  description: string | null;
  course: string;
  term: string | null;
  tags: string[];
  originalFileName: string;
  fileType: NoteFileType;
  mimeType: string;
  fileSize: number;
  downloadCount: number;
  createdAt: Date;
  uploaderName: string;
};

type NoteRow = {
  id: string; title: string; description: string | null; course: string; term: string | null; tags: string[] | null;
  original_file_name: string; file_type: NoteFileType; mime_type: string; file_size: number; download_count: number; created_at: string;
};

function mapNote(row: NoteRow): ExternalNote {
  return {
    id: row.id, title: row.title, description: row.description, course: row.course, term: row.term, tags: row.tags ?? [],
    originalFileName: row.original_file_name, fileType: row.file_type, mimeType: row.mime_type, fileSize: Number(row.file_size),
    downloadCount: row.download_count, createdAt: new Date(row.created_at), uploaderName: "A Study Shelf member",
  };
}

function cleanSearch(value: string) { return value.replace(/[,%()]/g, " ").trim().slice(0, 120); }

export function useExternalLibrary(input: { query?: string; fileType?: NoteFileType; sort: "recent" | "title" | "downloads" }, enabled: boolean) {
  return useQuery({
    queryKey: ["external-library", input],
    enabled: isExternalDeployment && enabled,
    queryFn: async () => {
      assertSupabaseConfigured();
      let request = supabase.from("notes").select("*");
      const query = cleanSearch(input.query ?? "");
      if (query) request = request.or(`title.ilike.%${query}%,course.ilike.%${query}%,description.ilike.%${query}%`);
      if (input.fileType) request = request.eq("file_type", input.fileType);
      if (input.sort === "title") request = request.order("title", { ascending: true });
      else if (input.sort === "downloads") request = request.order("download_count", { ascending: false });
      else request = request.order("created_at", { ascending: false });
      const { data, error } = await request.limit(60);
      if (error) throw error;
      return (data as NoteRow[]).map(mapNote);
    },
  });
}

export function useExternalNote(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ["external-note", id],
    enabled: isExternalDeployment && enabled && Boolean(id),
    queryFn: async () => {
      assertSupabaseConfigured();
      const { data, error } = await supabase.from("notes").select("*").eq("id", id).single();
      if (error) throw error;
      return mapNote(data as NoteRow);
    },
  });
}

export function useExternalMyNotes(ownerId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["external-my-notes", ownerId],
    enabled: isExternalDeployment && enabled && Boolean(ownerId),
    queryFn: async () => {
      assertSupabaseConfigured();
      const { data, error } = await supabase.from("notes").select("*").eq("owner_id", ownerId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data as NoteRow[]).map(mapNote);
    },
  });
}

export async function publishExternalNote(input: { title: string; course: string; term: string; description: string; tags: string[]; file: File; fileType: NoteFileType; mimeType: string }) {
  assertSupabaseConfigured();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const user = sessionData.session?.user;
  if (!token || !user) throw new Error("Sign in before publishing a note.");
  const ticketResponse = await fetch("/api/upload-ticket", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ fileName: input.file.name, fileType: input.fileType, mimeType: input.mimeType, fileSize: input.file.size }),
  });
  const ticket = await ticketResponse.json() as { error?: string; path?: string; token?: string };
  if (!ticketResponse.ok || !ticket.path || !ticket.token) throw new Error(ticket.error || "The secure upload could not be prepared.");
  const { error: uploadError } = await supabase.storage.from("notes").uploadToSignedUrl(ticket.path, ticket.token, input.file, { contentType: input.mimeType });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.from("notes").insert({
    owner_id: user.id, title: input.title.trim(), course: input.course.trim(), term: input.term.trim() || null,
    description: input.description.trim() || null, tags: input.tags, original_file_name: input.file.name, file_type: input.fileType,
    mime_type: input.mimeType, file_size: input.file.size, storage_path: ticket.path,
  }).select("*").single();
  if (error) { await supabase.storage.from("notes").remove([ticket.path]); throw error; }
  return mapNote(data as NoteRow);
}

export async function downloadExternalNote(noteId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Sign in before downloading a note.");
  const response = await fetch(`/api/download?noteId=${encodeURIComponent(noteId)}`, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json() as { error?: string; downloadUrl?: string; fileName?: string };
  if (!response.ok || !result.downloadUrl || !result.fileName) throw new Error(result.error || "The download could not be started.");
  return { downloadUrl: result.downloadUrl, fileName: result.fileName };
}

export async function updateExternalNote(noteId: string, values: { title: string; course: string; term: string; description: string; tags: string[] }) {
  const { error } = await supabase.from("notes").update({ title: values.title.trim(), course: values.course.trim(), term: values.term.trim() || null, description: values.description.trim() || null, tags: values.tags, updated_at: new Date().toISOString() }).eq("id", noteId);
  if (error) throw error;
}

export async function removeExternalNote(noteId: string) {
  const { data, error } = await supabase.from("notes").select("storage_path").eq("id", noteId).single();
  if (error) throw error;
  const { error: deleteError } = await supabase.from("notes").delete().eq("id", noteId);
  if (deleteError) throw deleteError;
  if (data?.storage_path) await supabase.storage.from("notes").remove([data.storage_path]);
}
