'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Appointment, Customer, Stats, IncomeData } from '@/types';

// Tipos para el estado global
interface AppState {
  // Estados de datos
  appointments: Appointment[];
  customers: Customer[];
  stats: Stats | null;
  incomeData: IncomeData | null;
  
  // Estados de carga
  loading: {
    appointments: boolean;
    customers: boolean;
    stats: boolean;
    income: boolean;
  };
  
  // Estados de error
  errors: {
    appointments: string | null;
    customers: string | null;
    stats: string | null;
    income: string | null;
  };
  
  // Estados de UI
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      timestamp: number;
    }>;
  };
  
  // Cache y metadata
  lastUpdated: {
    appointments: number | null;
    customers: number | null;
    stats: number | null;
    income: number | null;
  };
}

// Tipos para las acciones
type AppAction = 
  | { type: 'SET_APPOINTMENTS'; payload: Appointment[] }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'UPDATE_APPOINTMENT'; payload: { id: string; appointment: Appointment } }
  | { type: 'DELETE_APPOINTMENT'; payload: string }
  | { type: 'SET_CUSTOMERS'; payload: Customer[] }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: { id: string; customer: Customer } }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'SET_STATS'; payload: Stats }
  | { type: 'SET_INCOME_DATA'; payload: IncomeData }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_NOTIFICATION'; payload: { type: 'success' | 'error' | 'warning' | 'info'; message: string } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LAST_UPDATED'; payload: { key: keyof AppState['lastUpdated']; value: number } };

// Estado inicial
const initialState: AppState = {
  appointments: [],
  customers: [],
  stats: null,
  incomeData: null,
  loading: {
    appointments: false,
    customers: false,
    stats: false,
    income: false,
  },
  errors: {
    appointments: null,
    customers: null,
    stats: null,
    income: null,
  },
  ui: {
    sidebarOpen: false,
    theme: 'light',
    notifications: [],
  },
  lastUpdated: {
    appointments: null,
    customers: null,
    stats: null,
    income: null,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_APPOINTMENTS':
      return {
        ...state,
        appointments: action.payload,
        lastUpdated: { ...state.lastUpdated, appointments: Date.now() }
      };
      
    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
        lastUpdated: { ...state.lastUpdated, appointments: Date.now() }
      };
      
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt => 
          apt.id === action.payload.id ? action.payload.appointment : apt
        ),
        lastUpdated: { ...state.lastUpdated, appointments: Date.now() }
      };
      
    case 'DELETE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter(apt => apt.id !== action.payload),
        lastUpdated: { ...state.lastUpdated, appointments: Date.now() }
      };
      
    case 'SET_CUSTOMERS':
      return {
        ...state,
        customers: action.payload,
        lastUpdated: { ...state.lastUpdated, customers: Date.now() }
      };
      
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [action.payload, ...state.customers],
        lastUpdated: { ...state.lastUpdated, customers: Date.now() }
      };
      
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.id === action.payload.id ? action.payload.customer : customer
        ),
        lastUpdated: { ...state.lastUpdated, customers: Date.now() }
      };
      
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload),
        lastUpdated: { ...state.lastUpdated, customers: Date.now() }
      };
      
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload,
        lastUpdated: { ...state.lastUpdated, stats: Date.now() }
      };
      
    case 'SET_INCOME_DATA':
      return {
        ...state,
        incomeData: action.payload,
        lastUpdated: { ...state.lastUpdated, income: Date.now() }
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      };
      
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };
      
    case 'SET_THEME':
      return {
        ...state,
        ui: { ...state.ui, theme: action.payload }
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [
            ...state.ui.notifications,
            {
              id: Math.random().toString(36).substr(2, 9),
              type: action.payload.type,
              message: action.payload.message,
              timestamp: Date.now()
            }
          ]
        }
      };
      
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };
      
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        ui: { ...state.ui, notifications: [] }
      };
      
    case 'SET_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: { ...state.lastUpdated, [action.payload.key]: action.payload.value }
      };
      
    default:
      return state;
  }
}

