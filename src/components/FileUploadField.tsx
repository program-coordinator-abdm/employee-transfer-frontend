import React, { useRef, useState } from "react";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadDocument, type UploadResult } from "@/lib/fileUpload";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface FileUploadFieldProps {
  value: string;
  onChange: (fileName: string, file?: File) => void;
  /** Called after a successful upload with the returned reference */
  onUploadComplete?: (result: UploadResult) => void;
  /** Unique field identifier for logging and tracking */
  fieldName?: string;
  accept?: string;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
  /** Expose uploading state to parent */
  onUploadingChange?: (uploading: boolean) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  value,
  onChange,
  onUploadComplete,
  fieldName = "document",
  accept = ".pdf,.doc,.docx,.jpg,.jpeg",
  placeholder,
  error,
  label = "Attach Documentary Proof",
  required = false,
  hint,
  onUploadingChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const defaultPlaceholder =
    placeholder || `Choose file (${accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")})...`;

  const setUploadingState = (state: boolean) => {
    setUploading(state);
    onUploadingChange?.(state);
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setSizeError("File too large. Maximum allowed size is 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      onChange("", undefined);
      return;
    }

    setSizeError("");
    setUploadError("");
    setUploaded(false);

    // If onUploadComplete is provided, upload the file to the backend
    if (onUploadComplete) {
      setUploadingState(true);
      try {
        const result = await uploadDocument(file, fieldName);
        onChange(result.fileName || file.name, file);
        onUploadComplete(result);
        setUploaded(true);
      } catch (err: any) {
        const msg = err?.message || "Upload failed. Please try again.";
        setUploadError(msg);
        if (inputRef.current) inputRef.current.value = "";
        onChange("", undefined);
      } finally {
        setUploadingState(false);
      }
    } else {
      // Legacy behavior: just pass file name to parent
      onChange(file.name, file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const displayError = sizeError || uploadError || error;

  return (
    <div>
      {label && (
        <label className="input-label text-xs">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <label
        className={cn("flex-1", uploading ? "cursor-wait" : "cursor-pointer")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <div
          className={cn(
            "input-field flex items-center gap-2",
            uploading ? "cursor-wait opacity-70" : "cursor-pointer",
            displayError && "border-destructive",
            uploaded && !displayError && "border-green-500/50"
          )}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : uploaded && !displayError ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : displayError ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : (
            <Upload className="w-4 h-4 text-muted-foreground" />
          )}
          <span
            className={cn(
              "text-sm",
              uploading
                ? "text-muted-foreground"
                : value
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {uploading ? "Uploading..." : value || defaultPlaceholder}
          </span>
        </div>
      </label>
      <p className="text-xs text-muted-foreground mt-1">
        {hint || "Max file size: 5 MB."}
      </p>
      {displayError && (
        <p className="text-xs text-destructive mt-1">{displayError}</p>
      )}
    </div>
  );
};

export default FileUploadField;
