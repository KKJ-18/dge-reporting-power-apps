import React, { useState } from 'react';
import { AnalyseSuiviTransmissionService } from '../../services/AnalyseSuiviTransmissionService';
import './FormSuiviTransmission.css';

interface FormSCRGProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  dateReception: string;
  dateCC3: string;
  dateTransmission: string;
  nombreDossiers: number;
  montantTotal: number;
}

/**
 * Formulaire spécifique pour SCRG CONSEIL
 * Utilise la table analyse_suivi_transmission avec dates spécifiques
 */
const FormSCRG: React.FC<FormSCRGProps> = ({
  activityName,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    dateReception: new Date().toISOString().split('T')[0],
    dateCC3: '',
    dateTransmission: '',
    nombreDossiers: 0,
    montantTotal: 0
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await AnalyseSuiviTransmissionService.create({
        Title: activityName,
        Nombre: formData.nombreDossiers,
        Montant: formData.montantTotal,
        DateReception: formData.dateReception,
        DateTransmission: formData.dateTransmission,
        DateComite: formData.dateCC3
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">📊 {activityName}</h2>
        <p className="form-subtitle">Suivi de transmission au CC3</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ℹ️ Informations générales</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Date de réception *</label>
              <input
                type="date"
                value={formData.dateReception}
                onChange={(e) => handleChange('dateReception', e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label>Date CC3</label>
              <input
                type="date"
                value={formData.dateCC3}
                onChange={(e) => handleChange('dateCC3', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Date de transmission</label>
              <input
                type="date"
                value={formData.dateTransmission}
                onChange={(e) => handleChange('dateTransmission', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.nombreDossiers || ''}
                onChange={(e) => handleChange('nombreDossiers', parseInt(e.target.value) || 0)}
                placeholder="Ex: 5"
                min="0"
              />
            </div>

            <div className="field-group">
              <label>Montant total (FCFA)</label>
              <input
                type="number"
                value={formData.montantTotal || ''}
                onChange={(e) => handleChange('montantTotal', parseInt(e.target.value) || 0)}
                placeholder="Ex: 30000000"
                min="0"
              />
              <small className="field-hint">
                {formData.montantTotal > 0 && 
                  `Montant: ${formData.montantTotal.toLocaleString('fr-FR')} FCFA`
                }
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Envoi...' : '✓ Soumettre'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3>Succès !</h3>
            <p>Les données ont été enregistrées</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSCRG;
