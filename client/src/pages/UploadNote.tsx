import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { publishExternalNote, useExternalUploadAccess } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { MAX_NOTE_FILE_BYTES, MAX_NOTE_FILE_LABEL, MIME_TYPES_BY_FILE_TYPE, NOTE_FILE_TYPES, type NoteFileType } from "@shared/notes";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, FolderUp, Loader2, UploadCloud, Zap } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const acceptedExtensions = new Set<string>(NOTE_FILE_TYPES);

function fileTypeFromName(name: string): NoteFileType | null {
  const extension = name.trim().toLowerCase().split(".").pop();
  return extension && acceptedExtensions.has(extension) ? extension as NoteFileType : null;
}

function fileMimeType(file: File, fileType: NoteFileType) {
  if (file.type && MIME_TYPES_BY_FILE_TYPE[fileType].includes(file.type)) return file.type;
  return MIME_TYPES_BY_FILE_TYPE[fileType][0];
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The file could not be read."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.readAsDataURL(file);
  });
}

export default function UploadNote() {
  const { isAuthenticated, loading } = useAuth();
  const externalUploadAccess = useExternalUploadAccess(isAuthenticated);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [term, setTerm] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const utils = trpc.useUtils();
  const createNote = trpc.notes.create.useMutation({
    onSuccess: async note => {
      await Promise.all([utils.notes.search.invalidate(), utils.notes.myUploads.invalidate()]);
      toast.success("Your note is now on the shelf.");
      setLocation(`/notes/${note.id}`);
    },
  });
  const createExternalNote = useMutation({
    mutationFn: publishExternalNote,
    onSuccess: note => {
      toast.success("Your note is now on the shelf.");
      setLocation(`/notes/${note.id}`);
    },
  });

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile) return;
    const fileType = fileTypeFromName(nextFile.name);
    if (!fileType) {
      setFile(null);
      setFileError("Choose a PDF, DOCX, PPTX, TXT, or Markdown file.");
      return;
    }
    if (!nextFile.size) {
      setFile(null);
      setFileError("The selected file is empty. Choose a file with content.");
      return;
    }
    if (nextFile.size > MAX_NOTE_FILE_BYTES) {
      setFile(null);
      setFileError(`Files must be ${MAX_NOTE_FILE_LABEL} or smaller.`);
      return;
    }
    setFileError("");
    setFile(nextFile);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setFileError("Add a note file before publishing.");
      return;
    }
    const fileType = fileTypeFromName(file.name);
    if (!fileType) return;
    try {
      if (isExternalDeployment) {
        await createExternalNote.mutateAsync({
          title, course, term, description, tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
          file, fileType, mimeType: fileMimeType(file, fileType),
        });
        return;
      }
      const fileData = await fileToBase64(file);
      await createNote.mutateAsync({
        title,
        course,
        term,
        description,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        fileName: file.name,
        mimeType: fileMimeType(file, fileType),
        fileData,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The note could not be uploaded. Please try again.");
    }
  };

  if (loading) return <AuthLoading label="Opening the submission desk" />;
  if (!isAuthenticated) return <SignInGate title="Contribute something worth returning to." description="Sign in to add a carefully made set of notes to your shared study library." />;
  if (isExternalDeployment && externalUploadAccess.isLoading) return <AuthLoading label="Checking publisher access" />;
  if (isExternalDeployment && externalUploadAccess.data !== true) {
    return (
      <main className="archive-upload-page container py-12 sm:py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#171b4f]/68 transition-colors hover:text-[#171b4f]"><ArrowLeft className="h-4 w-4" />Back to library</Link>
        <section className="mt-8 max-w-3xl rounded-[1.65rem] border border-[#171b4f]/16 bg-[#ece4d5]/62 p-7 shadow-[10px_10px_0_rgba(23,27,79,0.1)] sm:p-10">
          <p className="eyebrow">Read-only member access</p>
          <h1 className="editorial-title mt-5 text-5xl leading-[0.98] text-[#171b4f] sm:text-6xl">The shelf is curated by its owner.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#171b4f]/70">You can search and download every shared note. Publishing is reserved for the library owner so the collection stays consistent.</p>
          <Link href="/" className="editorial-button editorial-button--indigo mt-8"><FileText className="h-4 w-4" />Browse the library</Link>
        </section>
      </main>
    );
  }

  return <main className="archive-upload-page container py-8 pb-20 sm:py-12 sm:pb-24">
    <Link href="/" className="editorial-text-button"><ArrowLeft className="h-4 w-4" />Back to library</Link>
    <section className="archive-upload-frame motion-reveal mx-auto mt-7 max-w-5xl p-5 sm:p-8 lg:p-10">
      <div className="text-center"><p className="eyebrow">Contribution desk</p><h1 className="archive-upload-heading mt-4">Share your knowledge</h1><p className="mx-auto mt-5 max-w-xl leading-7 text-[#151c4a]/72">Give your study materials a place to live, and make the next person’s search a little easier.</p></div>
      <form onSubmit={event => void submit(event)} className="mt-9">
        <button type="button" className={`upload-zone ${isDragging ? "upload-zone--dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragEnter={event => { event.preventDefault(); setIsDragging(true); }} onDragOver={event => event.preventDefault()} onDragLeave={() => setIsDragging(false)} onDrop={event => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }}>
          <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.docx,.pptx,.txt,.md,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={event => selectFile(event.target.files?.[0])} />
          {file ? <CheckCircle2 className="h-9 w-9 text-[#337b65]" /> : <UploadCloud className="h-9 w-9 text-[#d8755c]" strokeWidth={1.6} />}
          <span className="mt-4 text-xl font-bold tracking-[-0.025em] text-[#151c4a]">{file ? file.name : "Drag & drop file here"}</span>
          <span className="mt-1 text-sm text-[#151c4a]/62">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to choose another file` : `Or browse your computer · PDF, DOCX, PPTX, TXT, Markdown · ${MAX_NOTE_FILE_LABEL} max`}</span>
        </button>
        {fileError && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#b24842]"><AlertCircle className="h-4 w-4" />{fileError}</p>}
        <div className="mt-7 grid gap-4">
          <Field label="Title" required><input value={title} onChange={event => setTitle(event.target.value)} className="editorial-input" required minLength={2} maxLength={180} placeholder="e.g., Modern history revision guide" /></Field>
          <Field label="Subject" required><input value={course} onChange={event => setCourse(event.target.value)} className="editorial-input" required minLength={2} maxLength={180} placeholder="e.g., History of Ideas" /></Field>
          <div className="grid gap-4 md:grid-cols-2"><Field label="Term"><input value={term} onChange={event => setTerm(event.target.value)} className="editorial-input" maxLength={100} placeholder="e.g., Spring 2026" /></Field><Field label="Tags"><input value={tags} onChange={event => setTags(event.target.value)} className="editorial-input" placeholder="lecture, revision, essay" /></Field></div>
          <Field label="Context"><textarea value={description} onChange={event => setDescription(event.target.value)} className="editorial-input min-h-28 resize-y py-3" maxLength={3000} placeholder="What is included, which topics it covers, or how someone might use it." /></Field>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="archive-form-note flex max-w-md items-center gap-2"><FolderUp className="h-4 w-4 shrink-0 text-[#337b65]" />Your note will be visible to signed-in members after publishing.</p><button className="editorial-button editorial-button--amber min-w-55" disabled={isExternalDeployment ? createExternalNote.isPending : createNote.isPending}>{(isExternalDeployment ? createExternalNote.isPending : createNote.isPending) ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing…</> : <><Zap className="h-4 w-4" />Publish to shelf</>}</button></div>
      </form>
    </section>
  </main>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="archive-field-row"><span className="archive-field-label">{label}{required ? <span className="ml-1 text-[#b24842]">*</span> : null}</span><span className="archive-field-input">{children}</span></label>;
}
