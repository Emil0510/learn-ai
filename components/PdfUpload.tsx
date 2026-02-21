"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

interface PdfUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export default function PdfUpload({
  onFileSelect,
  selectedFile,
  disabled,
}: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [disabled, onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
    // Reset input value so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <label
        className={`block w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150 ${
          isDragging
            ? "border-notion-text bg-notion-hover"
            : "border-notion-border hover:border-notion-text hover:bg-notion-hover"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Upload
            size={24}
            className="text-notion-muted mb-3"
            strokeWidth={1.5}
          />
          <p className="text-[15px] text-notion-text font-medium mb-1">
            Drop your PDF here or click to upload
          </p>
          <p className="text-[13px] text-notion-muted">
            Supports PDF files up to 10MB
          </p>
        </div>
      </label>

      {/* Selected file chip */}
      {selectedFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-notion-card border border-notion-border rounded-[6px] w-fit max-w-full">
          <FileText size={14} className="text-notion-muted shrink-0" strokeWidth={1.5} />
          <span className="text-[13px] text-notion-text truncate max-w-[300px]">
            {selectedFile.name}
          </span>
          <span className="text-[11px] text-notion-muted shrink-0">
            {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onFileSelect(null);
            }}
            className="ml-1 text-notion-muted hover:text-notion-danger transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-[13px] text-notion-danger">{error}</p>
      )}
    </div>
  );
}
