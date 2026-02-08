"use client";
import React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "error" | "success" | "warning";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  error: "btn-error",
  success: "btn-success",
  warning: "btn-warning",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => (
  <button
    className={`btn ${variantClass[variant]} ${sizeClass[size]} ${loading ? "btn-loading" : ""} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {children}
  </button>
);
