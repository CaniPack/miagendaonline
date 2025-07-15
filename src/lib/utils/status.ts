// ============================================================================
// STATUS UTILITIES - Configuración de estados compartida
// ============================================================================

import type { StatusConfig } from "@/types";

/**
 * Configuración de colores para estados de citas
 */
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800", 
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Textos legibles para estados de citas
 */
export const getStatusText = (status: string): string => {
  const statusTexts: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    CANCELLED: "Cancelada", 
    COMPLETED: "Completada",
  };
  
  return statusTexts[status] || status;
};

/**
 * Configuración completa de estados
 */
export const getStatusConfig = (status: string): StatusConfig => {
  return {
    status: getStatusText(status),
    color: getStatusColor(status),
    text: getStatusText(status),
  };
};

/**
 * Todos los estados disponibles para filtros
 */
export const APPOINTMENT_STATUSES = [
  { value: "PENDING", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONFIRMED", label: "Confirmada", color: "bg-blue-100 text-blue-800" },
  { value: "CANCELLED", label: "Cancelada", color: "bg-red-100 text-red-800" },
  { value: "COMPLETED", label: "Completada", color: "bg-green-100 text-green-800" },
];

/**
 * Estados de prioridad (para ordenamiento)
 */
export const STATUS_PRIORITY: Record<string, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

/**
 * Determina si un estado permite edición
 */
export const isStatusEditable = (status: string): boolean => {
  return status === "PENDING" || status === "CONFIRMED";
};

/**
 * Determina si un estado permite cancelación
 */
export const isStatusCancellable = (status: string): boolean => {
  return status === "PENDING" || status === "CONFIRMED";
};

/**
 * Estados que generan ingresos (para cálculos)
 */
export const REVENUE_GENERATING_STATUSES = ["COMPLETED"];

/**
 * Estados activos (no cancelados ni completados)
 */
export const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"];

/**
 * Obtiene el siguiente estado lógico
 */
export const getNextStatus = (currentStatus: string): string => {
  const statusFlow: Record<string, string> = {
    PENDING: "CONFIRMED",
    CONFIRMED: "COMPLETED",
    COMPLETED: "COMPLETED", // No cambia
    CANCELLED: "CANCELLED", // No cambia
  };
  
  return statusFlow[currentStatus] || currentStatus;
};

/**
 * Verifica si una transición de estado es válida
 */
export const isValidStatusTransition = (from: string, to: string): boolean => {
  const validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [], // Estado final
    CANCELLED: [], // Estado final
  };
  
  return validTransitions[from]?.includes(to) || false;
};

/**
 * Colores para tendencias y métricas
 */
export const getTrendColor = (direction: "up" | "down" | "stable"): string => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600", 
    stable: "text-gray-600",
  };
  
  return trendColors[direction];
};

/**
 * Configuración de colores para tarjetas de estadísticas
 */
export const getStatsCardColor = (type: string): string => {
  const cardColors: Record<string, string> = {
    appointments: "bg-blue-50 border-blue-200",
    clients: "bg-green-50 border-green-200",
    income: "bg-purple-50 border-purple-200",
    pending: "bg-yellow-50 border-yellow-200",
    growth: "bg-indigo-50 border-indigo-200",
  };
  
  return cardColors[type] || "bg-gray-50 border-gray-200";
};

/**
 * Iconos de estado para componentes
 */
export const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    PENDING: "⏳",
    CONFIRMED: "✅", 
    CANCELLED: "❌",
    COMPLETED: "🎉",
  };
  
  return statusIcons[status] || "❓";
};

/**
 * Determina el estado de un cliente basado en su historial
 */
export const getCustomerStatus = (customer: any) => {
  const appointmentCount = customer._count?.appointments || customer.appointments?.length || 0;
  const lastAppointment = customer.lastAppointment;
  
  if (appointmentCount === 0) {
    return {
      text: "Nuevo",
      color: "bg-blue-100 text-blue-800"
    };
  }
  
  if (!lastAppointment) {
    return {
      text: "Sin citas recientes",
      color: "bg-gray-100 text-gray-800"
    };
  }
  
  const daysSinceLastAppointment = Math.floor(
    (new Date().getTime() - new Date(lastAppointment).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastAppointment <= 30) {
    return {
      text: "Activo",
      color: "bg-green-100 text-green-800"
    };
  } else if (daysSinceLastAppointment <= 90) {
    return {
      text: "Regular",
      color: "bg-yellow-100 text-yellow-800"
    };
  } else {
    return {
      text: "Inactivo",
      color: "bg-red-100 text-red-800"
    };
  }
}; 