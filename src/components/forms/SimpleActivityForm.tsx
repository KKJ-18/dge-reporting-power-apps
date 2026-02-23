import React, { useState } from 'react';
import { AnalyseDossiersComitesService } from '../../services/AnalyseDossiersComitesService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import DossiersDetailsInput, { DossierDetail } from './DossiersDetailsInput';

interface SimpleActivityFormProps {
  activityName: string;
  icon?: string;
  subtitle?: string;
  nombreLabel?: string;
  onSave: () => void;
  onCancel: () => void;
  allowDetails?: boolean; // Permettre saisie détails optionnelle
  activityType?: 'recus' | 'transmission' | 'regularisation' | 'admin_engagement';
}

interface FormData {
  date: string;
  dateReception: string;
  nombreDossiers: number;
  montantTotal: number;
  details: DossierDetail[];
}

/**
 * Formulaire simple pour les activités utilisant uniquement la table analyse_dossiers_comites
 * Utilisé par: Dossiers reçus, FAR
 */
const SimpleActivityForm: React.FC<SimpleActivityFormProps> = ({
  activityName,
  nombreLabel = 'Nombre de dossiers',
  onSave,
  onCancel,
  allowDetails = false,
  activityType = 'recus'
}) => {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    dateReception: new Date().toISOString().split('T')[0],
    nombreDossiers: 0,
    montantTotal: 0,
    details: []
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDetailsChange = (details: DossierDetail[], montantTotal: number) => {
    setFormData(prev => ({
      ...prev,
      details,
      montantTotal
    }));
  };

  const generateReference = (): string => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SIMPLE-${date}-${time}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      const reference = generateReference();

      // Sauvegarder l'enregistrement principal
      await AnalyseDossiersComitesService.create({
        Title: activityName,
        Date: formData.date,
        Nombre: formData.nombreDossiers,
        Montant: formData.montantTotal,
        DateReception: formData.dateReception,
        Reference: reference
      });

      // Si des détails sont saisis, les sauvegarder
      if (formData.details && formData.details.length > 0) {
        for (const detail of formData.details) {
          await DetailsDossiersService.create({
            Title: activityName,
            NomClient: detail.nomClient,
            Matricule: detail.matricule,
            MontantSollicite: detail.montantSollicite,
            Decision: detail.Decision || '',
            DetailDecision: detail.detailDecision || '',
            Commentaire: detail.commentaire || '',
            Reference: reference,
            Date: formData.dateReception
          });
        }
      }

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
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <h3 className="section-title">ℹ️ Informations générales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de réception <span className="required">*</span></label>
              <input
                type="date"
                value={formData.dateReception}
                onChange={(e) => handleChange('dateReception', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{nombreLabel} <span className="required">*</span></label>
              <input
                type="number"
                value={formData.nombreDossiers || ''}
                onChange={(e) => handleChange('nombreDossiers', parseInt(e.target.value) || 0)}
                placeholder="Nombre"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Montant total (FCFA) {formData.details?.length > 0 && '(calculé auto)'}</label>
              <input
                type="number"
                value={formData.montantTotal || ''}
                onChange={(e) => handleChange('montantTotal', parseFloat(e.target.value) || 0)}
                placeholder="Entrez le montant"
                min="0"
                disabled={formData.details?.length > 0}
                style={formData.details?.length > 0 ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
              />
            </div>
          </div>
        </div>

        {/* Détails des dossiers (optionnel) */}
        {allowDetails && formData.nombreDossiers > 0 && (
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 600, 
              color: '#2563eb',
              padding: '12px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              📝 Saisir les détails de chaque dossier (optionnel)
            </summary>
            <div style={{ marginTop: '12px' }}>
              <DossiersDetailsInput
                nombreDossiers={formData.nombreDossiers}
                activityType={activityType}
                initialDetails={formData.details}
                onDetailsChange={handleDetailsChange}
              />
            </div>
          </details>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
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
