import React, { ReactNode } from 'react';


interface DepartmentFormWrapperProps {
  children: ReactNode;
  departmentColor?: string;
}

/**
 * Wrapper qui applique la couleur unifiée DGE
 * à tous les formulaires enfants via les variables CSS
 */
export const DepartmentFormWrapper: React.FC<DepartmentFormWrapperProps> = ({
  children,
}) => {
  return (
    <div 
      style={{ 
        '--dept-color': '#CC0000',
        padding: '24px',
        minHeight: '100vh',
        background: '#F8FAFC'
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

/**
 * Couleur unifiée DGE
 */
export const DEPARTMENT_COLORS = {
  DA: '#CC0000',
  DSE: '#CC0000',
  DPNP: '#CC0000'
} as const;

export type DepartmentType = keyof typeof DEPARTMENT_COLORS;
