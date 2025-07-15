'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  variant?: 'default' | 'card' | 'section';
}

export function ContentContainer({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
  centered = true,
  variant = 'default'
}: ContentContainerProps) {
  const getMaxWidthClasses = () => {
    const maxWidthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '4xl': 'max-w-4xl',
      '6xl': 'max-w-6xl',
      full: 'max-w-full'
    };
    return maxWidthMap[maxWidth];
  };

  const getPaddingClasses = () => {
    const paddingMap = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    };
    return paddingMap[padding];
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-white rounded-lg border border-gray-200 shadow-sm';
      case 'section':
        return 'bg-gray-50 rounded-lg';
      default:
        return '';
    }
  };

  const containerClasses = cn(
    getMaxWidthClasses(),
    getPaddingClasses(),
    getVariantClasses(),
    centered && 'mx-auto',
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Subcomponente para layout de páginas completas
interface PageLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarWidth?: 'sm' | 'md' | 'lg';
  sidebarPosition?: 'left' | 'right';
}

export function PageLayout({
  children,
  header,
  sidebar,
  footer,
  className,
  sidebarWidth = 'md',
  sidebarPosition = 'left'
}: PageLayoutProps) {
  const getSidebarWidthClasses = () => {
    const widthMap = {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96'
    };
    return widthMap[sidebarWidth];
  };

  const sidebarClasses = cn(
    'flex-shrink-0',
    getSidebarWidthClasses()
  );

  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header && (
        <header className="flex-shrink-0">
          {header}
        </header>
      )}
      
      <div className="flex-1 flex">
        {sidebar && sidebarPosition === 'left' && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {sidebar && sidebarPosition === 'right' && (
          <aside className={sidebarClasses}>
            {sidebar}
          </aside>
        )}
      </div>
      
      {footer && (
        <footer className="flex-shrink-0">
          {footer}
        </footer>
      )}
    </div>
  );
}

// Componente para secciones de contenido
interface ContentSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: 'default' | 'card' | 'bordered' | 'highlighted';
  spacing?: 'tight' | 'normal' | 'relaxed';
  actions?: React.ReactNode;
}

export function ContentSection({
  children,
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  variant = 'default',
  spacing = 'normal',
  actions
}: ContentSectionProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'bg-white rounded-lg border border-gray-200 shadow-sm p-6';
      case 'bordered':
        return 'border border-gray-200 rounded-lg p-6';
      case 'highlighted':
        return 'bg-blue-50 border border-blue-200 rounded-lg p-6';
      default:
        return '';
    }
  };

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'tight':
        return 'space-y-3';
      case 'relaxed':
        return 'space-y-8';
      default:
        return 'space-y-6';
    }
  };

  const renderHeader = () => {
    if (!title && !description && !actions) return null;

    return (
      <div className={cn('flex items-start justify-between', headerClassName)}>
        <div className="flex-1">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 mt-1">
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
    );
  };

  return (
    <section className={cn(getVariantClasses(), getSpacingClasses(), className)}>
      {renderHeader()}
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  );
}

// Componente para grids de contenido
interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

export function ContentGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
  responsive = true
}: ContentGridProps) {
  const getColumnClasses = () => {
    if (!responsive) {
      const columnMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6'
      };
      return columnMap[columns];
    }

    // Clases responsivas
    const responsiveColumnMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
    };
    return responsiveColumnMap[columns];
  };

  const getGapClasses = () => {
    const gapMap = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    return gapMap[gap];
  };

  return (
    <div className={cn(
      'grid',
      getColumnClasses(),
      getGapClasses(),
      className
    )}>
      {children}
    </div>
  );
}

// Componente para espaciado vertical consistente
interface StackProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Stack({
  children,
  spacing = 'md',
  className
}: StackProps) {
  const getSpacingClasses = () => {
    const spacingMap = {
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
      '2xl': 'space-y-12'
    };
    return spacingMap[spacing];
  };

  return (
    <div className={cn(getSpacingClasses(), className)}>
      {children}
    </div>
  );
} 