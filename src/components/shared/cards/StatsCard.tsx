"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatsCardProps } from "@/types";

interface ExtendedStatsCardProps extends StatsCardProps {
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  className,
  onClick,
  loading = false,
}: ExtendedStatsCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200", 
      icon: "text-green-600",
      iconBg: "bg-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600", 
      iconBg: "bg-purple-100",
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      iconBg: "bg-orange-100", 
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      iconBg: "bg-red-100",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      // Format large numbers with separators
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString("es-CL");
    }
    return val.toString();
  };

  const cardContent = (
    <>
      {/* Header con ícono */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-lg",
          colors.iconBg
        )}>
          {loading ? (
            <div className="w-6 h-6 animate-pulse bg-gray-300 rounded"></div>
          ) : (
            <Icon className={cn("h-6 w-6", colors.icon)} />
          )}
        </div>
        
        {trend && !loading && (
          <div className={cn(
            "flex items-center text-sm font-medium",
            trend.direction === "up" ? "text-green-600" : "text-red-600"
          )}>
            <span className="mr-1">
              {trend.direction === "up" ? "↗" : "↘"}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
        )}
      </div>
    </>
  );

  const baseClasses = cn(
    "p-6 rounded-xl border-2 transition-all duration-200",
    colors.bg,
    colors.border,
    onClick && "cursor-pointer hover:shadow-lg hover:scale-105",
    className
  );

  if (onClick) {
    return (
      <button className={baseClasses} onClick={onClick}>
        {cardContent}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
}

// Variante compacta para espacios reducidos
export function CompactStatsCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  className,
}: Omit<ExtendedStatsCardProps, "trend" | "onClick" | "loading">) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    red: "text-red-600 bg-red-50",
  };

  return (
    <div className={cn(
      "flex items-center space-x-3 p-4 rounded-lg border",
      colorClasses[color],
      className
    )}>
      <Icon className="h-5 w-5" />
      <div>
        <p className="text-xs font-medium opacity-75">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

// Variante con loading skeleton
export function LoadingStatsCard({ 
  color = "blue",
  className,
}: { 
  color?: ExtendedStatsCardProps["color"];
  className?: string;
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
  };

  return (
    <div className={cn(
      "p-6 rounded-xl border-2 animate-pulse",
      colors[color],
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
} 