import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  withSafeTop?: boolean;
  withSafeBottom?: boolean;
}

/**
 * AppLayout - A robust layout wrapper for mobile-first applications.
 * Handles safe areas (notches, dynamic islands) and consistent spacing.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  header, 
  className = "",
  containerClassName = "",
  withSafeTop = true,
  withSafeBottom = true
}) => {
  return (
    <div className={`min-h-dvh w-full flex flex-col bg-[#050B14] ${className}`}>
      {/* Fixed/Sticky Header with Safe Area support */}
      {header && (
        <header className="sticky top-0 z-50 w-full bg-[#0A1120]/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg">
          {/* Safe Area Top Padding */}
          {withSafeTop && <div className="h-[var(--safe-area-inset-top)] w-full" />}
          
          {/* Header Content - Consistent height and padding */}
          <div className="h-16 sm:h-20 px-4 md:px-8 flex items-center justify-between">
            {header}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col w-full ${containerClassName}`}>
        {/* If no header, we still need safe area top padding */}
        {!header && withSafeTop && (
          <div className="h-[calc(var(--safe-area-inset-top)+16px)] w-full shrink-0" />
        )}
        
        {children}

        {/* Safe Area Bottom Padding */}
        {withSafeBottom && (
          <div className="h-[calc(var(--safe-area-inset-bottom)+16px)] w-full shrink-0" />
        )}
      </main>
    </div>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
}

/**
 * PageContainer - Centers content and provides consistent horizontal padding.
 */
export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className = "",
  maxWidth = "3xl"
}) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full'
  }[maxWidth];

  return (
    <div className={`w-full px-4 md:px-8 py-4 mx-auto ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
};
