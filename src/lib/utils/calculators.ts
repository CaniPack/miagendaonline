// ============================================================================
// CALCULATORS - Lógica de cálculos compartida
// ============================================================================

import type { Appointment, Customer } from "@/types";

/**
 * Calcula el ingreso total de una lista de citas
 */
export const calculateTotalIncome = (appointments: Appointment[]): number => {
  return appointments.reduce((total, appointment) => {
    // Priorizar precio interno sobre precio público
    const price = appointment.internalPrice || appointment.publicPrice || 0;
    return total + price;
  }, 0);
};

/**
 * Calcula el ingreso de un cliente específico
 */
export const calculateCustomerIncome = (appointments: Appointment[]): number => {
  return calculateTotalIncome(appointments.filter(apt => apt.status === "COMPLETED"));
};

/**
 * Obtiene la fecha de la última cita de un cliente
 */
export const getLastAppointmentDate = (appointments: Appointment[]): string | null => {
  if (!appointments || appointments.length === 0) return null;
  
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sortedAppointments[0]?.date || null;
};

/**
 * Calcula el promedio de citas por mes de un cliente
 */
export const calculateAverageAppointments = (appointments: Appointment[]): number => {
  if (!appointments || appointments.length === 0) return 0;
  
  const now = new Date();
  const firstAppointment = new Date(
    Math.min(...appointments.map(apt => new Date(apt.date).getTime()))
  );
  
  // Calcular meses transcurridos
  const monthsDiff = Math.max(
    1,
    (now.getFullYear() - firstAppointment.getFullYear()) * 12 +
    (now.getMonth() - firstAppointment.getMonth()) + 1
  );
  
  return Math.round((appointments.length / monthsDiff) * 100) / 100;
};

/**
 * Calcula estadísticas de servicios para un cliente
 */
export const calculateServiceStats = (appointments: Appointment[]) => {
  const serviceCount: Record<string, number> = {};
  const serviceDurations: Record<string, number[]> = {};
  let totalIncome = 0;
  let totalDuration = 0;

  appointments.forEach(appointment => {
    const duration = appointment.duration || 60;
    const income = appointment.internalPrice || appointment.publicPrice || 0;
    
    // Agrupar por duración como proxy para tipo de servicio
    const serviceKey = `${duration} min`;
    
    serviceCount[serviceKey] = (serviceCount[serviceKey] || 0) + 1;
    
    if (!serviceDurations[serviceKey]) {
      serviceDurations[serviceKey] = [];
    }
    serviceDurations[serviceKey].push(income);
    
    totalIncome += income;
    totalDuration += duration;
  });

  const services = Object.keys(serviceCount).map(serviceKey => ({
    name: serviceKey,
    count: serviceCount[serviceKey],
    totalIncome: serviceDurations[serviceKey].reduce((sum, income) => sum + income, 0),
    averageIncome: serviceDurations[serviceKey].reduce((sum, income) => sum + income, 0) / serviceDurations[serviceKey].length,
    percentage: Math.round((serviceCount[serviceKey] / appointments.length) * 100),
  }));

  return {
    services,
    totalIncome,
    totalDuration,
    averageDuration: Math.round(totalDuration / appointments.length),
    mostFrequentService: services.sort((a, b) => b.count - a.count)[0]?.name || "N/A",
  };
};

/**
 * Determina el estado de un cliente basado en su actividad
 */
export const getCustomerStatus = (customer: Customer) => {
  const now = new Date();
  const lastAppointment = customer.lastAppointment ? new Date(customer.lastAppointment) : null;
  
  if (!lastAppointment) {
    return {
      status: "Nuevo",
      color: "bg-blue-100 text-blue-800",
    };
  }
  
  const daysSinceLastAppointment = Math.floor(
    (now.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastAppointment <= 30) {
    return {
      status: "Activo",
      color: "bg-green-100 text-green-800",
    };
  } else if (daysSinceLastAppointment <= 90) {
    return {
      status: "Regular",
      color: "bg-yellow-100 text-yellow-800",
    };
  } else {
    return {
      status: "Inactivo",
      color: "bg-red-100 text-red-800",
    };
  }
};

/**
 * Calcula el crecimiento porcentual entre dos valores
 */
export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Calcula métricas de ingreso para un período
 */
export const calculatePeriodMetrics = (appointments: Appointment[], periodDays: number) => {
  const now = new Date();
  const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));
  
  const periodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= periodStart && aptDate <= now && apt.status === "COMPLETED";
  });
  
  const totalIncome = calculateTotalIncome(periodAppointments);
  const appointmentCount = periodAppointments.length;
  const averageIncome = appointmentCount > 0 ? totalIncome / appointmentCount : 0;
  
  return {
    totalIncome,
    appointmentCount,
    averageIncome,
    dailyAverage: totalIncome / periodDays,
  };
};

/**
 * Filtra citas por estado
 */
export const filterAppointmentsByStatus = (
  appointments: Appointment[], 
  statuses: string[]
): Appointment[] => {
  return appointments.filter(apt => statuses.includes(apt.status));
};

/**
 * Agrupa citas por fecha
 */
export const groupAppointmentsByDate = (appointments: Appointment[]): Record<string, Appointment[]> => {
  return appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.date).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {} as Record<string, Appointment[]>);
};

/**
 * Verifica si una fecha está en el rango especificado
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Calcula la próxima fecha disponible basada en citas existentes
 */
export const getNextAvailableDate = (appointments: Appointment[], fromDate: Date = new Date()): Date => {
  const sortedAppointments = [...appointments]
    .filter(apt => new Date(apt.date) >= fromDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedAppointments.length === 0) {
    return fromDate;
  }
  
  // Buscar el primer hueco disponible de al menos 1 hora
  let currentDate = fromDate;
  
  for (const appointment of sortedAppointments) {
    const aptDate = new Date(appointment.date);
    
    // Si hay más de 1 hora de diferencia, esa es una fecha disponible
    if (aptDate.getTime() - currentDate.getTime() >= 60 * 60 * 1000) {
      return currentDate;
    }
    
    // Mover a después de esta cita
    currentDate = new Date(aptDate.getTime() + (appointment.duration || 60) * 60 * 1000);
  }
  
  return currentDate;
}; 