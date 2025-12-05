import React, { useState } from 'react';
import { AnalyseEngagementsService } from '../../services/AnalyseEngagementsService';

interface FormAdminEngagementsProps {
  activityName: string;
  typeEngagement: 'amortissable' | 'decouvert' | 'autres_lignes' | 'restructure' | 'leasing' | 'islamique';
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  reseau: string;
  agence: string;
  segment: 'particulier' | 'entreprise';
  nombreDossiers: number;
  montantTotal: number;
}

/**
 * Formulaire pour Administration des engagements
 * Champs : Réseau, Agence, nombre, montant, segment (particulier/entreprise)
 */
const FormAdminEngagements: React.FC<FormAdminEngagementsProps> = ({
  activityName,
  typeEngagement,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    reseau: '',
    agence: '',
    segment: 'particulier',
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

  const getIcon = () => {
    switch (typeEngagement) {
      case 'amortissable': return '💰';
      case 'decouvert': return '📊';
      case 'autres_lignes': return '📈';
      case 'restructure': return '🔄';
      case 'leasing': return '🚗';
      case 'islamique': return '🕌';
      default: return '💼';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await AnalyseEngagementsService.create({
        Title: activityName,
        Reseau: formData.reseau,
        Agence: formData.agence,
        Nombre: formData.nombreDossiers,
        Montant: formData.montantTotal,
        Segment: formData.segment
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
        <h2 className="form-title">{getIcon()} {activityName}</h2>
        <p className="form-subtitle">Administration des engagements</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ℹ️ Informations générales</h3>
          </div>
          <div className="card-content">
            <div className="field-row">
              <div className="field-group">
                <label>Réseau *</label>
                <input
                  type="text"
                  value={formData.reseau}
                  onChange={(e) => handleChange('reseau', e.target.value)}
                  placeholder="Ex: Réseau Centre"
                  required
                />
              </div>

              <div className="field-group">
                <label>Agence *</label>
                <input
                  type="text"
                  value={formData.agence}
                  onChange={(e) => handleChange('agence', e.target.value)}
                  placeholder="Ex: Agence Yaoundé Centre"
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label>Segment *</label>
              <select
                value={formData.segment}
                onChange={(e) => handleChange('segment', e.target.value)}
                required
              >
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Nombre d'engagements</label>
                <input
                  type="number"
                  value={formData.nombreDossiers || ''}
                  onChange={(e) => handleChange('nombreDossiers', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 10"
                  min="0"
                />
              </div>

              <div className="field-group">
                <label>Montant total (FCFA)</label>
                <input
                  type="number"
                  value={formData.montantTotal || ''}
                  onChange={(e) => handleChange('montantTotal', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 100000000"
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

export default FormAdminEngagements;
