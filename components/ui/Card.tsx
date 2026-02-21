import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
}

export default function Card({
  children,
  className = "",
  padding = "md",
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white border border-notion-border rounded-lg ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
