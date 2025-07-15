"use client";

import { useState, useEffect, useCallback } from 'react';

export interface IncomeData {
  totalThisMonth: number;
  totalLastMonth: number;
  totalThisYear: number;
  completedAppointments: number;
  pendingAppointments: number;
  futureAppointments: number;
  monthlyAverage: number;
  growth: number;
}

export interface AppointmentIncome {
  id: string;
  date: string;
  duration: number;
  status: string;
  notes?: string;
  income: number;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface ClientMetrics {
  id: string;
  name: string;
  totalIncome: number;
  appointmentCount: number;
  averagePerAppointment: number;
  lastAppointment: string;
  averageAppointmentsPerMonth: number;
  growthTrend: "up" | "down" | "stable";
}

const APPOINTMENT_PRICE = 50; // Precio por defecto si no hay precio interno

export function useIncome() {
  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [appointmentIncomes, setAppointmentIncomes] = useState<AppointmentIncome[]>([]);
  const [clientMetrics, setClientMetrics] = useState<ClientMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos de ingresos desde la nueva API
  const fetchIncomeData = useCallback(async () => {
    try {
      console.log('Fetching income data...');
      const response = await fetch('/api/income');
      if (!response.ok) {
        throw new Error(`Failed to fetch income data: ${response.status}`);
      }
      const data = await response.json();
      console.log('Income data received:', data);
      setIncomeData(data);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  // Función para obtener citas con datos de ingresos
  const fetchAppointments = useCallback(async () => {
    try {
      console.log('Fetching appointments...');
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Appointments response:', responseData);
      
      // Extraer el array de appointments del objeto respuesta
      const data = responseData.appointments || [];
      
      const appointmentsWithIncome = data.map((apt: any) => ({
        ...apt,
        income: apt.internalPrice || APPOINTMENT_PRICE,
      }));
      
      console.log('Processed appointments:', appointmentsWithIncome);
      setAppointmentIncomes(appointmentsWithIncome);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  // Función para calcular métricas de clientes
  const fetchClientMetrics = useCallback(async () => {
    try {
      console.log('Fetching client metrics...');
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Customers response:', responseData);
      
      // Extraer el array de customers del objeto respuesta
      const customers = responseData.customers || [];
      
      const metrics = customers.map((customer: any) => {
        const completedAppointments = customer.appointments?.filter(
          (apt: any) => apt.status === 'completed'
        ) || [];
        
        const totalIncome = completedAppointments.reduce(
          (sum: number, apt: any) => sum + (apt.internalPrice || APPOINTMENT_PRICE),
          0
        );
        
        const appointmentCount = completedAppointments.length;
        const averagePerAppointment = appointmentCount > 0 ? totalIncome / appointmentCount : 0;
        
        // Calcular última cita
        const lastAppointment = customer.appointments?.[0]?.date || new Date().toISOString();
        
        // Calcular promedio de citas por mes (simplificado)
        const averageAppointmentsPerMonth = appointmentCount / Math.max(1, 6); // Últimos 6 meses
        
        // Determinar tendencia (simplificado)
        const recentAppointments = customer.appointments?.slice(0, 2) || [];
        const growthTrend = recentAppointments.length >= 2 ? 'up' : 
                           recentAppointments.length === 1 ? 'stable' : 'down';
        
        return {
          id: customer.id,
          name: customer.name,
          totalIncome,
          appointmentCount,
          averagePerAppointment,
          lastAppointment,
          averageAppointmentsPerMonth,
          growthTrend: growthTrend as "up" | "down" | "stable",
        };
      });
      
      console.log('Processed client metrics:', metrics);
      setClientMetrics(metrics);
    } catch (err) {
      console.error('Error fetching client metrics:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  }, []);

  // Función para calcular resumen de ingresos (como respaldo si la API /api/income falla)
  const calculateIncomeFromAppointments = useCallback((appointments: AppointmentIncome[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const thisMonthAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return date >= startOfMonth && apt.status === 'completed';
    });

    const lastMonthAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return date >= startOfLastMonth && date <= endOfLastMonth && apt.status === 'completed';
    });

    const yearAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return date >= startOfYear && apt.status === 'completed';
    });

    const totalThisMonth = thisMonthAppointments.reduce((sum, apt) => sum + apt.income, 0);
    const totalLastMonth = lastMonthAppointments.reduce((sum, apt) => sum + apt.income, 0);
    const totalThisYear = yearAppointments.reduce((sum, apt) => sum + apt.income, 0);

    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending').length;
    const futureAppointments = appointments.filter(apt => {
      const date = new Date(apt.date);
      return date > now;
    }).length;

    const monthlyAverage = now.getMonth() > 0 ? totalThisYear / (now.getMonth() + 1) : totalThisMonth;
    const growth = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

    return {
      totalThisMonth,
      totalLastMonth,
      totalThisYear,
      completedAppointments,
      pendingAppointments,
      futureAppointments,
      monthlyAverage,
      growth,
    };
  }, []);

  // Función principal para cargar todos los datos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting data load...');
      
      // Cargar datos de la API de ingresos (prioritaria)
      await fetchIncomeData();
      
      // Cargar citas y métricas de clientes en paralelo
      await Promise.all([
        fetchAppointments(),
        fetchClientMetrics(),
      ]);
      
      console.log('Data load completed successfully');
    } catch (err) {
      console.error('Error loading income data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [fetchIncomeData, fetchAppointments, fetchClientMetrics]);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Si no hay datos de la API de ingresos, calcular desde citas como respaldo
  useEffect(() => {
    if (!incomeData && appointmentIncomes.length > 0 && !loading) {
      console.log('Calculating income from appointments as fallback...');
      const calculatedIncome = calculateIncomeFromAppointments(appointmentIncomes);
      setIncomeData(calculatedIncome);
    }
  }, [incomeData, appointmentIncomes, loading, calculateIncomeFromAppointments]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    incomeData,
    appointmentIncomes,
    clientMetrics,
    loading,
    error,
    refresh,
  };
} 