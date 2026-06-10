"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function ToolButton({ children, className = "", icon, variant = "secondary", ...props }: ToolButtonProps) {
  const variants = {
    primary: "bg-coral text-white shadow-button hover:-translate-y-0.5",
    secondary: "bg-white text-ink ring-1 ring-black/10 hover:-translate-y-0.5 hover:ring-black/20",
    ghost: "bg-transparent text-ink hover:bg-white/70",
    danger: "bg-ink text-white hover:-translate-y-0.5"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] bg-white/78 p-4 shadow-panel ring-1 ring-black/8 backdrop-blur md:p-5 ${className}`}>{children}</section>;
}
