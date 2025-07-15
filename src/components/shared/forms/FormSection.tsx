'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'card' | 'bordered' | 'minimal';
}

export function FormSection({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  collapsible = false,
  defaultCollapsed = false,
  icon,
  actions,
  variant = 'default'
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapsed = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return {
          container: 'bg-white rounded-lg border border-gray-200 shadow-sm',
          header: 'px-6 py-4 border-b border-gray-200',
          content: 'px-6 py-4'
        };
      case 'bordered':
        return {
          container: 'border border-gray-200 rounded-md',
          header: 'px-4 py-3 bg-gray-50 border-b border-gray-200',
          content: 'px-4 py-4'
        };
      case 'minimal':
        return {
          container: '',
          header: 'mb-4',
          content: ''
        };
      default:
        return {
          container: 'space-y-4',
          header: 'pb-3 border-b border-gray-200',
          content: 'pt-4'
        };
    }
  };

  const variantClasses = getVariantClasses();

  const renderHeader = () => {
    if (!title && !description && !actions) return null;

    return (
      <div className={cn(variantClasses.header, headerClassName)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <div className="flex items-center gap-2">
                {icon && (
                  <span className="text-gray-600">
                    {icon}
                  </span>
                )}
                <h3 
                  className={cn(
                    "text-lg font-medium text-gray-900",
                    collapsible && "cursor-pointer hover:text-gray-700",
                    titleClassName
                  )}
                  onClick={toggleCollapsed}
                >
                  {title}
                </h3>
                {collapsible && (
                  <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={isCollapsed ? "Expandir sección" : "Contraer sección"}
                  >
                    <svg 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isCollapsed ? "rotate-0" : "rotate-180"
                      )}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {description && (
              <p className={cn(
                "text-sm text-gray-600 mt-1",
                title && "mt-2",
                descriptionClassName
              )}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (collapsible && isCollapsed) return null;
    
    return (
      <div className={cn(variantClasses.content, contentClassName)}>
        {children}
      </div>
    );
  };

  return (
    <div className={cn(variantClasses.container, className)}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
}

// Subcomponente para campos en grid
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function FormGrid({ 
  children, 
  columns = 2, 
  gap = 'md',
  className 
}: FormGridProps) {
  const getGridClasses = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6'
    };

    return cn('grid', gridCols[columns], gapClasses[gap]);
  };

  return (
    <div className={cn(getGridClasses(), className)}>
      {children}
    </div>
  );
}

// Subcomponente para acciones de formulario
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
  variant?: 'default' | 'sticky';
}

export function FormActions({ 
  children, 
  className,
  align = 'right',
  variant = 'default'
}: FormActionsProps) {
  const getAlignClasses = () => {
    switch (align) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'sticky':
        return 'sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 -mx-6 -mb-6 mt-8';
      default:
        return 'pt-6 border-t border-gray-200 mt-8';
    }
  };

  return (
    <div className={cn(
      'flex flex-col sm:flex-row gap-3',
      getAlignClasses(),
      getVariantClasses(),
      className
    )}>
      {children}
    </div>
  );
} 