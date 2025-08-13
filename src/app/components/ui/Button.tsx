"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg" | "icon";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
};

export const Button = ({
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium " +
    "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
    "focus-visible:ring-emerald-500 focus-visible:ring-offset-2 select-none";

  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-800 hover:bg-gray-100",
    ghost: "text-gray-800 hover:bg-gray-100",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  } as const;

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  } as const;

  const width = fullWidth ? "w-full" : "";

  // estados
  const disabledStyles = isDisabled
    ? variant === "default"
      ? "bg-emerald-600/60 text-white cursor-not-allowed pointer-events-none"
      : "opacity-70 cursor-not-allowed pointer-events-none"
    : "cursor-pointer";

  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], width, disabledStyles, className)}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full" />
      )}
      {!loading && icon && iconPosition === "left" && <span className="mr-2">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === "right" && <span className="ml-2">{icon}</span>}
    </button>
  );
};
