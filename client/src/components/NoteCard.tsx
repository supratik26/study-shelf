// Study Shelf archival note cards: memoize stable records so live search stays smooth at high refresh rates.
import type { NoteFileType } from "@shared/notes";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import { memo } from "react";
import { Link } from "wouter";
import { formatDate, formatFileType, formatTags } from "@/lib/noteFormat";

export type LibraryNote = { id: string | number; title: string; course: string; term: string | null; tags: string[]; fileType: NoteFileType; downloadCount: number; createdAt: Date; uploaderName: string };
const tones = ["sage", "sky", "peach", "lilac", "butter", "rose"];

const NoteCard = memo(function NoteCard({ note, cardIndex = 0, cardNumber = 1 }: { note: LibraryNote; cardIndex?: number; cardNumber?: number }) {
  const tone = tones[(cardNumber - 1) % tones.length];
  const tags = Array.isArray(note.tags) ? note.tags : [];
  const staggerIndex = Math.min(cardIndex, 5);
  return <article className={`note-card archive-note-card--${tone} motion-card motion-press group flex flex-col justify-between`} style={{ "--card-index": staggerIndex } as React.CSSProperties}><div><div className="flex items-start justify-between gap-4"><span className="archive-card-number">{String(cardNumber).padStart(2, "0")}</span><Link href={`/notes/${note.id}`} aria-label={`View ${note.title}`} className="note-card-link motion-surface motion-press grid h-9 w-9 place-items-center rounded-full border border-[#151c4a]/25 text-[#151c4a] group-hover:bg-[#151c4a] group-hover:text-[#fffaf0]"><ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-7 flex items-center justify-between gap-3"><span className="file-badge"><FileText className="h-3.5 w-3.5" strokeWidth={1.8} />{formatFileType(note.fileType)}</span><p className="truncate text-[0.63rem] font-bold uppercase tracking-[0.14em] text-[#151c4a]/56">{note.course}</p></div><h2 className="archive-card-title mt-5"><Link href={`/notes/${note.id}`} className="focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e89f79]">{note.title}</Link></h2><p className="mt-4 line-clamp-2 text-sm leading-5 text-[#151c4a]/72">{formatTags(tags)}</p></div><div className="mt-7 border-t border-[#151c4a]/18 pt-4 text-xs text-[#151c4a]/72"><p className="truncate font-semibold">Shared by {note.uploaderName}</p><div className="mt-2 flex items-center justify-between gap-3"><span>{formatDate(note.createdAt)}</span><span className="flex items-center gap-1.5 font-bold"><Download className="note-download-icon h-3.5 w-3.5" />{note.downloadCount}</span></div></div></article>;
});

export default NoteCard;
