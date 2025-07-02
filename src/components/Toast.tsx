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
        pointer-events-auto w-auto min-w-[300px] max-w-[400px] border rounded-lg shadow-xl transition-all duration-300 ease-in-out mx-auto backdrop-blur-sm
        ${styles.container}
        ${isVisible && !isLeaving 
          ? 'transform translate-y-0 opacity-100 scale-100' 
          : 'transform translate-y-2 opacity-0 scale-95'
        }
      `}
    >
      <div className="px-4 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-4 w-4 ${styles.icon}`} />
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${styles.title}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-0.5 text-xs leading-tight ${styles.message} line-clamp-2`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex rounded-md p-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.icon} hover:opacity-70 transition-opacity`}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 