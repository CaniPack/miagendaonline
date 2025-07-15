"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  className,
}: BaseModalProps) {
  // Manejar tecla Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, closeOnEscape]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl", 
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={cn(
            "relative bg-white rounded-lg shadow-xl transition-all w-full",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-1 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn(
            (title || showCloseButton) ? "p-6" : "p-6"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Variante para modales de confirmación
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}) {
  const typeStyles = {
    warning: {
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "⚠️",
    },
    danger: {
      confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "🗑️",
    },
    info: {
      confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500", 
      icon: "ℹ️",
    },
  };

  const styles = typeStyles[type];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      className="max-w-md"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <span className="text-2xl">{styles.icon}</span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              styles.confirmButton
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Variante para modales de loading
export function LoadingModal({
  isOpen,
  message = "Procesando...",
}: {
  isOpen: boolean;
  message?: string;
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}} // No se puede cerrar mientras carga
      size="sm"
      showCloseButton={false}
      closeOnEscape={false}
      closeOnBackdrop={false}
    >
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </BaseModal>
  );
}

// Hook para manejar estado de modales
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => setIsOpen(true), []);
  const closeModal = React.useCallback(() => setIsOpen(false), []);
  const toggleModal = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
} 