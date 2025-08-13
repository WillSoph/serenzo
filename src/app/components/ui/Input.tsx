import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, className, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {label && <label className="text-sm font-medium text-slate-800">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "px-4 py-2 rounded text-sm",
            "bg-white text-slate-900 placeholder:text-slate-400",
            "border",
            error ? "border-red-500 focus:border-red-500" : "border-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
            "appearance-none",
            // melhora contraste no autofill do Android/iOS
            "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white] [&:-webkit-autofill]:[transition:background-color_9999s]",
            className,
            fullWidth && "w-full"
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
