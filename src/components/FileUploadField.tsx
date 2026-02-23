import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

interface FileUploadFieldProps {
  value: string;
  onChange: (fileName: string, file?: File) => void;
  accept?: string;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  hint?: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  value,
  onChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg",
  placeholder,
  error,
  label = "Attach Documentary Proof",
  required = true,
  hint,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState("");

  const defaultPlaceholder =
    placeholder || `Choose file (${accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")})...`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setSizeError("File too large. Maximum allowed size is 5 MB.");
      // Reset input so user can re-select
      if (inputRef.current) inputRef.current.value = "";
      onChange("", undefined);
      return;
    }

    setSizeError("");
    onChange(file.name, file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setSizeError("File too large. Maximum allowed size is 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      onChange("", undefined);
      return;
    }

    setSizeError("");
    onChange(file.name, file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const displayError = sizeError || error;

  return (
    <div>
      {label && (
        <label className="input-label text-xs">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <label
        className="flex-1 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          className={cn(
            "input-field flex items-center gap-2 cursor-pointer",
            displayError && "border-destructive"
          )}
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span
            className={cn(
              "text-sm",
              value ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {value || defaultPlaceholder}
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
