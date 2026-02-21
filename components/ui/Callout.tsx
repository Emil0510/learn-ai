import React from "react";

interface CalloutProps {
  children: React.ReactNode;
  variant?: "default" | "error" | "success";
  icon?: React.ReactNode;
}

export default function Callout({
  children,
  variant = "default",
  icon,
}: CalloutProps) {
  const variants = {
    default: "bg-notion-card border-notion-border text-notion-text",
    error: "bg-notion-danger-bg border-notion-danger text-notion-text",
    success: "bg-notion-success-bg border-notion-success text-notion-text",
  };

  return (
    <div
      className={`flex gap-3 px-4 py-3 border rounded-[6px] text-[14px] leading-relaxed ${variants[variant]}`}
    >
      {icon && (
        <span className="mt-0.5 shrink-0 text-notion-muted">{icon}</span>
      )}
      <div>{children}</div>
    </div>
  );
}
