import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 break-words">{title}</h1>
        {subtitle && <p className="text-neutral-500 text-xs sm:text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">{actions}</div>}
    </div>
  );
}
