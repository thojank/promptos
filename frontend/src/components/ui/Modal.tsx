"use client";
import React, { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    } else if (!open && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) {
      onClose();
    }
  };

  return (
    <dialog 
      ref={dialogRef} 
      className="modal modal-bottom sm:modal-middle"
      onClick={handleBackdropClick}
    >
      <div className="modal-box w-full max-w-md">
        {title && (
          <h3 className="font-bold text-lg mb-4">{title}</h3>
        )}
        <div className="py-4">
          {children}
        </div>
        {footer && (
          <div className="modal-action">
            {footer}
          </div>
        )}
        <button 
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >✕</button>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
