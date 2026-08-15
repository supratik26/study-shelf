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

  return <main className="archive-detail-page container py-8 pb-20 sm:py-12 sm:pb-24">
    <Link href="/" className="editorial-text-button"><ArrowLeft className="h-4 w-4" />Back to library</Link>
    <div className="archive-detail-layout mt-7">
      <section className="archive-document-stage motion-reveal">
        <div className="archive-document-sheet"><p className="eyebrow">Study Shelf · {formatFileType(note.fileType)}</p><h2 className="mt-6 text-4xl leading-[0.9] text-[#151c4a]">{note.course}</h2><p className="mt-5 max-w-48 text-sm leading-6 text-[#151c4a]/65">{note.term || "Shared study material"}</p><p className="absolute bottom-7 left-7 right-7 text-xs font-semibold uppercase tracking-[0.13em] text-[#151c4a]/56">Original file available to download</p></div>
      </section>
      <section className="archive-detail-panel motion-rise motion-stagger-1">
        <div className="flex flex-wrap items-center gap-3"><span className="file-badge"><FileText className="h-3.5 w-3.5" />{formatFileType(note.fileType)}</span><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#151c4a]/55">{note.course}{note.term ? ` · ${note.term}` : ""}</span></div>
        <h1 className="archive-detail-title mt-7">{note.title}</h1>
        {note.description && <p className="mt-7 max-w-2xl text-base leading-7 text-[#151c4a]/74">{note.description}</p>}
        <div className="mt-7 flex flex-wrap gap-2">{note.tags.length ? note.tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[#151c4a]/20 bg-[#fffaf0]/54 px-3 py-1.5 text-sm font-semibold text-[#151c4a]/75"><Tag className="h-3 w-3" />{tag}</span>) : <span className="text-sm text-[#151c4a]/58">No tags were added.</span>}</div>
        <button className="editorial-button editorial-button--indigo mt-8 w-full justify-center py-4 text-base" disabled={isExternalDeployment ? externalDownload.isPending : download.isPending} onClick={() => void handleDownload()}>{(isExternalDeployment ? externalDownload.isPending : download.isPending) ? <><Loader2 className="h-4 w-4 animate-spin" />Preparing download…</> : <><Download className="h-5 w-5" />Download note</>}</button>
        <dl className="archive-meta-grid"><Meta label="Shared by" value={note.uploaderName} icon={<UserRound className="mr-1 inline h-3.5 w-3.5" />} /><Meta label="Added" value={formatDate(note.createdAt)} /><Meta label="File size" value={formatFileSize(note.fileSize)} /><Meta label="Downloads" value={`${note.downloadCount} ${note.downloadCount === 1 ? "download" : "downloads"}`} /></dl>
      </section>
    </div>
  </main>;
}

function Meta({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div><dt>{label}</dt><dd>{icon}{value}</dd></div>;
}
