import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import NoteCard, { type LibraryNote } from "@/components/NoteCard";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { NOTE_FILE_TYPES, NOTE_FILE_TYPE_LABELS, type NoteFileType } from "@shared/notes";
import { ArrowDown, ArrowUpRight, BookOpen, LibraryBig, Search, SlidersHorizontal, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

export default function Library() {
  const { isAuthenticated, loading } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [fileType, setFileType] = useState<"" | NoteFileType>("");
  const [sort, setSort] = useState<"recent" | "title" | "downloads">("recent");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 240);
    return () => window.clearTimeout(timer);
  }, [query]);

  const searchInput = useMemo(
    () => ({ query: debouncedQuery || undefined, fileType: fileType || undefined, sort, page: 1, pageSize: 12 }),
    [debouncedQuery, fileType, sort],
  );
  const notesQuery = trpc.notes.search.useQuery(searchInput, { enabled: isAuthenticated });
  const notes = (notesQuery.data?.items ?? []) as LibraryNote[];
  const hasFilters = Boolean(query || fileType || sort !== "recent");

  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return <SignInGate />;

  return (
    <main>
      <section className="container pb-12 pt-12 sm:pb-16 sm:pt-20">
        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_0.8fr]">
          <div>
            <p className="eyebrow">A considered collection</p>
            <h1 className="editorial-title mt-5 max-w-4xl text-5xl leading-[0.95] text-[#171b4f] sm:text-7xl lg:text-[5.6rem]">
              Notes worth keeping close.
            </h1>
          </div>
          <div className="border-l border-[#171b4f]/18 pl-5 text-base leading-7 text-[#171b4f]/72 sm:pl-7">
            A private shelf for your study circle — made for the pages, slides, and summaries that make a semester feel more navigable.
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-[1.55rem] border border-[#171b4f]/15 bg-[#ece4d5] p-4 shadow-[8px_8px_0_rgba(23,27,79,0.1)] sm:p-5">
          <div className="absolute bottom-0 right-0 h-28 w-28 translate-x-10 translate-y-10 rounded-full border border-[#171b4f]/12" />
          <div className="relative grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#171b4f]/55" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="h-13 w-full rounded-xl border border-[#171b4f]/15 bg-[#f7f1e3] pl-12 pr-4 text-base text-[#171b4f] outline-none transition-shadow placeholder:text-[#171b4f]/42 focus:ring-2 focus:ring-[#d28b17]"
                placeholder="Search titles, subjects, descriptions, and tags"
                aria-label="Search notes"
              />
            </label>
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171b4f]/55" />
              <select
                value={fileType}
                onChange={event => setFileType(event.target.value as "" | NoteFileType)}
                className="h-13 min-w-42 appearance-none rounded-xl border border-[#171b4f]/15 bg-[#f7f1e3] pl-10 pr-10 text-sm text-[#171b4f] outline-none focus:ring-2 focus:ring-[#d28b17]"
                aria-label="Filter by file type"
              >
                <option value="">All formats</option>
                {NOTE_FILE_TYPES.map(type => <option key={type} value={type}>{NOTE_FILE_TYPE_LABELS[type]}</option>)}
              </select>
              <ArrowDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171b4f]/55" />
            </label>
            <label className="relative">
              <select
                value={sort}
                onChange={event => setSort(event.target.value as typeof sort)}
                className="h-13 min-w-42 appearance-none rounded-xl border border-[#171b4f]/15 bg-[#f7f1e3] px-4 pr-10 text-sm text-[#171b4f] outline-none focus:ring-2 focus:ring-[#d28b17]"
                aria-label="Sort notes"
              >
                <option value="recent">Most recent</option>
                <option value="downloads">Most downloaded</option>
                <option value="title">Title A–Z</option>
              </select>
              <ArrowDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#171b4f]/55" />
            </label>
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#171b4f]/16 pb-5">
          <div>
            <p className="eyebrow">The library</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171b4f]">Browse the shelf</h2>
          </div>
          <Link href="/upload" className="editorial-text-button">
            <Upload className="h-4 w-4" />
            Add a note
          </Link>
        </div>

        {notesQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => <NoteSkeleton key={index} />)}
          </div>
        ) : notesQuery.error ? (
          <LibraryState icon={<BookOpen />} title="The shelf could not be opened." description="Please refresh the page to try searching again." action="Refresh library" onAction={() => void notesQuery.refetch()} />
        ) : notes.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {notes.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        ) : hasFilters ? (
          <LibraryState
            icon={<Search />}
            title="No notes match this search."
            description="Try a shorter phrase, another format, or reset the filters to browse everything on the shelf."
            action="Clear filters"
            onAction={() => { setQuery(""); setFileType(""); setSort("recent"); }}
          />
        ) : (
          <LibraryState
            icon={<LibraryBig />}
            title="The shelf is waiting for its first note."
            description="Start the collection by adding a useful handout, study guide, lecture deck, or set of class notes."
            action="Upload the first note"
            onAction={startLogin}
            linkTo="/upload"
          />
        )}
      </section>
    </main>
  );
}

function NoteSkeleton() {
  return <div className="min-h-72 animate-pulse rounded-[1.3rem] border border-[#171b4f]/12 bg-[#f7f1e3] p-6"><div className="h-6 w-16 rounded bg-[#171b4f]/10" /><div className="mt-10 h-3 w-28 rounded bg-[#171b4f]/10" /><div className="mt-4 h-8 w-4/5 rounded bg-[#171b4f]/10" /><div className="mt-3 h-6 w-3/5 rounded bg-[#171b4f]/8" /><div className="mt-14 h-px w-full bg-[#171b4f]/10" /></div>;
}

function LibraryState({ icon, title, description, action, onAction, linkTo }: { icon: React.ReactNode; title: string; description: string; action: string; onAction?: () => void; linkTo?: string }) {
  const content = <><span className="mb-5 inline-flex rounded-full bg-[#d28b17]/14 p-3 text-[#b36f0c]">{icon}</span><h3 className="text-3xl font-semibold tracking-[-0.045em] text-[#171b4f]">{title}</h3><p className="mx-auto mt-4 max-w-lg leading-7 text-[#171b4f]/65">{description}</p></>;
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#171b4f]/25 bg-[#ece4d5]/55 px-6 py-14 text-center">
      {content}
      {linkTo ? <Link href={linkTo} className="editorial-button editorial-button--indigo mt-8">{action}<ArrowUpRight className="h-4 w-4" /></Link> : <button className="editorial-button editorial-button--indigo mt-8" onClick={onAction}>{action}<ArrowUpRight className="h-4 w-4" /></button>}
    </div>
  );
}
