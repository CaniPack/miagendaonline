'use client';

import React from 'react';
import BaseModal from './BaseModal';
import { AlertTriangle, Info, Trash2, CheckCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info" | "success";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  isLoading = false
}: ConfirmModalProps) {
  const getTypeConfig = () => {
    switch (type) {
      case "danger":
        return {
          title: title || "Confirmar eliminación",
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-100",
          confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          confirmText: confirmText || "Eliminar"
        };
      case "info":
        return {
          title: title || "Confirmar acción",
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          confirmText: confirmText || "Continuar"
        };
      case "success":
        return {
          title: title || "Confirmar acción",
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          iconBg: "bg-green-100",
          confirmBtn: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          confirmText: confirmText || "Aceptar"
        };
      default: // warning
        return {
          title: title || "Confirmar acción",
          icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
          iconBg: "bg-yellow-100",
          confirmBtn: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          confirmText: confirmText || "Confirmar"
        };
    }
  };

  const config = getTypeConfig();

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={config.title}
      size="sm"
      closeOnEscape={!isLoading}
      closeOnBackdrop={!isLoading}
    >
      <div className="space-y-4">
        {/* Icon and Message */}
        <div className="flex items-start space-x-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <p className="text-gray-900 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Procesando...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : config.confirmBtn
            }`}
          >
            {isLoading ? 'Procesando...' : config.confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// Hook para facilitar el uso del ConfirmModal
export function useConfirmModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<{
    message: string;
    onConfirm: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info" | "success";
  } | null>(null);

  const showConfirm = (options: {
    message: string;
    onConfirm: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "warning" | "danger" | "info" | "success";
  }) => {
    setConfig(options);
    setIsOpen(true);
  };

  const hideConfirm = () => {
    setIsOpen(false);
    setTimeout(() => setConfig(null), 300); // Delay to allow animation
  };

  const confirmModal = config ? (
    <ConfirmModal
      isOpen={isOpen}
      onClose={hideConfirm}
      message={config.message}
      onConfirm={() => {
        config.onConfirm();
        hideConfirm();
      }}
      title={config.title}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      type={config.type}
    />
  ) : null;

  return {
    showConfirm,
    hideConfirm,
    confirmModal,
    isOpen
  };
} 