import React, { useState, useEffect } from 'react';
import { SuiviDepassementsService } from '../../services/SuiviDepassementsService';
import { AgenceResauService } from '../../services/AgenceResauService';
import { format } from 'date-fns';


interface FormSuiviDepassementsProps {
  activityName: string;
  specificType: 'nombre-depassement' | 'depassement-regularise-72h' | 'depassement-attente-regularisation';
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviDepassements: React.FC<FormSuiviDepassementsProps> = ({ 
  activityName,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreCompte: 0,
    DateDepassement: format(new Date(), 'yyyy-MM-dd'),
    DureeDepassementJours: 0,
    VolumeDepassement: 0,
    Agence: '',
    Date: format(new Date(), 'yyyy-MM-dd'),
    Reference: '',
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
        DateDepassement: formData.DateDepassement,
        DureeDepassementJours: formData.DureeDepassementJours,
        VolumeDepassement: formData.VolumeDepassement,
        Agence: formData.Agence,
        Date: formData.Date,
        Reference: formData.Reference
      };
      
      console.log('📤 Envoi SuiviDepassements vers SharePoint:', record);
      
      await SuiviDepassementsService.create(record);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onSave(); }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
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
        <p>Dépassement enregistré avec succès</p>
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">Suivi des dépassements</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          
          <div className="form-group">
            <label className="form-label">Nombre de comptes *</label>
            <input 
              type="number"
              className="form-input"
              value={formData.NombreCompte === 0 ? '' : formData.NombreCompte}
              onChange={(e) => setFormData({ ...formData, NombreCompte: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date de dépassement *</label>
            <input 
              type="date"
              className="form-input"
              value={formData.DateDepassement}
              onChange={(e) => setFormData({ ...formData, DateDepassement: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Durée (jours) *</label>
            <input 
              type="number"
              className="form-input"
              value={formData.DureeDepassementJours === 0 ? '' : formData.DureeDepassementJours}
              onChange={(e) => setFormData({ ...formData, DureeDepassementJours: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Volume dépassement (FCFA) *</label>
            <input 
              type="number"
              className="form-input"
              value={formData.VolumeDepassement === 0 ? '' : formData.VolumeDepassement}
              onChange={(e) => setFormData({ ...formData, VolumeDepassement: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Agence *</label>
            {loadingAgences ? (
              <div className="loading">Chargement des agences...</div>
            ) : agences.length > 0 ? (
              <select 
                className="form-select"
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                required
              >
                <option value="">-- Sélectionner une agence --</option>
                {agences.map((agence, index) => (
                  <option key={index} value={agence}>{agence}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text"
                className="form-input"
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                placeholder="Nom de l'agence"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input 
              type="date"
              className="form-input"
              value={formData.Date}
              onChange={(e) => setFormData({ ...formData, Date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Référence</label>
            <input 
              type="text"
              className="form-input"
              value={formData.Reference}
              onChange={(e) => setFormData({ ...formData, Reference: e.target.value })}
              placeholder="Numéro de référence"
            />
          </div>

        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose}
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

export default FormSuiviDepassements;
