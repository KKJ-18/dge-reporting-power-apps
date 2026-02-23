import React, { useState, useEffect } from 'react';
import { RepriseProvisionService } from '../../services/RepriseProvisionService';
import { AgenceResauService } from '../../services/AgenceResauService';


interface Props { 
  activityName: string; 
  specificType: string; 
  onClose: () => void; 
  onSave: () => void; 
}

const FormRepriseProvision: React.FC<Props> = ({ 
  activityName,
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreCompte: 0,
    AgenceDebit: '',
    ReseauDebit: '',
    AgenceCompteReclasser: '',
    ReseauCompteReclasser: '',
    MontantGlobalReclasser: 0,
    Date: new Date().toISOString().split('T')[0],
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
      const uniqueReseaux = Array.from(
        new Set(data.map((item: any) => item.NomResau).filter(Boolean))
      ).sort() as string[];
      setReseaux(uniqueReseaux);
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
        AgenceCompteReclasser: formData.AgenceCompteReclasser,
        MontantGlobalReclasser: formData.MontantGlobalReclasser,
        AgenceDebit: formData.AgenceDebit,
        ReseauDebit: formData.ReseauDebit,
        ReseauCompteReclasser: formData.ReseauCompteReclasser,
        Date: formData.Date,
        Reference: formData.Reference,
      };

      console.log('📤 Envoi RepriseProvision vers SharePoint:', record);

      await RepriseProvisionService.create(record);
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
        <p>Reprise de provision enregistrée</p>
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
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">Reprise de provision</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          
          <div className="form-group">
            <label className="form-label">Agence débit *</label>
            {loadingAgences ? (
              <div className="loading">Chargement des agences...</div>
            ) : agences.length > 0 ? (
              <select className="form-select" value={formData.AgenceDebit} onChange={(e) => setFormData({ ...formData, AgenceDebit: e.target.value })} required>
                <option value="">-- Sélectionner une agence --</option>
                {agences.map((agence, index) => (<option key={index} value={agence}>{agence}</option>))}
              </select>
            ) : (
              <input type="text" className="form-input" value={formData.AgenceDebit} onChange={(e) => setFormData({ ...formData, AgenceDebit: e.target.value })} placeholder="Agence débit" required />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Réseau débit *</label>
            {reseaux.length > 0 ? (
              <select className="form-select" value={formData.ReseauDebit} onChange={(e) => setFormData({ ...formData, ReseauDebit: e.target.value })} required>
                <option value="">-- Sélectionner un réseau --</option>
                {reseaux.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            ) : (
              <input type="text" className="form-input" value={formData.ReseauDebit} onChange={(e) => setFormData({ ...formData, ReseauDebit: e.target.value })} placeholder="Réseau débit" required />
            )}
          </div>

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
            <label className="form-label">Agence compte à reclasser *</label>
            {loadingAgences ? (
              <div className="loading">Chargement des agences...</div>
            ) : agences.length > 0 ? (
              <select
                className="form-select"
                value={formData.AgenceCompteReclasser}
                onChange={(e) => setFormData({ ...formData, AgenceCompteReclasser: e.target.value })}
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
                value={formData.AgenceCompteReclasser}
                onChange={(e) => setFormData({ ...formData, AgenceCompteReclasser: e.target.value })}
                placeholder="Nom de l'agence"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Réseau compte à reclasser *</label>
            {reseaux.length > 0 ? (
              <select className="form-select" value={formData.ReseauCompteReclasser} onChange={(e) => setFormData({ ...formData, ReseauCompteReclasser: e.target.value })} required>
                <option value="">-- Sélectionner un réseau --</option>
                {reseaux.map((r) => (<option key={r} value={r}>{r}</option>))}
              </select>
            ) : (
              <input type="text" className="form-input" value={formData.ReseauCompteReclasser} onChange={(e) => setFormData({ ...formData, ReseauCompteReclasser: e.target.value })} placeholder="Réseau compte à reclasser" required />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Montant global à reclasser (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.MontantGlobalReclasser === 0 ? '' : formData.MontantGlobalReclasser}
              onChange={(e) => setFormData({ ...formData, MontantGlobalReclasser: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => e.currentTarget.select()}
            />
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

        <div className="card">
          <div className="card-header">RÉSUMÉ DES DONNÉES</div>
          <div className="card-content">
            <div className="form-row">
              <div>
                <span>Agence débit:</span>
                <strong>{formData.AgenceDebit || '-'}</strong>
              </div>
              <div>
                <span>Réseau débit:</span>
                <strong>{formData.ReseauDebit || '-'}</strong>
              </div>
            </div>
            <div className="form-row">
              <div>
                <span>Agence compte à reclasser:</span>
                <strong>{formData.AgenceCompteReclasser || '-'}</strong>
              </div>
              <div>
                <span>Réseau compte à reclasser:</span>
                <strong>{formData.ReseauCompteReclasser || '-'}</strong>
              </div>
            </div>
            <div className="form-row">
              <div>
                <span>Nombre de comptes:</span>
                <strong>{formData.NombreCompte}</strong>
              </div>
              <div>
                <span>Montant à reclasser:</span>
                <strong>{formData.MontantGlobalReclasser.toLocaleString()} FCFA</strong>
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

export default FormRepriseProvision;
