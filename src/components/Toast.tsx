'use client';

import { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  autoClose?: boolean;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    container: 'border-green-200 bg-green-50',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  error: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700'
  },
  warning: {
    container: 'border-orange-200 bg-orange-50',
    icon: 'text-orange-600',
    title: 'text-orange-800',
    message: 'text-orange-700'
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700'
  }
};

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export default function Toast({ toast, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  useEffect(() => {
    // Animar entrada
    setTimeout(() => setIsVisible(true), 50);

    // Auto cerrar
    if (toast.autoClose !== false) {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.autoClose, toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm border rounded-lg shadow-lg transition-all duration-300 ease-in-out
        ${styles.container}
        ${isVisible && !isLeaving 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
        }
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${styles.title}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 text-sm ${styles.message}`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.icon} hover:opacity-70`}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 