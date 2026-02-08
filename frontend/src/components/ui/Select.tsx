import React, { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <select
        className={`select select-bordered w-full ${error ? "select-error" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
