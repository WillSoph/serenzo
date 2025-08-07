// components/ui/Select.tsx
import { cn } from "@/lib/utils";
import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
  fullWidth?: boolean;
}

export function Select({
  label,
  options,
  error,
  fullWidth,
  className,
  ...props
}: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
      {/* {label && <label className="text-sm font-medium">{label}</label>} */}
      <select
        className={cn(
          "px-4 py-2 border rounded text-sm bg-white",
          error ? "border-red-500" : "border-gray-300",
          className,
          fullWidth && "w-full"
        )}
        {...props}
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
