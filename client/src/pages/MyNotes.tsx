import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDate, formatFileSize, formatFileType } from "@/lib/noteFormat";
import { trpc } from "@/lib/trpc";
import { removeExternalNote, updateExternalNote, useExternalMyNotes } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { NoteFileType } from "@shared/notes";
import { AlertTriangle, FileText, LibraryBig, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

type OwnedNote = {
  id: string | number; title: string; description: string | null; course: string; term: string | null; tags: string[]; originalFileName: string; fileType: NoteFileType; fileSize: number; downloadCount: number; createdAt: Date;
};

export default function MyNotes() {
  const { isAuthenticated, loading, user } = useAuth();
  const myNotes = trpc.notes.myUploads.useQuery(undefined, { enabled: !isExternalDeployment && isAuthenticated });
  const externalMyNotes = useExternalMyNotes(typeof user?.id === "string" ? user.id : undefined, isAuthenticated);
  const activeMyNotes = isExternalDeployment ? externalMyNotes : myNotes;
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const remove = trpc.notes.remove.useMutation({ onSuccess: async () => { await Promise.all([utils.notes.myUploads.invalidate(), utils.notes.search.invalidate()]); toast.success("The note was removed from the library."); } });
  const update = trpc.notes.update.useMutation({ onSuccess: async () => { await Promise.all([utils.notes.myUploads.invalidate(), utils.notes.search.invalidate()]); toast.success("The note details were updated."); } });
  const externalRemove = useMutation({ mutationFn: removeExternalNote, onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["external-my-notes"] }), queryClient.invalidateQueries({ queryKey: ["external-library"] })]); toast.success("The note was removed from the library."); } });
  const externalUpdate = useMutation({ mutationFn: ({ noteId, values }: { noteId: string; values: { title: string; course: string; term: string; description: string; tags: string[] } }) => updateExternalNote(noteId, values), onSuccess: async () => { await Promise.all([queryClient.invalidateQueries({ queryKey: ["external-my-notes"] }), queryClient.invalidateQueries({ queryKey: ["external-library"] })]); toast.success("The note details were updated."); } });
  const [editing, setEditing] = useState<OwnedNote | null>(null);
  const notes = (isExternalDeployment ? externalMyNotes.data : myNotes.data?.items ?? []) as OwnedNote[];

  if (loading) return <AuthLoading label="Opening your contributions" />;
  if (!isAuthenticated) return <SignInGate title="Keep your contributions in view." description="Sign in to see the notes you have added to the shared shelf." />;

  const deleteNote = async (note: OwnedNote) => {
    if (!window.confirm(`Remove “${note.title}” from the shared library?`)) return;
    try {
      if (isExternalDeployment) await externalRemove.mutateAsync(String(note.id));
      else await remove.mutateAsync({ noteId: Number(note.id) });
    } catch (error) { toast.error(error instanceof Error ? error.message : "This note could not be removed."); }
  };

  return (
    <main className="container py-12 pb-20 sm:py-16 sm:pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#171b4f]/16 pb-8"><div><p className="eyebrow">Your contribution</p><h1 className="editorial-title mt-4 text-5xl leading-[0.98] text-[#171b4f] sm:text-6xl">My notes</h1><p className="mt-4 max-w-lg leading-7 text-[#171b4f]/68">Edit the details, keep track of interest, or remove a note that no longer belongs on the shelf.</p></div><Link href="/upload" className="editorial-button editorial-button--amber"><Plus className="h-4 w-4" />Add a note</Link></div>
      <section className="mt-8">
        {activeMyNotes.isLoading ? <div className="space-y-4">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#171b4f]/8" />)}</div> : activeMyNotes.error ? <div className="rounded-[1.5rem] border border-dashed border-[#171b4f]/25 p-10 text-center"><AlertTriangle className="mx-auto h-7 w-7 text-[#b36f0c]" /><h2 className="mt-4 text-2xl font-semibold text-[#171b4f]">Your notes could not be loaded.</h2><button className="editorial-text-button mt-5" onClick={() => void activeMyNotes.refetch()}>Try again</button></div> : notes.length ? <div className="space-y-4">{notes.map(note => <article key={note.id} className="rounded-[1.3rem] border border-[#171b4f]/14 bg-[#f7f1e3] p-5 transition-shadow hover:shadow-[6px_7px_0_rgba(23,27,79,0.1)] sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="file-badge"><FileText className="h-3.5 w-3.5" />{formatFileType(note.fileType)}</span><span className="text-xs uppercase tracking-[0.15em] text-[#171b4f]/52">{note.course}{note.term ? ` · ${note.term}` : ""}</span></div><Link href={`/notes/${note.id}`} className="mt-3 block truncate text-2xl font-semibold tracking-[-0.035em] text-[#171b4f] hover:underline">{note.title}</Link><p className="mt-2 text-sm text-[#171b4f]/62">{note.originalFileName} · {formatFileSize(note.fileSize)} · {formatDate(note.createdAt)} · {note.downloadCount} downloads</p></div><div className="flex shrink-0 items-center gap-2"><button className="editorial-text-button" onClick={() => setEditing(note)}><Pencil className="h-3.5 w-3.5" />Edit</button><button className="editorial-text-button text-red-700 hover:bg-red-50" disabled={isExternalDeployment ? externalRemove.isPending : remove.isPending} onClick={() => void deleteNote(note)}><Trash2 className="h-3.5 w-3.5" />Remove</button></div></div></article>)}</div> : <div className="rounded-[1.5rem] border border-dashed border-[#171b4f]/25 bg-[#ece4d5]/55 px-6 py-14 text-center"><LibraryBig className="mx-auto h-8 w-8 text-[#b36f0c]" /><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#171b4f]">Your shelf is still a blank page.</h2><p className="mx-auto mt-4 max-w-lg leading-7 text-[#171b4f]/65">Add your first useful note and it will appear here for you to manage.</p><Link href="/upload" className="editorial-button editorial-button--indigo mt-8"><Plus className="h-4 w-4" />Add your first note</Link></div>}
      </section>
      {editing && <EditPanel note={editing} pending={isExternalDeployment ? externalUpdate.isPending : update.isPending} onClose={() => setEditing(null)} onSave={async values => { try { if (isExternalDeployment) await externalUpdate.mutateAsync({ noteId: String(editing.id), values }); else await update.mutateAsync({ noteId: Number(editing.id), ...values }); setEditing(null); } catch (error) { toast.error(error instanceof Error ? error.message : "The note details could not be updated."); } }} />}
    </main>
  );
}