// Contexto
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Acciones específicas para appointments
  setAppointments: (appointments: Appointment[]) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  
  // Acciones específicas para customers
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  // Acciones para stats e income
  setStats: (stats: Stats) => void;
  setIncomeData: (data: IncomeData) => void;
  
  // Acciones para loading y errores
  setLoading: (key: keyof AppState['loading'], value: boolean) => void;
  setError: (key: keyof AppState['errors'], value: string | null) => void;
  
  // Acciones de UI
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Acciones de notificaciones
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Utilidades
  isDataStale: (key: keyof AppState['lastUpdated'], maxAge?: number) => boolean;
  getAppointmentById: (id: string) => Appointment | undefined;
  getCustomerById: (id: string) => Customer | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Acciones específicas para appointments
  const setAppointments = useCallback((appointments: Appointment[]) => {
    dispatch({ type: 'SET_APPOINTMENTS', payload: appointments });
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointment });
  }, []);

  const updateAppointment = useCallback((id: string, appointment: Appointment) => {
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id, appointment } });
  }, []);

  const deleteAppointment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_APPOINTMENT', payload: id });
  }, []);

  // Acciones específicas para customers
  const setCustomers = useCallback((customers: Customer[]) => {
    dispatch({ type: 'SET_CUSTOMERS', payload: customers });
  }, []);

  const addCustomer = useCallback((customer: Customer) => {
    dispatch({ type: 'ADD_CUSTOMER', payload: customer });
  }, []);

  const updateCustomer = useCallback((id: string, customer: Customer) => {
    dispatch({ type: 'UPDATE_CUSTOMER', payload: { id, customer } });
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CUSTOMER', payload: id });
  }, []);

  // Acciones para stats e income
  const setStats = useCallback((stats: Stats) => {
    dispatch({ type: 'SET_STATS', payload: stats });
  }, []);

  const setIncomeData = useCallback((data: IncomeData) => {
    dispatch({ type: 'SET_INCOME_DATA', payload: data });
  }, []);

  // Acciones para loading y errores
  const setLoading = useCallback((key: keyof AppState['loading'], value: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { key, value } });
  }, []);

  const setError = useCallback((key: keyof AppState['errors'], value: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value } });
  }, []);

  // Acciones de UI
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  // Acciones de notificaciones
  const addNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type, message } });
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Utilidades
  const isDataStale = useCallback((key: keyof AppState['lastUpdated'], maxAge: number = 5 * 60 * 1000) => {
    const lastUpdate = state.lastUpdated[key];
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate > maxAge;
  }, [state.lastUpdated]);

  const getAppointmentById = useCallback((id: string) => {
    return state.appointments.find(apt => apt.id === id);
  }, [state.appointments]);

  const getCustomerById = useCallback((id: string) => {
    return state.customers.find(customer => customer.id === id);
  }, [state.customers]);

  // Auto-limpiar notificaciones antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oldNotifications = state.ui.notifications.filter(
        notification => now - notification.timestamp > 10000 // 10 segundos
      );
      
      oldNotifications.forEach(notification => {
        removeNotification(notification.id);
      });
    }, 5000); // Revisar cada 5 segundos

    return () => clearInterval(interval);
  }, [state.ui.notifications, removeNotification]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    
    // Appointments
    setAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Customers
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Stats
    setStats,
    setIncomeData,
    
    // Loading/Errors
    setLoading,
    setError,
    
    // UI
    toggleSidebar,
    setTheme,
    
    // Notifications
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Utilities
    isDataStale,
    getAppointmentById,
    getCustomerById,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar el contexto
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Hook especializado para notificaciones
export function useNotifications() {
  const { state, addNotification, removeNotification, clearNotifications } = useAppContext();
  
  return {
    notifications: state.ui.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    addSuccess: (message: string) => addNotification('success', message),
    addError: (message: string) => addNotification('error', message),
    addWarning: (message: string) => addNotification('warning', message),
    addInfo: (message: string) => addNotification('info', message),
  };
} 