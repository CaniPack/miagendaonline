'use client';

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
  maxPageButtons?: number;
}

interface UsePaginationReturn<T> {
  // Estado de paginación
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  
  // Información de estado
  isFirstPage: boolean;
  isLastPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Navegación
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Configuración
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  
  // Utilidades para datos
  paginateData: (data: T[]) => T[];
  getPageNumbers: () => number[];
  getPageInfo: () => string;
  
  // Reset
  reset: () => void;
}

export function usePagination<T = any>(
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    pageSize: initialPageSize = 10,
    totalItems: initialTotalItems = 0,
    maxPageButtons = 5
  } = options;

  // Estados
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItemsState] = useState(initialTotalItems);

  // Cálculos derivados
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItems - 1);
  }, [startIndex, pageSize, totalItems]);

  // Estados de navegación
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalPages === 0;
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Función para validar y normalizar página
  const normalizePage = useCallback((page: number): number => {
    if (page < 1) return 1;
    if (page > totalPages && totalPages > 0) return totalPages;
    return page;
  }, [totalPages]);

  // Navegación
  const goToPage = useCallback((page: number) => {
    const normalizedPage = normalizePage(page);
    setCurrentPage(normalizedPage);
  }, [normalizePage]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    if (totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  // Configuración
  const setPageSize = useCallback((size: number) => {
    if (size > 0) {
      setPageSizeState(size);
      // Ajustar página actual si es necesario
      const newTotalPages = Math.ceil(totalItems / size);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  }, [totalItems, currentPage]);

  const setTotalItems = useCallback((total: number) => {
    if (total >= 0) {
      setTotalItemsState(total);
      // Ajustar página actual si es necesario
      const newTotalPages = Math.ceil(total / pageSize);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else if (total === 0) {
        setCurrentPage(1);
      }
    }
  }, [pageSize, currentPage]);

  // Utilidad para paginar datos
  const paginateData = useCallback((data: T[]): T[] => {
    const start = startIndex;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [startIndex, pageSize]);

  // Obtener números de página para mostrar
  const getPageNumbers = useCallback((): number[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfButtons = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfButtons);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Ajustar si no tenemos suficientes páginas al final
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages, maxPageButtons]);

  // Información de página en texto
  const getPageInfo = useCallback((): string => {
    if (totalItems === 0) {
      return 'No hay elementos';
    }

    const start = startIndex + 1;
    const end = Math.min(startIndex + pageSize, totalItems);
    
    return `Mostrando ${start}-${end} de ${totalItems}`;
  }, [startIndex, pageSize, totalItems]);

  // Reset a estado inicial
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItemsState(initialTotalItems);
  }, [initialPage, initialPageSize, initialTotalItems]);

  return {
    // Estado de paginación
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    
    // Información de estado
    isFirstPage,
    isLastPage,
    hasNextPage,
    hasPreviousPage,
    
    // Navegación
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    
    // Configuración
    setPageSize,
    setTotalItems,
    
    // Utilidades para datos
    paginateData,
    getPageNumbers,
    getPageInfo,
    
    // Reset
    reset,
  };
} 