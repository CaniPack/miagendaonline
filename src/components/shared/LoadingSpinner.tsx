"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LoadingSpinnerProps } from "@/types";

export default function LoadingSpinner({
  size = "md",
  text,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-200 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className={cn(
          "mt-3 text-gray-600 font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Variante para página completa
export function FullPageLoading({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

// Variante para contenido de sección
export function SectionLoading({ 
  text = "Cargando...", 
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Variante inline
export function InlineLoading({ 
  text,
  className 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size="sm" />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

// Variante para botones
export function ButtonLoading({ 
  size = "sm",
  className 
}: { 
  size?: "sm" | "md";
  className?: string;
}) {
  const spinnerSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border border-white/30 border-t-white",
        spinnerSizes[size],
        className
      )}
    />
  );
}

// Variante con overlay
export function OverlayLoading({ 
  text = "Cargando...", 
  show = true 
}: { 
  text?: string;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <LoadingSpinner size="md" text={text} />
      </div>
    </div>
  );
}

// Skeleton para listas
export function ListSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para grid de cards
export function GridSkeleton({ 
  count = 6,
  columns = 3,
  className 
}: { 
  count?: number;
  columns?: number;
  className?: string;
}) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-6",
      gridClasses[columns as keyof typeof gridClasses] || gridClasses[3],
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para tabla
export function TableSkeleton({ 
  rows = 5,
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 bg-gray-50 border-b border-gray-200" 
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4 p-4 border-b border-gray-200"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
} 