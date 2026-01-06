import React, { ReactNode } from 'react';


interface DepartmentFormWrapperProps {
  children: ReactNode;
  departmentColor: string;
}

/**
 * Wrapper qui applique automatiquement la couleur du département
 * à tous les formulaires enfants via les variables CSS
 */
export const DepartmentFormWrapper: React.FC<DepartmentFormWrapperProps> = ({
  children,
  departmentColor
}) => {
  return (
    <div 
      style={{ 
        '--dept-color': departmentColor,
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
 * Couleurs des départements
 */
export const DEPARTMENT_COLORS = {
  DA: '#0078d4',
  DSE: '#107c10',
  DPNP: '#990000'
} as const;

export type DepartmentType = keyof typeof DEPARTMENT_COLORS;
