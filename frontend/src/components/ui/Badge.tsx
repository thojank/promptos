"use client";
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = "primary", className = "" }) => (
  <span className={`badge badge-${color} ${className}`}>{children}</span>
);
