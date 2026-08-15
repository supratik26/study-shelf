import AuthLoading from "@/components/AuthLoading";
import SignInGate from "@/components/SignInGate";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { publishExternalNote } from "@/lib/externalNotes";
import { isExternalDeployment } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { MAX_NOTE_FILE_BYTES, MAX_NOTE_FILE_LABEL, MIME_TYPES_BY_FILE_TYPE, NOTE_FILE_TYPES, NOTE_FILE_TYPE_LABELS, type NoteFileType } from "@shared/notes";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, FolderUp, Loader2, UploadCloud } from "lucide-react";
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

  return (
    <main className="container py-10 sm:py-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#171b4f]/68 transition-colors hover:text-[#171b4f]"><ArrowLeft className="h-4 w-4" />Back to library</Link>
      <div className="mt-8 grid gap-10 xl:grid-cols-[0.78fr_1.22fr]">
        <aside className="xl:pt-7">
          <p className="eyebrow">Contribute to the shelf</p>
          <h1 className="editorial-title mt-5 text-5xl leading-[0.98] text-[#171b4f] sm:text-6xl">Add a note with a long life.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#171b4f]/70">A clear title, helpful tags, and a little context make the next person’s search feel effortless.</p>
          <div className="mt-10 border-l-2 border-[#d28b17] pl-5 text-sm leading-6 text-[#171b4f]/70"><strong className="font-semibold text-[#171b4f]">Accepted formats.</strong><br />PDF, DOCX, PPTX, TXT, and Markdown up to {MAX_NOTE_FILE_LABEL}. Every file is checked again by the server before it is stored.</div>
        </aside>

        <form onSubmit={event => void submit(event)} className="rounded-[1.65rem] border border-[#171b4f]/16 bg-[#ece4d5]/62 p-5 shadow-[10px_10px_0_rgba(23,27,79,0.1)] sm:p-8">
          <button
            type="button"
            className={`upload-zone ${isDragging ? "upload-zone--dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragEnter={event => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={event => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={event => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }}
          >
            <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.docx,.pptx,.txt,.md,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={event => selectFile(event.target.files?.[0])} />
            {file ? <CheckCircle2 className="h-7 w-7 text-[#b36f0c]" /> : <UploadCloud className="h-7 w-7 text-[#171b4f]" strokeWidth={1.5} />}
            <span className="mt-4 text-lg font-semibold text-[#171b4f]">{file ? file.name : "Drop your note here"}</span>
            <span className="mt-2 text-sm text-[#171b4f]/62">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to choose a different file` : "or click to browse from your device"}</span>
          </button>
          {fileError && <p className="mt-3 flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{fileError}</p>}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Title" required><input value={title} onChange={event => setTitle(event.target.value)} className="editorial-input" required minLength={2} maxLength={180} placeholder="e.g., Modern history revision guide" /></Field>
            <Field label="Subject or course" required><input value={course} onChange={event => setCourse(event.target.value)} className="editorial-input" required minLength={2} maxLength={180} placeholder="e.g., History of Ideas" /></Field>
            <Field label="Term"><input value={term} onChange={event => setTerm(event.target.value)} className="editorial-input" maxLength={100} placeholder="e.g., Spring 2026" /></Field>
            <Field label="Tags"><input value={tags} onChange={event => setTags(event.target.value)} className="editorial-input" placeholder="lecture, revision, essay" /><span className="mt-2 block text-xs text-[#171b4f]/50">Separate tags with commas.</span></Field>
          </div>
          <Field label="A little context" className="mt-5"><textarea value={description} onChange={event => setDescription(event.target.value)} className="editorial-input min-h-28 resize-y py-3" maxLength={3000} placeholder="What is included, which topics it covers, or how someone might use it." /></Field>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#171b4f]/14 pt-6">
            <p className="flex items-center gap-2 text-sm text-[#171b4f]/60"><FolderUp className="h-4 w-4 text-[#d28b17]" />Your note will be visible to signed-in members.</p>
            <button className="editorial-button editorial-button--indigo" disabled={isExternalDeployment ? createExternalNote.isPending : createNote.isPending}>{(isExternalDeployment ? createExternalNote.isPending : createNote.isPending) ? <><Loader2 className="h-4 w-4 animate-spin" />Publishing…</> : <><FileText className="h-4 w-4" />Publish note</>}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({ label, required, className = "", children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[#171b4f]/65">{label}{required ? <span className="text-[#b36f0c]"> *</span> : null}</span>{children}</label>;
}
