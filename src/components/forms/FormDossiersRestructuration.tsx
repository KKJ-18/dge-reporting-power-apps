import React, { useState, useEffect } from 'react';
import { SuiviDossiersRestructurationService } from '../../services/SuiviDossiersRestructurationService';
import { AgenceResauService } from '../../services/AgenceResauService';
import { format } from 'date-fns';


interface FormDossiersRestructurationProps {
  activityName: string;
  specificType: 'dossiers-recus' | 'dossiers-complements' | 'dossier-analyse' | 'dossier-attente-comite' 
    | 'dossier-attente-decision' | 'dossier-accord' | 'dossier-renvoye' | 'dossier-avis-conformite' 
    | 'attente-comite-credit' | 'remboursement-echeance';
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormDossiersRestructuration: React.FC<FormDossiersRestructurationProps> = ({ 
  activityName,
  specificType,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    DateEntree: format(new Date(), 'yyyy-MM-dd'),
    VolumeGlobalEngagements: 0,
    VolumeAnomalies: 0,
    MontantSollicite: 0,
    Agence: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadAgences();
  }, []);

  const loadAgences = async () => {
    setLoadingAgences(true);
    try {
      const result = await AgenceResauService.getAll();
      const data = result?.data || result?.value || [];
      const uniqueAgences = Array.from(
        new Set(data.map((item: any) => item.Title).filter(Boolean))
      ).sort() as string[];
      setAgences(uniqueAgences);
    } catch (err) {
      console.error('Erreur chargement agences:', err);
      setAgences([]);
    } finally {
      setLoadingAgences(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        DateEntree: formData.DateEntree,
        VolumeGlobalEngagements: formData.VolumeGlobalEngagements,
        VolumeAnomalies: formData.VolumeAnomalies,
        MontantSollicite: needsMontantSollicite() ? formData.MontantSollicite : undefined,
        Agence: formData.Agence,
      };

      console.log('📤 Envoi FormDossiersRestructuration:', record);

      await SuiviDossiersRestructurationService.create(record);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const needsMontantSollicite = () => {
    return ['dossier-attente-comite', 'dossier-attente-decision', 'dossier-accord', 
            'dossier-renvoye', 'dossier-avis-conformite', 'attente-comite-credit', 
            'remboursement-echeance'].includes(specificType);
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      'dossiers-recus': 'Dossiers reçus des unités',
      'dossiers-complements': 'Dossiers envoyés pour compléments',
      'dossier-analyse': 'Dossier en cours d\'analyse',
      'dossier-attente-comite': 'Dossier en attente de comité',
      'dossier-attente-decision': 'Dossiers en attente de décision',
      'dossier-accord': 'Dossier avec accord',
      'dossier-renvoye': 'Dossier renvoyé',
      'dossier-avis-conformite': 'Dossiers en attente avis conformité',
      'attente-comite-credit': 'En attente du comité de crédit',
      'remboursement-echeance': 'Remboursement d\'échéance'
    };
    return labels[specificType] || specificType;
  };

  if (showSuccess) {
    return (
      <div className="success-message">
        <div className="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>Enregistrement réussi</h3>
        <p>Les données ont été synchronisées</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <button className="close-button" onClick={onClose} aria-label="Fermer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="form-header">
        <div className="form-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">{getTypeLabel()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          
          <div className="form-group">
            <label>Date d'entrée *</label>
            <input
              type="date"
              value={formData.DateEntree}
              onChange={(e) => setFormData({ ...formData, DateEntree: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Volume global des engagements (FCFA) *</label>
            <input
              type="number"
              value={formData.VolumeGlobalEngagements === 0 ? '' : formData.VolumeGlobalEngagements}
              onChange={(e) => setFormData({ ...formData, VolumeGlobalEngagements: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Volume des anomalies (agios et impayés) *</label>
            <input
              type="number"
              value={formData.VolumeAnomalies === 0 ? '' : formData.VolumeAnomalies}
              onChange={(e) => setFormData({ ...formData, VolumeAnomalies: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          {needsMontantSollicite() && (
            <div className="form-group">
              <label>Montant sollicité (FCFA) *</label>
              <input
                type="number"
                value={formData.MontantSollicite === 0 ? '' : formData.MontantSollicite}
                onChange={(e) => setFormData({ ...formData, MontantSollicite: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Agence *</label>
            {loadingAgences ? (
              <div className="loading">Chargement des agences...</div>
            ) : agences.length > 0 ? (
              <select
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                required
              >
                <option value="">-- Sélectionner une agence --</option>
                {agences.map((agence, index) => (
                  <option key={index} value={agence}>
                    {agence}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                placeholder="Nom de l'agence"
                required
              />
            )}
          </div>

        </div>

        <div className="card">
          <div className="card-header">
            <h4>RÉSUMÉ DES DONNÉES</h4>
          </div>
          <div className="card-content">
            <div className="form-row">
              <div>
                <span>Volume Engagements:</span>
                <strong>{formData.VolumeGlobalEngagements.toLocaleString()} FCFA</strong>
              </div>
              <div>
                <span>Volume Anomalies:</span>
                <strong>{formData.VolumeAnomalies.toLocaleString()} FCFA</strong>
              </div>
            </div>
            {needsMontantSollicite() && (
              <div className="form-row">
                <div>
                  <span>Montant Sollicité:</span>
                  <strong>{formData.MontantSollicite.toLocaleString()} FCFA</strong>
                </div>
                <div>
                  <span>Agence:</span>
                  <strong>{formData.Agence || '-'}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormDossiersRestructuration;
