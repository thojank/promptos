"use client";
import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, footer }) => (
  <div className="card bg-base-100 shadow-md">
    <div className="card-body">
      {title && <h2 className="card-title mb-2">{title}</h2>}
      {children}
      {footer && <div className="card-actions mt-4">{footer}</div>}
    </div>
  </div>
);
