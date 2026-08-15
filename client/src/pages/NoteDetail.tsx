import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatDate, formatFileSize, formatFileType } from "@/lib/noteFormat";
import { trpc } from "@/lib/trpc";
import { downloadExternalNote, useExternalNote } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, Loader2, Tag, UserRound } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function NoteDetail({ noteId }: { noteId: string }) {
  const { isAuthenticated, loading } = useAuth();
  const numericNoteId = Number(noteId);
  const noteQuery = trpc.notes.getById.useQuery({ noteId: numericNoteId }, { enabled: !isExternalDeployment && isAuthenticated && Number.isFinite(numericNoteId) });
  const externalNoteQuery = useExternalNote(noteId, isAuthenticated);
  const activeNoteQuery = isExternalDeployment ? externalNoteQuery : noteQuery;
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const download = trpc.notes.registerDownload.useMutation({
    onSuccess: async result => {
      await Promise.all([utils.notes.getById.invalidate({ noteId: numericNoteId }), utils.notes.search.invalidate(), utils.notes.myUploads.invalidate()]);
      const anchor = document.createElement("a");
      anchor.href = result.downloadUrl;
      anchor.download = result.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("Your download is starting.");
    },
  });
  const externalDownload = useMutation({
    mutationFn: downloadExternalNote,
    onSuccess: async result => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["external-note", noteId] }), queryClient.invalidateQueries({ queryKey: ["external-library"] })]);
      const anchor = document.createElement("a");
      anchor.href = result.downloadUrl;
      anchor.download = result.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      toast.success("Your download is starting.");
    },
  });

  if (loading) return <AuthLoading label="Finding this note" />;
  if (!isAuthenticated) return <SignInGate title="The detail is in the materials." description="Sign in to read full note details and download from your study group’s shelf." />;
  if (activeNoteQuery.isLoading) return <main className="container py-14"><div className="h-4 w-32 animate-pulse rounded bg-[#171b4f]/10" /><div className="mt-12 h-16 max-w-3xl animate-pulse rounded bg-[#171b4f]/10" /><div className="mt-6 h-8 max-w-xl animate-pulse rounded bg-[#171b4f]/8" /></main>;
  if (activeNoteQuery.error || !activeNoteQuery.data) return <main className="container py-20"><Link href="/" className="editorial-text-button"><ArrowLeft className="h-4 w-4" />Back to library</Link><div className="mt-12 rounded-[1.5rem] border border-dashed border-[#171b4f]/25 bg-[#ece4d5]/55 p-10 text-center"><h1 className="text-3xl font-semibold text-[#171b4f]">This note is no longer on the shelf.</h1><p className="mt-3 text-[#171b4f]/65">It may have been removed by the person who shared it.</p></div></main>;

  const note = activeNoteQuery.data;
  const handleDownload = async () => {
    try {
      if (isExternalDeployment) await externalDownload.mutateAsync(noteId);
      else await download.mutateAsync({ noteId: numericNoteId });
    } catch (error) { toast.error(error instanceof Error ? error.message : "The download could not be started."); }
  };

  return (
    <main className="container py-10 pb-20 sm:py-14 sm:pb-24">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#171b4f]/68 transition-colors hover:text-[#171b4f]"><ArrowLeft className="h-4 w-4" />Back to library</Link>
      <div className="mt-9 grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
        <section>
          <div className="flex items-center gap-3"><span className="file-badge"><FileText className="h-3.5 w-3.5" />{formatFileType(note.fileType)}</span><p className="text-xs uppercase tracking-[0.16em] text-[#171b4f]/54">{note.course}{note.term ? ` · ${note.term}` : ""}</p></div>
          <h1 className="editorial-title mt-7 max-w-4xl text-5xl leading-[0.99] text-[#171b4f] sm:text-7xl">{note.title}</h1>
          {note.description && <p className="mt-8 max-w-3xl text-lg leading-8 text-[#171b4f]/73">{note.description}</p>}
          <div className="mt-10 flex flex-wrap gap-2">{note.tags.length ? note.tags.map(tag => <span key={tag} className="rounded-full border border-[#171b4f]/14 bg-[#ece4d5]/75 px-3 py-1.5 text-sm text-[#171b4f]/72">#{tag}</span>) : <span className="text-sm text-[#171b4f]/55">No tags were added.</span>}</div>
          <div className="mt-12 flex flex-wrap items-center gap-5 border-y border-[#171b4f]/15 py-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#171b4f] text-[#f7f1e3]"><UserRound className="h-4 w-4" /></span><div><p className="text-xs uppercase tracking-[0.14em] text-[#171b4f]/50">Shared by</p><p className="mt-1 text-sm font-semibold text-[#171b4f]">{note.uploaderName}</p></div></div><div className="h-10 w-px bg-[#171b4f]/14" /><div><p className="text-xs uppercase tracking-[0.14em] text-[#171b4f]/50">Added</p><p className="mt-1 text-sm font-semibold text-[#171b4f]">{formatDate(note.createdAt)}</p></div></div>
        </section>
        <aside className="self-start rounded-[1.5rem] border border-[#171b4f]/16 bg-[#ece4d5]/72 p-6 shadow-[8px_8px_0_rgba(210,139,23,0.34)] sm:p-7">
          <p className="eyebrow">Ready to read</p>
          <p className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#171b4f]">{note.originalFileName}</p>
          <dl className="mt-7 divide-y divide-[#171b4f]/13 border-y border-[#171b4f]/13 text-sm"><Meta label="File type" value={formatFileType(note.fileType)} /><Meta label="File size" value={formatFileSize(note.fileSize)} /><Meta label="Downloads" value={`${note.downloadCount} ${note.downloadCount === 1 ? "download" : "downloads"}`} /></dl>
          <button className="editorial-button editorial-button--amber mt-7 w-full justify-center" disabled={isExternalDeployment ? externalDownload.isPending : download.isPending} onClick={() => void handleDownload()}>{(isExternalDeployment ? externalDownload.isPending : download.isPending) ? <><Loader2 className="h-4 w-4 animate-spin" />Preparing…</> : <><Download className="h-4 w-4" />Download note</>}</button>
          <p className="mt-4 text-center text-xs leading-5 text-[#171b4f]/56">The library records each download so useful material is easier to spot.</p>
        </aside>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-5 py-3.5"><dt className="text-[#171b4f]/60">{label}</dt><dd className="text-right font-semibold text-[#171b4f]">{value}</dd></div>;
}
