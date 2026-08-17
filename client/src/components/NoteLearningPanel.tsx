// Study Shelf note learning panel: private study actions, verified preview, annotations, recommendations, and transparent version history.
import { useAuth } from "@/_core/hooks/useAuth";
import { useExternalLibrary } from "@/lib/externalNotes";
import { addNoteToCollection, addToQueue, createAnnotation, getNotePreview, loadAnnotations, loadVersions, recommendedNotes, toggleOfflineItem, type Collection } from "@/lib/studyWorkspace";
import type { ExternalNote } from "@/lib/externalNotes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkPlus, Eye, FileClock, FileText, FolderHeart, History, Lightbulb, Loader2, MessageSquarePlus, WifiOff } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function NoteLearningPanel({ note, collections }: { note: ExternalNote; collections: Collection[] }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [collectionId, setCollectionId] = useState("");
  const [annotation, setAnnotation] = useState("");
  const [pageReference, setPageReference] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const preview = useQuery({ queryKey: ["note-preview", note.id], queryFn: () => getNotePreview(note.id), enabled: previewOpen, staleTime: 240_000 });
  const annotations = useQuery({ queryKey: ["note-annotations", user?.id, note.id], queryFn: () => loadAnnotations(String(user!.id), note.id), enabled: Boolean(user?.id) });
  const versions = useQuery({ queryKey: ["note-versions", note.id], queryFn: () => loadVersions(note.id), staleTime: 120_000 });
  const relatedQuery = useExternalLibrary({ query: "", sort: "recent" }, Boolean(user?.id));
  const addQueue = useMutation({ mutationFn: () => addToQueue(String(user!.id), note.id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["study-workspace", user?.id] }); toast.success("Added to your study queue."); }, onError: () => toast.error("Could not update your study queue.") });
  const addCollection = useMutation({ mutationFn: () => addNoteToCollection(collectionId, note.id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["study-workspace", user?.id] }); toast.success("Saved to your collection."); }, onError: () => toast.error("Could not update this collection.") });
  const addAnnotation = useMutation({ mutationFn: () => createAnnotation(String(user!.id), note.id, annotation, pageReference), onSuccess: () => { setAnnotation(""); setPageReference(""); queryClient.invalidateQueries({ queryKey: ["note-annotations", user?.id, note.id] }); toast.success("Private annotation saved."); }, onError: () => toast.error("Annotation could not be saved.") });
  const related = relatedQuery.data ? recommendedNotes(note, relatedQuery.data) : [];
  const saveOffline = async () => {
    try {
      const details = await getNotePreview(note.id);
      const result = toggleOfflineItem(note, details.previewUrl);
      navigator.serviceWorker?.controller?.postMessage({ type: "CACHE_STUDY_MATERIAL", url: details.previewUrl });
      toast.success(result.saved ? "Saved to your offline reading list." : "Removed from your offline reading list.");
    } catch {
      const result = toggleOfflineItem(note);
      toast.success(result.saved ? "Saved locally. Open it once online to cache the original file." : "Removed from your offline reading list.");
    }
  };
  return <section className="note-learning-panel"><div className="note-learning-panel__header"><span className="workspace-kicker"><Lightbulb className="h-3.5 w-3.5" />Study actions</span><h2>Use the material with intention.</h2></div><div className="note-action-grid"><button className="motion-press" type="button" onClick={() => { setPreviewOpen(true); void preview.refetch(); }}><Eye className="h-4 w-4" />Preview in browser</button><button className="motion-press" type="button" onClick={() => addQueue.mutate()} disabled={addQueue.isPending}><BookmarkPlus className="h-4 w-4" />Add to queue</button><button className="motion-press" type="button" onClick={() => void saveOffline()}><WifiOff className="h-4 w-4" />Save locally</button></div>{collections.length ? <div className="note-collection-row"><FolderHeart className="h-4 w-4" /><select className="motion-press" value={collectionId} onChange={event => setCollectionId(event.target.value)} aria-label="Choose collection"><option value="">Save to a collection…</option>{collections.map(collection => <option value={collection.id} key={collection.id}>{collection.name}</option>)}</select><button className="motion-press" type="button" onClick={() => collectionId && addCollection.mutate()} disabled={!collectionId || addCollection.isPending}>Save</button></div> : <Link href="/study-space" className="note-create-collection motion-press"><FolderHeart className="h-4 w-4" />Create a collection first</Link>}
    {previewOpen && <div className="note-preview-shell motion-confirm"><div><strong>Preview: {note.originalFileName}</strong><button className="motion-press" type="button" onClick={() => setPreviewOpen(false)}>Close</button></div>{preview.isLoading ? <p><Loader2 className="h-4 w-4 animate-spin" />Preparing a private preview…</p> : preview.error ? <p>Preview is unavailable for this material. Download it to read the original file.</p> : preview.data?.fileType === "pdf" ? <iframe src={preview.data.previewUrl} title={`Preview of ${note.title}`} /> : <a href={preview.data?.previewUrl} target="_blank" rel="noreferrer">Open the original file in a new tab</a>}</div>}
    <div className="note-annotation-block"><div><span className="workspace-kicker"><MessageSquarePlus className="h-3.5 w-3.5" />Private annotations</span><h3>Capture the insight, not just the file.</h3></div><form onSubmit={event => { event.preventDefault(); if (annotation.trim()) addAnnotation.mutate(); }}><input value={pageReference} onChange={event => setPageReference(event.target.value)} placeholder="Page / section (optional)" maxLength={80} /><textarea value={annotation} onChange={event => setAnnotation(event.target.value)} placeholder="What should future-you remember?" rows={3} maxLength={3000} /><button type="submit" disabled={!annotation.trim() || addAnnotation.isPending}>Save annotation</button></form><div className="annotation-list">{annotations.data?.slice(0, 3).map(item => <article key={item.id}><p>{item.body}</p><small>{item.pageReference ? `${item.pageReference} · ` : ""}{new Date(item.createdAt).toLocaleDateString()}</small></article>)}</div></div>
    <div className="note-related-grid"><div><span className="workspace-kicker"><FileClock className="h-3.5 w-3.5" />Version history</span>{versions.data?.length ? <ol>{versions.data.slice(0, 3).map(version => <li key={version.id}><History className="h-3.5 w-3.5" /><span>Version {version.revision}<small>{new Date(version.changedAt).toLocaleDateString()}</small></span></li>)}</ol> : <p>Initial version will appear after this material is updated.</p>}</div><div><span className="workspace-kicker"><FileText className="h-3.5 w-3.5" />Related next</span>{related.length ? <ol>{related.map(item => <li key={item.id}><Link href={`/notes/${item.id}`}>{item.title}</Link><small>{item.course}</small></li>)}</ol> : <p>Related materials will appear as the shelf grows.</p>}</div></div>
  </section>;
}
