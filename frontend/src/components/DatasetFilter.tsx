
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

type DatasetFilterProps = {
  datasetPath: string;
  loading: boolean;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
};

const ACCEPTED_EXTENSIONS = [
  ".csv",
  ".json",
  ".jsonl",
  ".parquet",
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} octets`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DatasetFilter({
  datasetPath,
  loading,
  selectedFile,
  onFileChange,
  onSubmit,
}: DatasetFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  function selectFile(file: File | null) {
    if (!file) {
      onFileChange(null);
      setFileError("");
      return;
    }

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFileError(
        "Format non pris en charge. Utilisez CSV, JSON, JSONL ou Parquet."
      );
      onFileChange(null);
      return;
    }

    setFileError("");
    onFileChange(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (loading) return;

    selectFile(event.dataTransfer.files[0] ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loading && selectedFile) {
      onSubmit();
    }
  }

  function removeFile() {
    onFileChange(null);
    setFileError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    
<motion.form
  onSubmit={handleSubmit}
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="rounded-2xl border border-hairline bg-surface p-4 shadow-card"
>
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

    {/* Titre */}
    <div className="flex items-center gap-3 lg:w-56 lg:shrink-0">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-anchor-weak text-anchor">
        <FileSpreadsheet className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-ink">
          Importer des transactions
        </h2>
        <p className="text-xs text-ink-muted">
          CSV, JSON, JSONL, Parquet
        </p>
      </div>
    </div>

    {/* Zone de dépôt */}
    <div
     
onDragOver={(event) => {
  event.preventDefault();

  if (!loading) {
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }
}}
onDragLeave={(event) => {
  event.preventDefault();

  const nextElement = event.relatedTarget;

  if (
    !nextElement ||
    !(nextElement instanceof Node) ||
    !event.currentTarget.contains(nextElement)
  ) {
    setIsDragging(false);
  }
}}
onDrop={handleDrop}

      className={`flex min-h-[76px] min-w-0 flex-1 items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition-colors ${
       
isDragging && !loading
  ? "border-anchor bg-anchor-weak ring-2 ring-anchor/20 shadow-md"
  : "border-anchor/30 bg-anchor-weak/30 hover:border-anchor/60"

      }`}
    >
      <CloudUpload className="h-6 w-6 shrink-0 text-anchor" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-ink">
          {selectedFile
            ? selectedFile.name
            : "Glissez votre fichier ici"}
        </p>
        <p className="text-[11px] text-ink-muted">
          {selectedFile
            ? formatSize(selectedFile.size)
            : "ou sélectionnez un fichier"}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,.jsonl,.parquet"
        onChange={handleChange}
        disabled={loading}
        className="sr-only"
        aria-label="Importation et analyse de transactions"
      />

      {selectedFile ? (
        <button
          type="button"
          onClick={removeFile}
          disabled={loading}
          aria-label="Supprimer le fichier"
          className="rounded-lg p-2 text-ink-muted hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="shrink-0 rounded-lg border border-anchor/20 bg-white px-3 py-2 text-xs font-semibold text-anchor hover:bg-anchor-weak disabled:opacity-50"
        >
          Parcourir
        </button>
      )}
    </div>

    {/* Bouton d'analyse */}
    <motion.button
      type="submit"
      disabled={loading || !selectedFile}
      whileTap={!loading && selectedFile ? { scale: 0.98 } : undefined}
      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-anchor px-5 py-3 text-sm font-semibold text-white hover:bg-anchor-strong disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {loading ? "Analyse..." : "Analyser"}
    </motion.button>
  </div>

  {fileError && (
    <p role="alert" className="mt-2 text-xs text-ink">
      {fileError}
    </p>
  )}

  {datasetPath && !selectedFile && (
    <p className="mt-2 flex items-center gap-1 text-xs text-anchor">
      <CheckCircle2 className="h-4 w-4" />
      Dernier dataset analysé disponible
    </p>
  )}
</motion.form>

  );
}
