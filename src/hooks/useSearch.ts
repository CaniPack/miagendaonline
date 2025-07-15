'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  debounceMs?: number;
  caseSensitive?: boolean;
  exactMatch?: boolean;
  initialQuery?: string;
  defaultSortField?: keyof T;
  defaultSortOrder?: 'asc' | 'desc';
}

interface UseSearchReturn<T> {
  // Estado de búsqueda
  query: string;
  debouncedQuery: string;
  isSearching: boolean;
  
  // Resultados
  results: T[];
  totalResults: number;
  hasResults: boolean;
  
  // Ordenamiento
  sortField: keyof T | null;
  sortOrder: 'asc' | 'desc';
  
  // Funciones
  setQuery: (query: string) => void;
  clearQuery: () => void;
  setSortField: (field: keyof T) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSort: (field: keyof T) => void;
  
  // Utilidades
  highlightMatch: (text: string, query: string) => string;
  getMatchCount: (item: T) => number;
  searchInField: (item: T, field: keyof T, query: string) => boolean;
}

export function useSearch<T extends Record<string, any>>(
  options: UseSearchOptions<T>
): UseSearchReturn<T> {
  const {
    data,
    searchFields,
    debounceMs = 300,
    caseSensitive = false,
    exactMatch = false,
    initialQuery = '',
    defaultSortField,
    defaultSortOrder = 'asc'
  } = options;

  // Estados
  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [sortField, setSortFieldState] = useState<keyof T | null>(defaultSortField || null);
  const [sortOrder, setSortOrderState] = useState<'asc' | 'desc'>(defaultSortOrder);

  // Debounce de la query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceMs]);

  // Función para buscar en un campo específico
  const searchInField = useCallback((item: T, field: keyof T, searchQuery: string): boolean => {
    if (!searchQuery.trim()) return true;
    
    const fieldValue = item[field];
    if (fieldValue == null) return false;
    
    const searchText = caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();
    const searchTerm = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    
    if (exactMatch) {
      return searchText === searchTerm;
    }
    
    return searchText.includes(searchTerm);
  }, [caseSensitive, exactMatch]);

  // Función para contar coincidencias
  const getMatchCount = useCallback((item: T): number => {
    if (!debouncedQuery.trim()) return 0;
    
    return searchFields.reduce((count, field) => {
      return count + (searchInField(item, field, debouncedQuery) ? 1 : 0);
    }, 0);
  }, [debouncedQuery, searchFields, searchInField]);

  // Filtrar datos según búsqueda
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;
    
    return data.filter(item => {
      return searchFields.some(field => searchInField(item, field, debouncedQuery));
    });
  }, [data, debouncedQuery, searchFields, searchInField]);

  // Ordenar datos filtrados
  const sortedResults = useMemo(() => {
    if (!sortField) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Manejar valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;
      
      // Comparar valores
      let comparison = 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if ((aValue as any) instanceof Date && (bValue as any) instanceof Date) {
        comparison = (aValue as Date).getTime() - (bValue as Date).getTime();
      } else {
        // Fallback a comparación de strings
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortOrder]);

  // Funciones públicas
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  const setSortField = useCallback((field: keyof T) => {
    setSortFieldState(field);
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setSortOrderState(order);
  }, []);

  const toggleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      // Cambiar orden si es el mismo campo
      setSortOrderState(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Nuevo campo, usar orden por defecto
      setSortFieldState(field);
      setSortOrderState('asc');
    }
  }, [sortField]);

  // Función para resaltar coincidencias
  const highlightMatch = useCallback((text: string, searchQuery: string): string => {
    if (!searchQuery.trim()) return text;
    
    const searchTerm = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    const textToSearch = caseSensitive ? text : text.toLowerCase();
    
    if (!textToSearch.includes(searchTerm)) return text;
    
    // Crear regex para buscar coincidencias
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      caseSensitive ? 'g' : 'gi'
    );
    
    return text.replace(regex, '<mark>$1</mark>');
  }, [caseSensitive]);

  return {
    // Estado de búsqueda
    query,
    debouncedQuery,
    isSearching,
    
    // Resultados
    results: sortedResults,
    totalResults: sortedResults.length,
    hasResults: sortedResults.length > 0,
    
    // Ordenamiento
    sortField,
    sortOrder,
    
    // Funciones
    setQuery,
    clearQuery,
    setSortField,
    setSortOrder,
    toggleSort,
    
    // Utilidades
    highlightMatch,
    getMatchCount,
    searchInField,
  };
} 