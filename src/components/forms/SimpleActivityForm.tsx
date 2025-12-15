import React, { useState } from 'react';
import { AnalyseDossiersComitesService } from '../../services/AnalyseDossiersComitesService';

interface SimpleActivityFormProps {
  activityName: string;
  icon?: string;
  subtitle?: string;
  nombreLabel?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  date: string;
  dateReception: string;
  nombreDossiers: number;
  montantTotal: number;
}

/**
 * Formulaire simple pour les activités utilisant uniquement la table analyse_dossiers_comites
 * Utilisé par: Dossiers reçus, FAR
 */
const SimpleActivityForm: React.FC<SimpleActivityFormProps> = ({
  activityName,
  icon = '📋',
  subtitle = 'Saisie des informations',
  nombreLabel = 'Nombre de dossiers',
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    dateReception: new Date().toISOString().split('T')[0],
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
      await AnalyseDossiersComitesService.create({
        Title: activityName,
        Date: formData.date,
        Nombre: formData.nombreDossiers,
        Montant: formData.montantTotal,
        DateReception: formData.dateReception
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
        <h2 className="form-title">{icon} {activityName}</h2>
        <p className="form-subtitle">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ℹ️ Informations générales</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

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
              <label>{nombreLabel}</label>
              <input
                type="number"
                value={formData.nombreDossiers || ''}
                onChange={(e) => handleChange('nombreDossiers', parseInt(e.target.value) || 0)}
                placeholder="Ex: 15"
                min="0"
              />
            </div>

            <div className="field-group">
              <label>Montant total (FCFA)</label>
              <input
                type="number"
                value={formData.montantTotal || ''}
                onChange={(e) => handleChange('montantTotal', parseInt(e.target.value) || 0)}
                placeholder="Ex: 50000000"
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

export default SimpleActivityForm;
