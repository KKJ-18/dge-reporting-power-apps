import React, { useState } from 'react';
import { SuiviClientAppeleService } from '../../services/SuiviClientAppeleService';
import { format } from 'date-fns';
import '../../styles/forms.css';


interface FormSuiviClientAppeleProps {
  activityName: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviClientAppele: React.FC<FormSuiviClientAppeleProps> = ({
  activityName,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NbreClientAnomalie: 0,
    NbreClientApple: 0,
    VolumeGlobalEngagement: 0,
    VolumeAnomalie: 0,
    DateAppel: format(new Date(), 'yyyy-MM-dd'),
    DateRenseignementRdv: '',
    DateRdv: '',
    DateVersement: '',
    MontantVersement: 0
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const record = {
        Title: activityName,
        NbreClientAnomalie: formData.NbreClientAnomalie,
        NbreClientApple: formData.NbreClientApple,
        VolumeGlobalEngagement: formData.VolumeGlobalEngagement,
        VolumeAnomalie: formData.VolumeAnomalie,
        DateAppel: formData.DateAppel,
        DateRenseignementRdv: formData.DateRenseignementRdv || undefined,
        DateRdv: formData.DateRdv || undefined,
        DateVersement: formData.DateVersement || undefined,
        MontantVersement: formData.MontantVersement
      };
      console.log('📤 Envoi SuiviClientAppele vers SharePoint:', record);
      await SuiviClientAppeleService.create(record);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onSave(); }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l enregistrement');
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
        <p>Suivi client appelé enregistré</p>
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
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">Recouvrement par versement</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Nombre de clients en anomalies *</label>
            <input type="number" className="form-input" value={formData.NbreClientAnomalie === 0 ? '' : formData.NbreClientAnomalie} onChange={(e) => setFormData({ ...formData, NbreClientAnomalie: parseInt(e.target.value) || 0 })} required onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre de clients appelés *</label>
            <input type="number" className="form-input" value={formData.NbreClientApple === 0 ? '' : formData.NbreClientApple} onChange={(e) => setFormData({ ...formData, NbreClientApple: parseInt(e.target.value) || 0 })} required onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="form-group">
            <label className="form-label">Volume global des engagements (FCFA) *</label>
            <input type="number" className="form-input" value={formData.VolumeGlobalEngagement === 0 ? '' : formData.VolumeGlobalEngagement} onChange={(e) => setFormData({ ...formData, VolumeGlobalEngagement: parseFloat(e.target.value) || 0 })} required onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="form-group">
            <label className="form-label">Volume des anomalies (FCFA) *</label>
            <input type="number" className="form-input" value={formData.VolumeAnomalie === 0 ? '' : formData.VolumeAnomalie} onChange={(e) => setFormData({ ...formData, VolumeAnomalie: parseFloat(e.target.value) || 0 })} required onFocus={(e) => e.currentTarget.select()} />
          </div>
          <div className="form-group">
            <label className="form-label">Date d appel *</label>
            <input type="date" className="form-input" value={formData.DateAppel} onChange={(e) => setFormData({ ...formData, DateAppel: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Date de renseignement du RDV pris</label>
            <input type="date" className="form-input" value={formData.DateRenseignementRdv} onChange={(e) => setFormData({ ...formData, DateRenseignementRdv: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Date du RDV pris</label>
            <input type="date" className="form-input" value={formData.DateRdv} onChange={(e) => setFormData({ ...formData, DateRdv: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Date de versement</label>
            <input type="date" className="form-input" value={formData.DateVersement} onChange={(e) => setFormData({ ...formData, DateVersement: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Montant versement (FCFA) *</label>
            <input type="number" className="form-input" value={formData.MontantVersement === 0 ? '' : formData.MontantVersement} onChange={(e) => setFormData({ ...formData, MontantVersement: parseFloat(e.target.value) || 0 })} required onFocus={(e) => e.currentTarget.select()} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};

export default FormSuiviClientAppele;
