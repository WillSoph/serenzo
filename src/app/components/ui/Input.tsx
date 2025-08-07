// components/ui/Input.tsx
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
        {label && <label className="text-sm font-medium">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "px-4 py-2 border rounded text-sm bg-white",
            error ? "border-red-500" : "border-gray-300",
            className,
            fullWidth && "w-full"
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