function EditPanel({ note, pending, onClose, onSave }: { note: OwnedNote; pending: boolean; onClose: () => void; onSave: (values: { title: string; course: string; term: string; description: string; tags: string[] }) => Promise<void> }) {
  const [title, setTitle] = useState(note.title); const [course, setCourse] = useState(note.course); const [term, setTerm] = useState(note.term || ""); const [description, setDescription] = useState(note.description || ""); const [tags, setTags] = useState(note.tags.join(", "));
  const submit = (event: FormEvent) => { event.preventDefault(); void onSave({ title, course, term, description, tags: tags.split(",").map(tag => tag.trim()).filter(Boolean) }); };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171b4f]/40 p-4 backdrop-blur-sm"><div className="mx-auto my-8 max-w-2xl rounded-[1.5rem] bg-[#f7f1e3] p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-6"><div><p className="eyebrow">Refine the record</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171b4f]">Edit note details</h2></div><button className="editorial-text-button" onClick={onClose}>Cancel</button></div><form className="mt-7" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><EditField label="Title"><input className="editorial-input" value={title} onChange={event => setTitle(event.target.value)} required minLength={2} maxLength={180} /></EditField><EditField label="Subject or course"><input className="editorial-input" value={course} onChange={event => setCourse(event.target.value)} required minLength={2} maxLength={180} /></EditField><EditField label="Term"><input className="editorial-input" value={term} onChange={event => setTerm(event.target.value)} maxLength={100} /></EditField><EditField label="Tags"><input className="editorial-input" value={tags} onChange={event => setTags(event.target.value)} /></EditField></div><EditField label="A little context" className="mt-5"><textarea className="editorial-input min-h-28 resize-y py-3" value={description} onChange={event => setDescription(event.target.value)} maxLength={3000} /></EditField><div className="mt-7 flex justify-end gap-3"><button type="button" className="editorial-text-button" onClick={onClose}>Cancel</button><button className="editorial-button editorial-button--indigo" disabled={pending}>{pending ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save changes"}</button></div></form></div></div>;
}

function EditField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`block ${className}`}><span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#171b4f]/65">{label}</span>{children}</label>; }
