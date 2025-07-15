"use client";

import React from 'react';
import {
  CreditCardIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { IncomeData } from '@/hooks/useIncome';

interface IncomeStatsCardsProps {
  incomeData: IncomeData | null;
  formatCurrency: (amount: number) => string;
  appointmentPrice?: number;
}

export const IncomeStatsCards: React.FC<IncomeStatsCardsProps> = ({
  incomeData,
  formatCurrency,
  appointmentPrice = 50000,
}) => {
  if (!incomeData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const projectedIncome = (incomeData.pendingAppointments + incomeData.futureAppointments) * appointmentPrice;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Ingresos Este Mes */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <CreditCardIcon className="h-8 w-8 text-green-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Ingresos Este Mes
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(incomeData.totalThisMonth)}
            </p>
            <div
              className={`flex items-center mt-1 ${
                (incomeData.growth ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {(incomeData.growth ?? 0) >= 0 ? (
                <ArrowUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium ml-1">
                {isNaN(incomeData.growth) ? '0.0' : Math.abs(incomeData.growth ?? 0).toFixed(1)}% vs mes anterior
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Promedio Mensual */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <TrendingUpIcon className="h-8 w-8 text-blue-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Promedio Mensual
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(incomeData.monthlyAverage)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Basado en este año</p>
          </div>
        </div>
      </div>

      {/* Citas Completadas */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <CalendarIcon className="h-8 w-8 text-purple-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Citas Completadas
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {incomeData.completedAppointments}
            </p>
            <p className="text-sm text-gray-500 mt-1">Este mes</p>
          </div>
        </div>
      </div>

      {/* Ingresos Proyectados */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <ClockIcon className="h-8 w-8 text-orange-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Ingresos Proyectados
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(projectedIncome)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {incomeData.pendingAppointments + incomeData.futureAppointments} citas pendientes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 