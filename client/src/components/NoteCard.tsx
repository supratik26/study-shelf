import { formatDate, formatFileType, formatTags } from "@/lib/noteFormat";
import type { NoteFileType } from "@shared/notes";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import { Link } from "wouter";

export type LibraryNote = {
  id: string | number;
  title: string;
  course: string;
  term: string | null;
  tags: string[];
  fileType: NoteFileType;
  downloadCount: number;
  createdAt: Date;
  uploaderName: string;
};

export default function NoteCard({ note }: { note: LibraryNote }) {
  return (
    <article className="note-card group flex min-h-72 flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="file-badge">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.8} />
            {formatFileType(note.fileType)}
          </span>
          <Link
            href={`/notes/${note.id}`}
            aria-label={`View ${note.title}`}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#171b4f]/14 text-[#171b4f] transition-all duration-200 group-hover:bg-[#171b4f] group-hover:text-[#f7f1e3]"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.19em] text-[#171b4f]/55">{note.course}{note.term ? ` · ${note.term}` : ""}</p>
        <h2 className="mt-3 text-2xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#171b4f]">
          <Link href={`/notes/${note.id}`} className="focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d28b17]">
            {note.title}
          </Link>
        </h2>
        <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#171b4f]/66">{formatTags(note.tags)}</p>
      </div>
      <div className="mt-8 border-t border-[#171b4f]/12 pt-4 text-xs text-[#171b4f]/62">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate">Shared by {note.uploaderName}</span>
          <span>{formatDate(note.createdAt)}</span>
        </div>
        <div className="mt-4 flex items-center gap-2 font-medium text-[#171b4f]">
          <Download className="h-3.5 w-3.5 text-[#d28b17]" />
          {note.downloadCount} {note.downloadCount === 1 ? "download" : "downloads"}
        </div>
      </div>
    </article>
  );
}
