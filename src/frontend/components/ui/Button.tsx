import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-spark text-ink hover:bg-spark/90",
    ghost: "bg-transparent text-paper-dim hover:text-paper border border-ink-line hover:border-paper-dim",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
