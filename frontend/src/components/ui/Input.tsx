"use client";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, hint, error, className = "", ...props }) => (
  <div className="form-control w-full">
    {label && (
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
    )}
    <input className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`} {...props} />
    {hint && !error && (
      <label className="label">
        <span className="label-text-alt">{hint}</span>
      </label>
    )}
    {error && (
      <label className="label">
        <span className="label-text-alt text-error">{error}</span>
      </label>
    )}
  </div>
);
