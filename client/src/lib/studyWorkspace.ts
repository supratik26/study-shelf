// Study Shelf learning workspace: client helpers only use the authenticated Supabase session and never expose server credentials.
import { supabase } from "@/lib/supabase";
import type { ExternalNote } from "@/lib/externalNotes";

export type Collection = { id: string; name: string; description: string | null; color: string; createdAt: string; itemCount: number };
export type QueueStatus = "up_next" | "in_progress" | "reviewed";
export type QueueItem = { noteId: string; status: QueueStatus; priority: number; scheduledFor: string | null; addedAt: string; note: ExternalNote | null };
export type WorkspaceRequest = { id: string; title: string; course: string; details: string | null; urgency: "low" | "normal" | "high"; status: "open" | "fulfilled" | "closed"; createdAt: string };
export type NoteAnnotation = { id: string; body: string; pageReference: string | null; createdAt: string };
export type NoteVersion = { id: string; revision: number; title: string; description: string | null; course: string; term: string | null; tags: string[]; changedAt: string };
export type Reminder = { id: string; noteId: string | null; title: string; reminderAt: string; isDone: boolean };
export type OfflineItem = { note: ExternalNote; savedAt: string; previewUrl?: string };

type NoteRow = { id: string; title: string; description: string | null; course: string; term: string | null; tags: unknown; original_file_name: string; file_type: ExternalNote["fileType"]; mime_type: string; file_size: number; download_count: number; created_at: string };

const OFFLINE_KEY = "study-shelf-offline-items-v1";

function tags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
  return [];
}

export function mapWorkspaceNote(row: NoteRow): ExternalNote {
  return { id: row.id, title: row.title, description: row.description, course: row.course, term: row.term, tags: tags(row.tags), originalFileName: row.original_file_name, fileType: row.file_type, mimeType: row.mime_type, fileSize: Number(row.file_size), downloadCount: row.download_count, createdAt: new Date(row.created_at), uploaderName: "A Study Shelf member" };
}

export async function getSessionToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token;
}

export async function getNotePreview(noteId: string) {
  const token = await getSessionToken();
  if (!token) throw new Error("Sign in before previewing a note.");
  const response = await fetch(`/api/preview?noteId=${encodeURIComponent(noteId)}`, { headers: { Authorization: `Bearer ${token}` } });
  const payload = await response.json() as { previewUrl?: string; fileName?: string; fileType?: string; error?: string };
  if (!response.ok || !payload.previewUrl) throw new Error(payload.error || "The preview could not be prepared.");
  return { previewUrl: payload.previewUrl, fileName: payload.fileName || "Study material", fileType: payload.fileType || "" };
}

export async function loadWorkspace(userId: string) {
  const [notesResult, collectionsResult, queueResult, requestsResult, remindersResult] = await Promise.all([
    supabase.from("notes").select("id,title,description,course,term,tags,original_file_name,file_type,mime_type,file_size,download_count,created_at").order("created_at", { ascending: false }).limit(80),
    supabase.from("study_collections").select("id,name,description,color,created_at,study_collection_items(note_id)").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("user_note_queue").select("note_id,status,priority,scheduled_for,added_at,notes(id,title,description,course,term,tags,original_file_name,file_type,mime_type,file_size,download_count,created_at)").eq("user_id", userId).order("priority", { ascending: true }).order("added_at", { ascending: false }),
    supabase.from("contribution_requests").select("id,title,course,details,urgency,status,created_at").order("created_at", { ascending: false }).limit(30),
    supabase.from("note_reminders").select("id,note_id,title,reminder_at,is_done").eq("user_id", userId).order("reminder_at", { ascending: true }),
  ]);
  const errors = [notesResult.error, collectionsResult.error, queueResult.error, requestsResult.error, remindersResult.error].filter(Boolean);
  if (errors.length) throw errors[0];
  const notes = ((notesResult.data || []) as NoteRow[]).map(mapWorkspaceNote);
  const collections = (collectionsResult.data || []).map((row: any): Collection => ({ id: row.id, name: row.name, description: row.description, color: row.color, createdAt: row.created_at, itemCount: Array.isArray(row.study_collection_items) ? row.study_collection_items.length : 0 }));
  const queue = (queueResult.data || []).map((row: any): QueueItem => ({ noteId: row.note_id, status: row.status, priority: row.priority, scheduledFor: row.scheduled_for, addedAt: row.added_at, note: row.notes ? mapWorkspaceNote(row.notes as NoteRow) : null }));
  const requests = (requestsResult.data || []).map((row: any): WorkspaceRequest => ({ id: row.id, title: row.title, course: row.course, details: row.details, urgency: row.urgency, status: row.status, createdAt: row.created_at }));
  const reminders = (remindersResult.data || []).map((row: any): Reminder => ({ id: row.id, noteId: row.note_id, title: row.title, reminderAt: row.reminder_at, isDone: row.is_done }));
  return { notes, collections, queue, requests, reminders };
}

