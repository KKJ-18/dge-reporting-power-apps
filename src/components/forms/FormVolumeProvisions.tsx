import React, { useState, useEffect } from 'react';
import { VolumeProvisionsService } from '../../services/VolumeProvisionsService';
import { AgenceResauService } from '../../services/AgenceResauService';
import './CommonForm.css';

interface Props { 
  activityName: string; 
  specificType: string; 
  departmentColor?: string; 
  onClose: () => void; 
  onSave: () => void; 
}

const FormVolumeProvisions: React.FC<Props> = ({ 
  activityName, 
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreCompteProvisionnes: 0,
    Agence: '',
    MontantProvision: 0,
    MontantProvisionReprendre: 0,
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
        NombreCompteProvisionnes: formData.NombreCompteProvisionnes,
        Agence: formData.Agence,
        MontantProvision: formData.MontantProvision,
        MontantProvisionReprendre: formData.MontantProvisionReprendre,
      };

      console.log('📤 Envoi VolumeProvisions vers SharePoint:', record);

      await VolumeProvisionsService.create(record);
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
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">Volume des provisions</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          
          {/* Nombre de comptes provisionnés */}
          <div className="form-group">
            <label>Nombre de comptes provisionnés *</label>
            <input
              type="number"
              value={formData.NombreCompteProvisionnes === 0 ? '' : formData.NombreCompteProvisionnes}
              onChange={(e) => setFormData({ ...formData, NombreCompteProvisionnes: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          {/* Agence */}
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

          {/* Montant à provision */}
          <div className="form-group">
            <label>Montant à provision (FCFA) *</label>
            <input
              type="number"
              value={formData.MontantProvision === 0 ? '' : formData.MontantProvision}
              onChange={(e) => setFormData({ ...formData, MontantProvision: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          {/* Montant de provision à reprendre */}
          <div className="form-group">
            <label>Montant de provision à reprendre (FCFA) *</label>
            <input
              type="number"
              value={formData.MontantProvisionReprendre === 0 ? '' : formData.MontantProvisionReprendre}
              onChange={(e) => setFormData({ ...formData, MontantProvisionReprendre: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

        </div>

        {/* Résumé */}
        <div className="card">
          <div className="card-header">
            <h4>RÉSUMÉ DES DONNÉES</h4>
          </div>
          <div className="card-content">
            <div className="form-row">
              <div>
                <span>Comptes provisionnés:</span>
                <strong>{formData.NombreCompteProvisionnes}</strong>
              </div>
              <div>
                <span>Agence:</span>
                <strong>{formData.Agence || '-'}</strong>
              </div>
            </div>
            <div className="form-row">
              <div>
                <span>Montant provision:</span>
                <strong>{formData.MontantProvision.toLocaleString()} FCFA</strong>
              </div>
              <div>
                <span>À reprendre:</span>
                <strong>{formData.MontantProvisionReprendre.toLocaleString()} FCFA</strong>
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

export default FormVolumeProvisions;
