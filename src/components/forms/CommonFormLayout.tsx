import React, { ReactNode } from 'react';
import './CommonForm.css';

interface CommonFormLayoutProps {
  // Header
  icon: string;
  title: string;
  badge?: string;
  departmentColor: string;
  
  // Body
  children: ReactNode;
  
  // Actions
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * Layout commun pour tous les formulaires de l'application
 * Utilise les variables CSS --dept-color pour adapter les couleurs par département
 */
export const CommonFormLayout: React.FC<CommonFormLayoutProps> = ({
  icon,
  title,
  badge,
  departmentColor,
  children,
  onCancel,
  onSubmit,
  isLoading = false,
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler'
}) => {
  return (
    <div 
      className="common-form-container"
      style={{ '--dept-color': departmentColor } as React.CSSProperties}
    >
      {/* Header */}
      <div className="common-form-header">
        <div className="common-form-header-icon">
          {icon}
        </div>
        <div className="common-form-header-content">
          <h2 className="common-form-title">{title}</h2>
          {badge && (
            <span className="common-form-badge">{badge}</span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit}>
        <div className="common-form-body">
          {children}
        </div>

        {/* Actions */}
        <div className="common-form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="common-form-btn common-form-btn-cancel"
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="common-form-btn common-form-btn-submit"
          >
            {isLoading ? (
              <>
                <span className="common-form-loading" />
                Enregistrement...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

interface FormSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

/**
 * Section de formulaire avec titre et icône
 */
export const FormSection: React.FC<FormSectionProps> = ({ icon, title, children }) => {
  return (
    <div className="common-form-section">
      <div className="common-form-section-header">
        <span className="common-form-section-icon">{icon}</span>
        <h3 className="common-form-section-title">{title}</h3>
      </div>
      {children}
    </div>
  );
};

interface FormFieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Champ de formulaire avec label et hint optionnel
 */
export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required, 
  hint, 
  children,
  fullWidth 
}) => {
  return (
    <div className={`common-form-field ${fullWidth ? 'common-form-field-full' : ''}`}>
      <label className={`common-form-label ${required ? 'common-form-label-required' : ''}`}>
        {label}
      </label>
      {children}
      {hint && <span className="common-form-hint">{hint}</span>}
    </div>
  );
};

interface FormSummaryProps {
  title?: string;
  items: Array<{
    label: string;
    value: string | number;
  }>;
}

/**
 * Résumé des données du formulaire
 */
export const FormSummary: React.FC<FormSummaryProps> = ({ 
  title = 'RÉSUMÉ DES DONNÉES', 
  items 
}) => {
  return (
    <div className="common-form-summary">
      <h4 className="common-form-summary-title">{title}</h4>
      <div className="common-form-summary-grid">
        {items.map((item, index) => (
          <div key={index} className="common-form-summary-item">
            <span className="common-form-summary-label">{item.label}:</span>
            <strong className="common-form-summary-value">{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SuccessModalProps {
  title: string;
  message: string;
  departmentColor: string;
}

/**
 * Modal de succès après soumission
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({ 
  title, 
  message, 
  departmentColor 
}) => {
  return (
    <div 
      className="common-form-success-modal"
      style={{ '--dept-color': departmentColor } as React.CSSProperties}
    >
      <div className="common-form-success-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="common-form-success-title">{title}</h3>
      <p className="common-form-success-message">{message}</p>
    </div>
  );
};

/**
 * Icônes par type d'activité
 */
export const ActivityIcons = {
  // Analyse
  dossiers: '📥',
  analyse: '🔍',
  evaluation: '📊',
  
  // Suivi
  suivi: '👁️',
  transmission: '📤',
  mep: '✅',
  
  // Anomalies
  anomalie: '⚠️',
  depassement: '🔴',
  contagion: '🔗',
  
  // Financier
  provision: '💼',
  reprise: '📈',
  versement: '💸',
  
  // Recherche
  recherche: '🌍',
  client: '👥',
  
  // Activités annexes
  visite: '🚗',
  formation: '📚',
  procedure: '📝',
  etude: '📖',
  autres: '📌',
  
  // Administration
  admin: '⚙️',
  engagement: '🤝',
  
  // Default
  default: '📋'
};