export async function loadAnnotations(userId: string, noteId: string) {
  const { data, error } = await supabase.from("note_annotations").select("id,body,page_reference,created_at").eq("user_id", userId).eq("note_id", noteId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any): NoteAnnotation => ({ id: row.id, body: row.body, pageReference: row.page_reference, createdAt: row.created_at }));
}

export async function loadVersions(noteId: string) {
  const { data, error } = await supabase.from("note_versions").select("id,revision,title,description,course,term,tags,changed_at").eq("note_id", noteId).order("revision", { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any): NoteVersion => ({ id: row.id, revision: row.revision, title: row.title, description: row.description, course: row.course, term: row.term, tags: tags(row.tags), changedAt: row.changed_at }));
}

export async function createCollection(userId: string, name: string, description: string, color: string) {
  const { error } = await supabase.from("study_collections").insert({ user_id: userId, name: name.trim(), description: description.trim() || null, color });
  if (error) throw error;
}

export async function addNoteToCollection(collectionId: string, noteId: string) {
  const { error } = await supabase.from("study_collection_items").upsert({ collection_id: collectionId, note_id: noteId }, { onConflict: "collection_id,note_id" });
  if (error) throw error;
}

export async function addToQueue(userId: string, noteId: string) {
  const { error } = await supabase.from("user_note_queue").upsert({ user_id: userId, note_id: noteId, status: "up_next", priority: 2, updated_at: new Date().toISOString() }, { onConflict: "user_id,note_id" });
  if (error) throw error;
}

export async function updateQueue(noteId: string, userId: string, values: Partial<{ status: QueueStatus; priority: number; scheduledFor: string | null }>) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (values.status) payload.status = values.status;
  if (typeof values.priority === "number") payload.priority = values.priority;
  if ("scheduledFor" in values) payload.scheduled_for = values.scheduledFor;
  const { error } = await supabase.from("user_note_queue").update(payload).eq("user_id", userId).eq("note_id", noteId);
  if (error) throw error;
}

export async function createAnnotation(userId: string, noteId: string, body: string, pageReference: string) {
  const { error } = await supabase.from("note_annotations").insert({ user_id: userId, note_id: noteId, body: body.trim(), page_reference: pageReference.trim() || null });
  if (error) throw error;
}

export async function createRequest(userId: string, title: string, course: string, details: string, urgency: WorkspaceRequest["urgency"]) {
  const { error } = await supabase.from("contribution_requests").insert({ user_id: userId, title: title.trim(), course: course.trim(), details: details.trim() || null, urgency });
  if (error) throw error;
}

export async function createReminder(userId: string, title: string, reminderAt: string, noteId?: string) {
  const { error } = await supabase.from("note_reminders").insert({ user_id: userId, note_id: noteId || null, title: title.trim(), reminder_at: new Date(reminderAt).toISOString() });
  if (error) throw error;
}

export async function markReminderDone(id: string, isDone: boolean) {
  const { error } = await supabase.from("note_reminders").update({ is_done: isDone, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export function recommendedNotes(note: ExternalNote, allNotes: ExternalNote[]) {
  return allNotes.filter(candidate => candidate.id !== note.id).map(candidate => ({ note: candidate, score: (candidate.course === note.course ? 4 : 0) + candidate.tags.filter(tag => note.tags.includes(tag)).length * 2 })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.note);
}

export function readOfflineItems(): OfflineItem[] {
  try { const parsed = JSON.parse(localStorage.getItem(OFFLINE_KEY) || "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export function toggleOfflineItem(note: ExternalNote, previewUrl?: string) {
  const items = readOfflineItems();
  const existing = items.find(item => item.note.id === note.id);
  const next = existing ? items.filter(item => item.note.id !== note.id) : [{ note, savedAt: new Date().toISOString(), previewUrl }, ...items].slice(0, 50);
  try { localStorage.setItem(OFFLINE_KEY, JSON.stringify(next)); } catch { /* local storage may be unavailable */ }
  return { items: next, saved: !existing };
}
