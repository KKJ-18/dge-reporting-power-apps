import React from 'react';
import './CommonForm.css';

interface Props { 
  activityName: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviClientAppele: React.FC<Props> = ({ activityName, onClose }) => (
  <div className="form-container">
    <button className="close-button" onClick={onClose} aria-label="Fermer">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
    
    <div className="form-header">
      <div className="form-title-group">
        <h2 className="form-title">{activityName}</h2>
        <div className="form-badge">En développement</div>
      </div>
    </div>
    
    <div className="form-body">
      <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
        Formulaire en cours de développement - Suivi Client Appelé
      </p>
      
      <div className="form-actions">
        <button onClick={onClose} className="btn-primary">
          Fermer
        </button>
      </div>
    </div>
  </div>
);

export default FormSuiviClientAppele;
