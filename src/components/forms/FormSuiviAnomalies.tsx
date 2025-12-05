import React, { useState, useEffect } from 'react';
import { SuiviAnomaliesService } from '../../services/SuiviAnomaliesService';
import { AgenceResauService } from '../../services/AgenceResauService';


interface FormSuiviAnomaliesProps {
  activityName: string;
  specificType: 'anomalies-tresorerie' | 'anomalies-leasing';
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviAnomalies: React.FC<FormSuiviAnomaliesProps> = ({ 
  activityName,
  specificType,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreCompte: 0,
    MontantGlobal: 0,
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
        NombreCompte: formData.NombreCompte,
        MontantGlobal: formData.MontantGlobal,
        Agence: formData.Agence,
      };

      console.log('📤 Envoi FormSuiviAnomalies:', record);

      await SuiviAnomaliesService.create(record);
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

  const getTypeLabel = () => {
    return specificType === 'anomalies-tresorerie' 
      ? 'Anomalies Trésorerie' 
      : 'Anomalies Leasing';
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
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
            <label>Nombre de comptes *</label>
            <input
              type="number"
              value={formData.NombreCompte === 0 ? '' : formData.NombreCompte}
              onChange={(e) => setFormData({ ...formData, NombreCompte: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Montant global (FCFA) *</label>
            <input
              type="number"
              value={formData.MontantGlobal === 0 ? '' : formData.MontantGlobal}
              onChange={(e) => setFormData({ ...formData, MontantGlobal: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

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
                <span>Nombre de comptes:</span>
                <strong>{formData.NombreCompte}</strong>
              </div>
              <div>
                <span>Montant global:</span>
                <strong>{formData.MontantGlobal.toLocaleString()} FCFA</strong>
              </div>
            </div>
            <div className="form-row">
              <div>
                <span>Agence:</span>
                <strong>{formData.Agence || '-'}</strong>
              </div>
            </div>
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

export default FormSuiviAnomalies;
