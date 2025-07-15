"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: "default" | "card" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

const Section = React.memo<SectionProps>(({
  children,
  className,
  title,
  description,
  variant = "default",
  padding = "md",
}) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "",
    card: "bg-white rounded-xl shadow-sm border",
    bordered: "border border-gray-200 rounded-lg",
  };

  return (
    <section
      className={cn(
        "w-full",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-gray-600 text-sm">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
});

Section.displayName = 'Section';

export default Section; 