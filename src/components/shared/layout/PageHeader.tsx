'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  actions?: React.ReactNode;
  backButton?: {
    href?: string;
    onClick?: () => void;
    label?: string;
  };
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  variant?: 'default' | 'compact' | 'centered';
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  backButton,
  className,
  titleClassName,
  descriptionClassName,
  variant = 'default',
  icon
}: PageHeaderProps) {
  const renderBackButton = () => {
    if (!backButton) return null;

    const handleClick = () => {
      if (backButton.onClick) {
        backButton.onClick();
      } else if (backButton.href) {
        window.location.href = backButton.href;
      } else {
        window.history.back();
      }
    };

    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {backButton.label || 'Volver'}
      </button>
    );
  };

  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {breadcrumb.href && !breadcrumb.current ? (
                <a
                  href={breadcrumb.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {breadcrumb.label}
                </a>
              ) : (
                <span
                  className={cn(
                    breadcrumb.current
                      ? "text-gray-900 font-medium"
                      : "text-gray-600"
                  )}
                >
                  {breadcrumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'py-4',
          header: 'flex items-center justify-between',
          titleSection: 'flex items-center gap-3',
          title: 'text-lg font-semibold text-gray-900',
          description: 'text-sm text-gray-600 mt-1'
        };
      case 'centered':
        return {
          container: 'py-8 text-center',
          header: 'space-y-4',
          titleSection: 'flex items-center justify-center gap-3',
          title: 'text-3xl font-bold text-gray-900',
          description: 'text-lg text-gray-600 mt-2 max-w-2xl mx-auto'
        };
      default:
        return {
          container: 'py-6',
          header: 'flex items-start justify-between',
          titleSection: 'flex items-start gap-3 flex-1',
          title: 'text-2xl font-bold text-gray-900',
          description: 'text-base text-gray-600 mt-2'
        };
    }
  };

  const variantClasses = getVariantClasses();

  return (
    <div className={cn(variantClasses.container, className)}>
      {renderBackButton()}
      {renderBreadcrumbs()}
      
      <div className={variantClasses.header}>
        <div className={variantClasses.titleSection}>
          {icon && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className={cn(variantClasses.title, titleClassName)}>
              {title}
            </h1>
            {description && (
              <p className={cn(variantClasses.description, descriptionClassName)}>
                {description}
              </p>
            )}
          </div>
        </div>
        
        {actions && variant !== 'centered' && (
          <div className="flex-shrink-0 ml-4">
            {actions}
          </div>
        )}
      </div>

      {actions && variant === 'centered' && (
        <div className="mt-6 flex justify-center">
          {actions}
        </div>
      )}
    </div>
  );
}

// Subcomponente para grupos de acciones
interface ActionGroupProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function ActionGroup({ 
  children, 
  className,
  align = 'right'
}: ActionGroupProps) {
  const alignClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center'
  };

  return (
    <div className={cn(
      'flex items-center gap-3',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
}

// Componente para botones de acción primarios
interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function ActionButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className
}: ActionButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500';
      case 'ghost':
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-blue-500';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = cn(
    'inline-flex items-center gap-2 font-medium rounded-md transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    getVariantClasses(),
    getSizeClasses(),
    className
  );

  const content = (
    <>
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {content}
    </button>
  );
} 