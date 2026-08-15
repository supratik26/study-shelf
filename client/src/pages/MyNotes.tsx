import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDate, formatFileSize, formatFileType } from "@/lib/noteFormat";
import { trpc } from "@/lib/trpc";
import { removeExternalNote, updateExternalNote, useExternalMyNotes, useExternalUploadAccess } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NoteFileType } from "@shared/notes";
import { AlertTriangle, FileText, LibraryBig, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type OwnedNote = {
  id: string | number; title: string; description: string | null; course: string; term: string | null; tags: string[]; originalFileName: string; fileType: NoteFileType; fileSize: number; downloadCount: number; createdAt: Date;
};

export default function MyNotes() {
  const { isAuthenticated, loading, user } = useAuth();
  const myNotes = trpc.notes.myUploads.useQuery(undefined, { enabled: !isExternalDeployment && isAuthenticated });
  const externalMyNotes = useExternalMyNotes(typeof user?.id === "string" ? user.id : undefined, isAuthenticated);
  const externalUploadAccess = useExternalUploadAccess(isAuthenticated);
  const activeMyNotes = isExternalDeployment ? externalMyNotes : myNotes;
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const remove = trpc.notes.remove.useMutation({ onSuccess: async () => { await Promise.all([utils.notes.myUploads.invalidate(), utils.notes.search.invalidate()]); toast.success("The note was removed from the library."); } });
  const update = trpc.notes.update.useMutation({ onSuccess: async () => { await Promise.all([utils.notes.myUploads.invalidate(), utils.notes.search.invalidate()]); toast.success("The note details were updated."); } });
  const externalRemove = useMutation({ mutationFn: removeExternalNote, onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["external-my-notes"] }), queryClient.invalidateQueries({ queryKey: ["external-library"] })]); toast.success("The note was removed from the library."); } });
  const externalUpdate = useMutation({ mutationFn: ({ noteId, values }: { noteId: string; values: { title: string; course: string; term: string; description: string; tags: string[] } }) => updateExternalNote(noteId, values), onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["external-my-notes"] }), queryClient.invalidateQueries({ queryKey: ["external-library"] })]); toast.success("The note details were updated."); } });
  const [editing, setEditing] = useState<OwnedNote | null>(null);
  const [query, setQuery] = useState("");
  const notes = (isExternalDeployment ? externalMyNotes.data ?? [] : myNotes.data?.items ?? []) as OwnedNote[];
  const canUpload = !isExternalDeployment || externalUploadAccess.data === true;
  const filteredNotes = useMemo(() => {
    const phrase = query.trim().toLowerCase();
    if (!phrase) return notes;
    return notes.filter(note => [note.title, note.course, note.term || "", ...note.tags].join(" ").toLowerCase().includes(phrase));
  }, [notes, query]);
  const totalDownloads = notes.reduce((total, note) => total + note.downloadCount, 0);
  const formats = new Set(notes.map(note => note.fileType)).size;

  if (loading) return <AuthLoading label="Opening your contributions" />;
  if (!isAuthenticated) return <SignInGate title="Keep your contributions in view." description="Sign in to see the notes you have added to the shared shelf." />;

  const deleteNote = async (note: OwnedNote) => {
    if (!window.confirm(`Remove “${note.title}” from the shared library?`)) return;
    try {
      if (isExternalDeployment) await externalRemove.mutateAsync(String(note.id));
      else await remove.mutateAsync({ noteId: Number(note.id) });
    } catch (error) { toast.error(error instanceof Error ? error.message : "This note could not be removed."); }
  };

  return <main className="archive-dashboard archive-dashboard--amoled container pb-22">
    <div className="archive-dashboard-top motion-rise flex flex-wrap items-end justify-between gap-7"><div><p className="eyebrow">Personal archive</p><h1 className="archive-display mt-5">Your collection</h1><p className="mt-5 max-w-xl text-base leading-7 text-[#151c4a]/70">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Keep your shared materials organized and ready for the next study session.</p></div>{canUpload ? <Link href="/upload" className="editorial-button editorial-button--amber"><Plus className="h-4 w-4" />Add a note</Link> : null}</div>
    <section className="mt-9"><p className="eyebrow">Real activity</p><div className="mt-4 flex flex-wrap gap-4"><Stat value={notes.length} label="Uploads" /><Stat value={totalDownloads} label="Downloads" /><Stat value={formats} label="Formats" /></div></section>
    <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">Your contributions</p><h2 className="mt-2 text-4xl text-[#151c4a]">Published notes</h2></div>{notes.length ? <label className="archive-input-shell relative block w-full max-w-sm"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#151c4a]/50" /><input value={query} onChange={event => setQuery(event.target.value)} className="library-search-input h-12 w-full rounded-full pl-10 pr-4 text-sm outline-none" placeholder="Search your notes…" /></label> : null}</div>
      <div className="mt-6">{activeMyNotes.isLoading ? <div className="space-y-4">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#151c4a]/8" />)}</div> : activeMyNotes.error ? <State icon={<AlertTriangle />} title="Your notes could not be loaded." description="Please try opening your collection again." action="Try again" onAction={() => void activeMyNotes.refetch()} /> : filteredNotes.length ? <div className="grid gap-4">{filteredNotes.map((note, index) => <article key={note.id} className="archive-managed-note motion-card p-5 sm:p-6" style={{ "--card-index": index } as React.CSSProperties}><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="file-badge"><FileText className="h-3.5 w-3.5" />{formatFileType(note.fileType)}</span><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#151c4a]/53">{note.course}{note.term ? ` · ${note.term}` : ""}</span></div><Link href={`/notes/${note.id}`} className="mt-4 block truncate text-3xl leading-none text-[#151c4a] hover:underline">{note.title}</Link><p className="mt-3 text-sm text-[#151c4a]/65">{note.originalFileName} · {formatFileSize(note.fileSize)} · Added {formatDate(note.createdAt)} · {note.downloadCount} downloads</p></div><div className="flex shrink-0 items-center gap-2"><button className="editorial-text-button" onClick={() => setEditing(note)}><Pencil className="h-3.5 w-3.5" />Edit</button><button className="editorial-text-button text-[#b24842] hover:bg-[#efc4c2]/30" disabled={isExternalDeployment ? externalRemove.isPending : remove.isPending} onClick={() => void deleteNote(note)}><Trash2 className="h-3.5 w-3.5" />Remove</button></div></div></article>)}</div> : query ? <State icon={<Search />} title="No notes match this search." description="Try another title, subject, or tag from one of your uploaded notes." action="Clear search" onAction={() => setQuery("")} /> : <State icon={<LibraryBig />} title="Your shelf is still a blank page." description={canUpload ? "Add your first useful note and it will appear here for you to manage." : "Only the library owner can add notes. You can return to the shared library to browse and download material."} action={canUpload ? "Add your first note" : "Browse the library"} linkTo={canUpload ? "/upload" : "/"} />}</div>
    </section>
    {editing && <EditPanel note={editing} pending={isExternalDeployment ? externalUpdate.isPending : update.isPending} onClose={() => setEditing(null)} onSave={async values => { try { if (isExternalDeployment) await externalUpdate.mutateAsync({ noteId: String(editing.id), values }); else await update.mutateAsync({ noteId: Number(editing.id), ...values }); setEditing(null); } catch (error) { toast.error(error instanceof Error ? error.message : "The note details could not be updated."); } }} />}
  </main>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="archive-stat"><span className="archive-stat-number">{value}</span><span className="archive-stat-label">{label}</span></div>; }
function State({ icon, title, description, action, onAction, linkTo }: { icon: React.ReactNode; title: string; description: string; action: string; onAction?: () => void; linkTo?: string }) { return <div className="archive-empty-state motion-reveal rounded-[1.5rem] border border-dashed border-[#151c4a]/28 bg-[#fffaf0]/68 px-6 py-14 text-center"><span className="inline-flex rounded-full bg-[#f2bd9d]/55 p-3 text-[#151c4a]">{icon}</span><h3 className="mt-5 text-3xl text-[#151c4a]">{title}</h3><p className="mx-auto mt-4 max-w-lg leading-7 text-[#151c4a]/65">{description}</p>{linkTo ? <Link href={linkTo} className="editorial-button editorial-button--indigo mt-8">{action}</Link> : <button className="editorial-button editorial-button--indigo mt-8" onClick={onAction}>{action}</button>}</div>; }

function EditPanel({ note, pending, onClose, onSave }: { note: OwnedNote; pending: boolean; onClose: () => void; onSave: (values: { title: string; course: string; term: string; description: string; tags: string[] }) => Promise<void> }) {
  const [title, setTitle] = useState(note.title); const [course, setCourse] = useState(note.course); const [term, setTerm] = useState(note.term || ""); const [description, setDescription] = useState(note.description || ""); const [tags, setTags] = useState(note.tags.join(", "));
  const submit = (event: FormEvent) => { event.preventDefault(); void onSave({ title, course, term, description, tags: tags.split(",").map(tag => tag.trim()).filter(Boolean) }); };
  return <div className="archive-edit-overlay fixed inset-0 z-50 overflow-y-auto bg-[#171b4f]/40 p-4 backdrop-blur-sm"><div className="archive-edit-panel mx-auto my-8 max-w-2xl rounded-[1.5rem] bg-[#f7f1e3] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-6"><div><p className="eyebrow">Refine the record</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171b4f]">Edit note details</h2></div><button className="editorial-text-button" onClick={onClose}>Cancel</button></div><form className="mt-7" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><EditField label="Title"><input className="editorial-input" value={title} onChange={event => setTitle(event.target.value)} required minLength={2} maxLength={180} /></EditField><EditField label="Subject or course"><input className="editorial-input" value={course} onChange={event => setCourse(event.target.value)} required minLength={2} maxLength={180} /></EditField><EditField label="Term"><input className="editorial-input" value={term} onChange={event => setTerm(event.target.value)} maxLength={100} /></EditField><EditField label="Tags"><input className="editorial-input" value={tags} onChange={event => setTags(event.target.value)} /></EditField></div><EditField label="A little context" className="mt-5"><textarea className="editorial-input min-h-28 resize-y py-3" value={description} onChange={event => setDescription(event.target.value)} maxLength={3000} /></EditField><div className="mt-7 flex justify-end gap-3"><button type="button" className="editorial-text-button" onClick={onClose}>Cancel</button><button className="editorial-button editorial-button--indigo" disabled={pending}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save changes"}</button></div></form></div></div>;
}

function EditField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#171b4f]/65">{label}</span>{children}</label>; }
