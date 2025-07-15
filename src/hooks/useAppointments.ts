'use client';

import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentFormData, AppointmentStatus, AsyncState } from '@/types';

interface UseAppointmentsOptions {
  autoFetch?: boolean;
  initialFilter?: 'today' | 'week' | 'month' | 'all';
  dateRange?: {
    start: string;
    end: string;
  };
}

interface UseAppointmentsReturn {
  // Estado
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  
  // Datos filtrados
  todayAppointments: Appointment[];
  weekAppointments: Appointment[];
  monthAppointments: Appointment[];
  pendingAppointments: Appointment[];
  
  // Operaciones CRUD
  createAppointment: (data: AppointmentFormData) => Promise<Appointment>;
  updateAppointment: (id: string, data: Partial<AppointmentFormData>) => Promise<Appointment>;
  deleteAppointment: (id: string) => Promise<void>;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<Appointment>;
  
  // Utilidades
  fetchAppointments: (filter?: string) => Promise<void>;
  fetchAppointmentsByDateRange: (start: string, end: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  getAppointmentsByCustomer: (customerId: string) => Appointment[];
  getAppointmentsByStatus: (status: AppointmentStatus) => Appointment[];
  refreshData: () => Promise<void>;
}

export function useAppointments(options: UseAppointmentsOptions = {}): UseAppointmentsReturn {
  const {
    autoFetch = true,
    initialFilter = 'all',
    dateRange
  } = options;

  // Estado principal
  const [state, setState] = useState<AsyncState<Appointment[]>>({
    data: [],
    isLoading: autoFetch,
    error: null
  });

  const appointments = Array.isArray(state.data) ? state.data : [];
  const loading = state.isLoading;
  const error = state.error || null;

  // Utilidades de fecha
  const getDateFilters = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return {
      today: {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      },
      week: {
        start: startOfWeek,
        end: endOfWeek
      },
      month: {
        start: startOfMonth,
        end: endOfMonth
      }
    };
  };

  // Función para filtrar citas por rango de fechas
  const filterAppointmentsByDateRange = (appointments: Appointment[], start: Date, end: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= start && appointmentDate <= end;
    });
  };

  // Datos filtrados calculados
  const dateFilters = getDateFilters();
  
  const todayAppointments = filterAppointmentsByDateRange(
    appointments,
    dateFilters.today.start,
    dateFilters.today.end
  );

  const weekAppointments = filterAppointmentsByDateRange(
    appointments,
    dateFilters.week.start,
    dateFilters.week.end
  );

  const monthAppointments = filterAppointmentsByDateRange(
    appointments,
    dateFilters.month.start,
    dateFilters.month.end
  );

  const pendingAppointments = appointments.filter(
    appointment => appointment.status === AppointmentStatus.PENDING
  );

  // Función para fetch de citas
  const fetchAppointments = useCallback(async (filter: string = 'all') => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let url = '/api/appointments';
      
      if (filter && filter !== 'all') {
        const params = new URLSearchParams();
        
        switch (filter) {
          case 'today':
            params.append('startDate', dateFilters.today.start.toISOString());
            params.append('endDate', dateFilters.today.end.toISOString());
            break;
          case 'week':
            params.append('startDate', dateFilters.week.start.toISOString());
            params.append('endDate', dateFilters.week.end.toISOString());
            break;
          case 'month':
            params.append('startDate', dateFilters.month.start.toISOString());
            params.append('endDate', dateFilters.month.end.toISOString());
            break;
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setState({
        data: data || [],
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      }));
    }
  }, []);

  // Función para fetch por rango de fechas
  const fetchAppointmentsByDateRange = useCallback(async (start: string, end: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = new URLSearchParams({
        startDate: start,
        endDate: end
      });

      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setState({
        data: data || [],
        isLoading: false,
        error: null
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      }));
    }
  }, []);

  // Crear nueva cita
  const createAppointment = useCallback(async (data: AppointmentFormData): Promise<Appointment> => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newAppointment = await response.json();
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: [newAppointment, ...(prev.data || [])],
      }));

      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }, []);

  // Actualizar cita
  const updateAppointment = useCallback(async (
    id: string, 
    data: Partial<AppointmentFormData>
  ): Promise<Appointment> => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedAppointment = await response.json();
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: prev.data?.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ) || [],
      }));

      return updatedAppointment;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }, []);

  // Eliminar cita
  const deleteAppointment = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: prev.data?.filter(appointment => appointment.id !== id) || [],
      }));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }, []);

  // Actualizar estado de cita
  const updateStatus = useCallback(async (
    id: string, 
    status: AppointmentStatus
  ): Promise<Appointment> => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedAppointment = await response.json();
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: prev.data?.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ) || [],
      }));

      return updatedAppointment;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }, []);

  // Utilidades de búsqueda
  const getAppointmentById = useCallback((id: string): Appointment | undefined => {
    return appointments.find(appointment => appointment.id === id);
  }, [appointments]);

  const getAppointmentsByCustomer = useCallback((customerId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.customer.id === customerId);
  }, [appointments]);

  const getAppointmentsByStatus = useCallback((status: AppointmentStatus): Appointment[] => {
    return appointments.filter(appointment => appointment.status === status);
  }, [appointments]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await fetchAppointments(initialFilter);
  }, [fetchAppointments, initialFilter]);

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      if (dateRange) {
        fetchAppointmentsByDateRange(dateRange.start, dateRange.end);
      } else {
        fetchAppointments(initialFilter);
      }
    }
  }, [autoFetch, initialFilter, dateRange, fetchAppointments, fetchAppointmentsByDateRange]);

  return {
    // Estado
    appointments,
    loading,
    error,
    
    // Datos filtrados
    todayAppointments,
    weekAppointments,
    monthAppointments,
    pendingAppointments,
    
    // Operaciones CRUD
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateStatus,
    
    // Utilidades
    fetchAppointments,
    fetchAppointmentsByDateRange,
    getAppointmentById,
    getAppointmentsByCustomer,
    getAppointmentsByStatus,
    refreshData,
  };
} 