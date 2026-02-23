import React, { useState, useEffect } from 'react';
import { FormationUnitesService } from '../../services/FormationUnitesService';
import { AgenceResauService } from '../../services/AgenceResauService';


interface FormFormationUnitesProps {
  activityName: string;
  onClose: () => void;
  onSave: () => void;
}

const FormFormationUnites: React.FC<FormFormationUnitesProps> = ({ 
  activityName,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [loadingReseaux, setLoadingReseaux] = useState(false);
  const [formData, setFormData] = useState({
    Reseau: '',
    SujetFormation: '',
    NombrePersonnesFormees: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingReseaux(true);
      try {
        const result = await AgenceResauService.getAll();
        const data: any[] = result?.data || result?.value || [];
        setReseaux(Array.from(new Set(data.map((d: any) => d.NomResau).filter(Boolean))).sort() as string[]);
      } catch { /* silent */ } finally { setLoadingReseaux(false); }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        SujetFormation: `[${formData.Reseau}] ${formData.SujetFormation}`,
        NombrePersonnesFormees: formData.NombrePersonnesFormees,
      };

      console.log('📤 Envoi FormationUnites vers SharePoint:', record);

      await FormationUnitesService.create(record);
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
        <p>Formation enregistrée avec succès</p>
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">Formation sur des thèmes précis</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          
          <div className="form-group">
            <label className="form-label">Réseau *</label>
            {loadingReseaux ? (
              <div className="loading">Chargement...</div>
            ) : reseaux.length > 0 ? (
              <select
                className="form-select"
                value={formData.Reseau}
                onChange={(e) => setFormData({ ...formData, Reseau: e.target.value })}
                required
              >
                <option value="">-- Sélectionner un réseau --</option>
                {reseaux.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            ) : (
              <input
                type="text"
                className="form-input"
                value={formData.Reseau}
                onChange={(e) => setFormData({ ...formData, Reseau: e.target.value })}
                placeholder="Nom du réseau"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Sujet de formation *</label>
            <textarea 
              className="form-textarea"
              value={formData.SujetFormation}
              onChange={(e) => setFormData({ ...formData, SujetFormation: e.target.value })}
              placeholder="Description du sujet de formation"
              required
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de personnes formées *</label>
            <input 
              type="number" 
              className="form-input"
              value={formData.NombrePersonnesFormees === 0 ? '' : formData.NombrePersonnesFormees}
              onChange={(e) => setFormData({ ...formData, NombrePersonnesFormees: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => e.currentTarget.select()}
            />
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

export default FormFormationUnites;
