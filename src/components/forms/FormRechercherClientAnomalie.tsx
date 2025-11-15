import React, { useState } from 'react';
import { RechercherClientAnomalieService } from '../../services/RechercherClientAnomalieService';
import './CommonForm.css';

interface Props { 
  activityName: string; 
  specificType: string; 
  onClose: () => void; 
  onSave: () => void; 
}

const FormRechercherClientAnomalie: React.FC<Props> = ({ 
  activityName, 
  specificType,
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NbreClientAnomalie: 0,
    NbreClientRetrouve: 0,
    NbreClientContacte: 0,
    NbreClientAyantRepondu: 0,
    NbreClientCooperatif: 0,
    DateVersement: '',
    MontantVersement: 0,
    NbreClientAyantDemandeRestructur: 0,
    MontantGlobalEngagement: 0,
    VolumeAnomalie: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        NbreClientAnomalie: formData.NbreClientAnomalie,
        NbreClientRetrouve: formData.NbreClientRetrouve,
        NbreClientContacte: formData.NbreClientContacte,
        NbreClientAyantRepondu: formData.NbreClientAyantRepondu,
        NbreClientCooperatif: formData.NbreClientCooperatif,
        DateVersement: formData.DateVersement || undefined,
        MontantVersement: formData.MontantVersement,
        NbreClientAyantDemandeRestructur: formData.NbreClientAyantDemandeRestructur,
        MontantGlobalEngagement: formData.MontantGlobalEngagement,
        VolumeAnomalie: formData.VolumeAnomalie,
      };

      console.log('📤 Envoi RechercherClientAnomalie vers SharePoint:', record);

      await RechercherClientAnomalieService.create(record);
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

  if (showSuccess) {
    return (
      <div className="success-message">
        <div className="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>Enregistrement réussi</h3>
        <p>Recherche client anomalie enregistrée</p>
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
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">{specificType}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        
        {/* Section: Statistiques clients */}
        <div className="form-section" style={{ backgroundColor: '#F9FAFB', padding: '1.5rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
          <h3 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Statistiques clients
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre de clients en anomalies *</label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientAnomalie === 0 ? '' : formData.NbreClientAnomalie}
                onChange={(e) => setFormData({ ...formData, NbreClientAnomalie: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de clients retrouvés *</label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientRetrouve === 0 ? '' : formData.NbreClientRetrouve}
                onChange={(e) => setFormData({ ...formData, NbreClientRetrouve: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de clients contactés *</label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientContacte === 0 ? '' : formData.NbreClientContacte}
                onChange={(e) => setFormData({ ...formData, NbreClientContacte: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de clients ayant répondu *</label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientAyantRepondu === 0 ? '' : formData.NbreClientAyantRepondu}
                onChange={(e) => setFormData({ ...formData, NbreClientAyantRepondu: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Nombre de clients coopératifs *
                <span className="field-hint">(lettre d'engagement signée)</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientCooperatif === 0 ? '' : formData.NbreClientCooperatif}
                onChange={(e) => setFormData({ ...formData, NbreClientCooperatif: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Demandes de restructuration *</label>
              <input
                type="number"
                className="form-input"
                value={formData.NbreClientAyantDemandeRestructur === 0 ? '' : formData.NbreClientAyantDemandeRestructur}
                onChange={(e) => setFormData({ ...formData, NbreClientAyantDemandeRestructur: parseInt(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          </div>
        </div>

        {/* Section: Informations financières */}
        <div className="form-section" style={{ backgroundColor: '#F9FAFB', padding: '1.5rem', borderRadius: '10px', border: '2px solid #E5E7EB' }}>
          <h3 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Informations financières
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date de versement</label>
              <input
                type="date"
                className="form-input"
                value={formData.DateVersement}
                onChange={(e) => setFormData({ ...formData, DateVersement: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant versement (FCFA) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.MontantVersement === 0 ? '' : formData.MontantVersement}
                onChange={(e) => setFormData({ ...formData, MontantVersement: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant global des engagements (FCFA) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.MontantGlobalEngagement === 0 ? '' : formData.MontantGlobalEngagement}
                onChange={(e) => setFormData({ ...formData, MontantGlobalEngagement: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Volume des anomalies (FCFA) *
                <span className="field-hint">(agios + impayés)</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={formData.VolumeAnomalie === 0 ? '' : formData.VolumeAnomalie}
                onChange={(e) => setFormData({ ...formData, VolumeAnomalie: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                required
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="card">
          <div className="card-header">RÉSUMÉ DES DONNÉES</div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div>
                <span>Clients anomalies:</span>
                <strong>{formData.NbreClientAnomalie}</strong>
              </div>
              <div>
                <span>Retrouvés:</span>
                <strong>{formData.NbreClientRetrouve}</strong>
              </div>
              <div>
                <span>Contactés:</span>
                <strong>{formData.NbreClientContacte}</strong>
              </div>
              <div>
                <span>Ont répondu:</span>
                <strong>{formData.NbreClientAyantRepondu}</strong>
              </div>
              <div>
                <span>Coopératifs:</span>
                <strong>{formData.NbreClientCooperatif}</strong>
              </div>
              <div>
                <span>Restructurations:</span>
                <strong>{formData.NbreClientAyantDemandeRestructur}</strong>
              </div>
              <div>
                <span>Versement:</span>
                <strong>{formData.MontantVersement.toLocaleString()} FCFA</strong>
              </div>
              <div>
                <span>Engagements:</span>
                <strong>{formData.MontantGlobalEngagement.toLocaleString()} FCFA</strong>
              </div>
              <div>
                <span>Volume anomalies:</span>
                <strong>{formData.VolumeAnomalie.toLocaleString()} FCFA</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
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

export default FormRechercherClientAnomalie;
