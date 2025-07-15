'use client';

import { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerFormData, AsyncState } from '@/types';

interface UseCustomersOptions {
  autoFetch?: boolean;
  includeAppointments?: boolean;
  sortBy?: 'name' | 'createdAt' | 'appointments' | 'income';
  sortOrder?: 'asc' | 'desc';
}

interface UseCustomersReturn {
  // Estado
  customers: Customer[];
  loading: boolean;
  error: string | null;
  
  // Datos calculados
  totalCustomers: number;
  activeCustomers: Customer[];
  inactiveCustomers: Customer[];
  topCustomersByIncome: Customer[];
  recentCustomers: Customer[];
  
  // Operaciones CRUD
  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Utilidades
  fetchCustomers: () => Promise<void>;
  fetchCustomerById: (id: string) => Promise<Customer | null>;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerByName: (name: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  getCustomerStats: (customerId: string) => {
    totalAppointments: number;
    totalIncome: number;
    averageMonthly: number;
    lastAppointmentDate: string | null;
  } | null;
  refreshData: () => Promise<void>;
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const {
    autoFetch = true,
    includeAppointments = false,
    sortBy = 'name',
    sortOrder = 'asc'
  } = options;

  // Estado principal
  const [state, setState] = useState<AsyncState<Customer[]>>({
    data: [],
    isLoading: autoFetch,
    error: null
  });

  const customers = Array.isArray(state.data) ? state.data : [];
  const loading = state.isLoading;
  const error = state.error || null;

  // Función para ordenar clientes
  const sortCustomers = useCallback((customers: Customer[], sortBy: string, sortOrder: string) => {
    // Validación: asegurar que customers es un array
    if (!Array.isArray(customers)) {
      console.warn('sortCustomers: customers is not an array:', customers);
      return [];
    }
    return [...customers].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'appointments':
          aValue = a._count?.appointments || 0;
          bValue = b._count?.appointments || 0;
          break;
        case 'income':
          aValue = a.totalIncome || 0;
          bValue = b.totalIncome || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, []);

  // Datos calculados
  const sortedCustomers = sortCustomers(customers, sortBy, sortOrder);
  const totalCustomers = customers.length;

  // Clientes activos/inactivos basado en última cita
  const activeCustomers = customers.filter(customer => {
    if (!customer.lastAppointment) return false;
    const lastAppointment = new Date(customer.lastAppointment);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastAppointment > threeMonthsAgo;
  });

  const inactiveCustomers = customers.filter(customer => {
    if (!customer.lastAppointment) return true;
    const lastAppointment = new Date(customer.lastAppointment);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastAppointment <= threeMonthsAgo;
  });

  // Top clientes por ingresos
  const topCustomersByIncome = customers
    .filter(customer => (customer.totalIncome || 0) > 0)
    .sort((a, b) => (b.totalIncome || 0) - (a.totalIncome || 0))
    .slice(0, 5);

  // Clientes recientes (últimos 30 días)
  const recentCustomers = customers
    .filter(customer => {
      const createdAt = new Date(customer.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt > thirtyDaysAgo;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Función para fetch de clientes
  const fetchCustomers = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      if (includeAppointments) {
        params.append('include', 'appointments');
      }

      const url = `/api/customers${params.toString() ? `?${params.toString()}` : ''}`;
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
  }, [includeAppointments]);

  // Función para fetch de cliente específico
  const fetchCustomerById = useCallback(async (id: string): Promise<Customer | null> => {
    try {
      const params = new URLSearchParams();
      if (includeAppointments) {
        params.append('include', 'appointments');
      }

      const url = `/api/customers/${id}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }, [includeAppointments]);

  // Crear nuevo cliente
  const createCustomer = useCallback(async (data: CustomerFormData): Promise<Customer> => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newCustomer = await response.json();
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: [newCustomer, ...(prev.data || [])],
      }));

      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }, []);

  // Actualizar cliente
  const updateCustomer = useCallback(async (
    id: string, 
    data: Partial<CustomerFormData>
  ): Promise<Customer> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedCustomer = await response.json();
      
      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: prev.data?.map(customer => 
          customer.id === id ? updatedCustomer : customer
        ) || [],
      }));

      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }, []);

  // Eliminar cliente
  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Actualizar estado local
      setState(prev => ({
        ...prev,
        data: prev.data?.filter(customer => customer.id !== id) || [],
      }));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }, []);

  // Utilidades de búsqueda
  const getCustomerById = useCallback((id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id);
  }, [customers]);

  const getCustomerByName = useCallback((name: string): Customer | undefined => {
    return customers.find(customer => 
      customer.name.toLowerCase().includes(name.toLowerCase())
    );
  }, [customers]);

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) return customers;
    
    const searchTerm = query.toLowerCase().trim();
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.phone?.includes(searchTerm)
    );
  }, [customers]);

  // Estadísticas de cliente
  const getCustomerStats = useCallback((customerId: string) => {
    const customer = getCustomerById(customerId);
    if (!customer) return null;

    const totalAppointments = customer._count?.appointments || customer.appointments?.length || 0;
    const totalIncome = customer.totalIncome || 0;
    
    // Calcular promedio mensual
    const createdAt = new Date(customer.createdAt);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                     (now.getMonth() - createdAt.getMonth()) + 1;
    const averageMonthly = totalAppointments / Math.max(monthsDiff, 1);

    return {
      totalAppointments,
      totalIncome,
      averageMonthly: Math.round(averageMonthly * 100) / 100,
      lastAppointmentDate: customer.lastAppointment || null
    };
  }, [getCustomerById]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await fetchCustomers();
  }, [fetchCustomers]);

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchCustomers();
    }
  }, [autoFetch, fetchCustomers]);

  return {
    // Estado
    customers: sortedCustomers,
    loading,
    error,
    
    // Datos calculados
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    topCustomersByIncome,
    recentCustomers,
    
    // Operaciones CRUD
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Utilidades
    fetchCustomers,
    fetchCustomerById,
    getCustomerById,
    getCustomerByName,
    searchCustomers,
    getCustomerStats,
    refreshData,
  };
} 