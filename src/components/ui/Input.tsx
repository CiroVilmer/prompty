import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {props.required && (
            <span className="ml-0.5 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-300"
            : "border-gray-300 focus:border-brand-500 focus:ring-brand-200",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
