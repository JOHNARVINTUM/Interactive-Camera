"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ToolButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function ToolButton({ children, className = "", icon, variant = "secondary", ...props }: ToolButtonProps) {
  const variants = {
    primary: "bg-coral text-paper shadow-button hover:-translate-y-0.5 hover:bg-[#c41e3a]",
    secondary: "bg-[#07040a] text-paper/80 ring-1 ring-accent/30 hover:-translate-y-0.5 hover:text-accent hover:ring-accent/60",
    ghost: "bg-transparent text-paper/62 hover:bg-white/8 hover:text-accent",
    danger: "bg-[#1e0f15] text-coral ring-1 ring-coral/40 hover:bg-coral/15"
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-accent/20 bg-[#0d0710]/85 p-4 text-paper backdrop-blur ${className}`}>{children}</section>;
}
