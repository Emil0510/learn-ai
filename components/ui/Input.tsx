import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[12px] text-notion-muted tracking-[0.04em] uppercase">
          {label}
        </label>
      )}
      <input
        className={`w-full text-[15px] text-notion-text placeholder-notion-muted bg-white border border-notion-border rounded-[6px] px-3 py-2 outline-none focus:border-notion-text transition-colors duration-150 ${
          error ? "border-notion-danger" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[12px] text-notion-danger">{error}</p>
      )}
    </div>
  );
}
