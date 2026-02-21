import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-notion-text text-white hover:bg-black border border-notion-text",
    ghost:
      "bg-transparent text-notion-text hover:bg-notion-hover border border-notion-border",
    danger:
      "bg-transparent text-notion-danger hover:bg-notion-danger-bg border border-notion-danger",
  };

  const sizes = {
    sm: "text-[13px] px-3 py-1.5 rounded-md",
    md: "text-[14px] px-4 py-2 rounded-[6px]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
