'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stats, IncomeData, AsyncState } from '@/types';

interface UseStatsOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // en minutos
}

interface UseStatsReturn {
  // Estados principales
  stats: Stats | null;
  incomeData: IncomeData | null;
  loading: boolean;
  error: string | null;
  
  // Estados de carga específicos
  loadingStats: boolean;
  loadingIncome: boolean;
  
  // Datos calculados
  growthPercentage: number;
  isGrowing: boolean;
  totalRevenue: number;
  averageDailyIncome: number;
  
  // Operaciones
  fetchStats: () => Promise<void>;
  fetchIncomeData: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // Utilidades
  getStatsTrend: (current: number, previous: number) => {
    value: number;
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
  formatGrowth: (percentage: number) => string;
}

export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const {
    autoFetch = true,
    refreshInterval
  } = options;

  // Estados principales
  const [statsState, setStatsState] = useState<AsyncState<Stats>>({
    data: null,
    isLoading: autoFetch,
    error: null
  });

  const [incomeState, setIncomeState] = useState<AsyncState<IncomeData>>({
    data: null,
    isLoading: autoFetch,
    error: null
  });

  const stats = statsState.data;
  const incomeData = incomeState.data;
  const loading = statsState.isLoading || incomeState.isLoading;
  const error = statsState.error || incomeState.error || null;
  const loadingStats = statsState.isLoading;
  const loadingIncome = incomeState.isLoading;

  // Datos calculados
  const growthPercentage = incomeData?.growthPercentage || 0;
  const isGrowing = growthPercentage > 0;
  const totalRevenue = incomeData?.totalThisYear || 0;
  
  const averageDailyIncome = (() => {
    if (!incomeData?.totalThisMonth) return 0;
    const now = new Date();
    const currentDay = now.getDate();
    return incomeData.totalThisMonth / currentDay;
  })();

  // Función para fetch de estadísticas básicas
  const fetchStats = useCallback(async () => {
    setStatsState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/stats');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatsState({
        data: data || null,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setStatsState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      }));
    }
  }, []);

  // Función para fetch de datos de ingresos
  const fetchIncomeData = useCallback(async () => {
    setIncomeState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/income');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setIncomeState({
        data: data || null,
        isLoading: false,
        error: null
      });
    } catch (err) {
      setIncomeState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error desconocido'
      }));
    }
  }, []);

  // Función para fetch de todos los datos
  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchIncomeData()
    ]);
  }, [fetchStats, fetchIncomeData]);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Utilidad para calcular tendencias
  const getStatsTrend = useCallback((current: number, previous: number) => {
    if (previous === 0) {
      return {
        value: current,
        direction: current > 0 ? 'up' as const : 'stable' as const,
        percentage: current > 0 ? 100 : 0
      };
    }

    const difference = current - previous;
    const percentage = Math.abs((difference / previous) * 100);
    
    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(difference) < 0.01) {
      direction = 'stable';
    } else if (difference > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      value: difference,
      direction,
      percentage: Math.round(percentage * 100) / 100
    };
  }, []);

  // Formatear crecimiento
  const formatGrowth = useCallback((percentage: number) => {
    const absPercentage = Math.abs(percentage);
    const sign = percentage > 0 ? '+' : percentage < 0 ? '-' : '';
    return `${sign}${absPercentage.toFixed(1)}%`;
  }, []);

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchAllData();
    }
  }, [autoFetch, fetchAllData]);

  // Configurar intervalo de refresco
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval * 60 * 1000); // convertir minutos a milisegundos

    return () => clearInterval(interval);
  }, [refreshInterval, refreshData]);

  return {
    // Estados principales
    stats,
    incomeData,
    loading,
    error,
    
    // Estados de carga específicos
    loadingStats,
    loadingIncome,
    
    // Datos calculados
    growthPercentage,
    isGrowing,
    totalRevenue,
    averageDailyIncome,
    
    // Operaciones
    fetchStats,
    fetchIncomeData,
    fetchAllData,
    refreshData,
    
    // Utilidades
    getStatsTrend,
    formatGrowth,
  };
} 