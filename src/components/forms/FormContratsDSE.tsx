import React, { useState, useEffect } from 'react';
import { ContratsService } from '../../services/ContratsService';
import { format } from 'date-fns';
import '../../styles/forms.css';


interface FormContratsDSEProps {
  activityName: string;
  contratType: 'avance-facture' | 'prefinancement' | 'cautions' | 'pv-comite';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;
}

const FormContratsDSE: React.FC<FormContratsDSEProps> = ({ 
  activityName, 
  contratType,
  onSave, 
  onCancel,
  departmentColor = '#107c10'
}) => {
  // Injection de la couleur du département
  useEffect(() => {
    document.documentElement.style.setProperty('--dept-color', departmentColor);
  }, [departmentColor]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    MatriculeClient: '',
    Montant: 0,
    DateVersement: format(new Date(), 'yyyy-MM-dd'),
    Duree: 0,
    Observation: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        MatriculeClient: formData.MatriculeClient,
        Montant: formData.Montant,
        DateVersement: formData.DateVersement,
        Duree: formData.Duree,
        Observation: formData.Observation || undefined,
      };

      console.log('📤 Envoi de la requête Contrats:', { record, activityName, contratType });

      const result = await ContratsService.create(record);
      
      if (result.success) {
        console.log('✅ Enregistrement réussi!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSave();
        }, 2000);
      } else {
        const errorMsg = result.error || 'Erreur inconnue lors de la sauvegarde';
        console.error('❌ Échec de l\'enregistrement:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Exception capturée:', error);
      alert('❌ Erreur lors de la sauvegarde:\n\n' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getContratIcon = () => {
    switch (contratType) {
      case 'avance-facture': return '📄';
      case 'prefinancement': return '💰';
      case 'cautions': return '🛡️';
      case 'pv-comite': return '🚀';
      default: return '📋';
    }
  };

  const getContratLabel = () => {
    switch (contratType) {
      case 'avance-facture': return 'Avance sur Facture';
      case 'prefinancement': return 'Préfinancement';
      case 'cautions': return 'Cautions';
      case 'pv-comite': return 'PV du comité de crédit';
      default: return contratType;
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
        <p>Le contrat a été enregistré avec succès</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <button className="close-button" onClick={onCancel} aria-label="Fermer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      
      <div className="form-header">
        <div className="form-icon">
          <span style={{ fontSize: '2rem' }}>{getContratIcon()}</span>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">{getContratLabel()}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Matricule Client *</label>
            <input
              type="text"
              className="form-input"
              value={formData.MatriculeClient}
              onChange={(e) => setFormData({ ...formData, MatriculeClient: e.target.value })}
              required
              placeholder="Exemple: CLI-12345"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Montant (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.Montant === 0 ? '' : formData.Montant}
              onChange={(e) => setFormData({ ...formData, Montant: parseFloat(e.target.value) || 0 })}
              required
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date de Versement *</label>
            <input
              type="date"
              className="form-input"
              value={formData.DateVersement}
              onChange={(e) => setFormData({ ...formData, DateVersement: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Durée (mois) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.Duree === 0 ? '' : formData.Duree}
              onChange={(e) => setFormData({ ...formData, Duree: parseInt(e.target.value) || 0 })}
              required
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Observation</label>
            <textarea
              className="form-input"
              value={formData.Observation}
              onChange={(e) => setFormData({ ...formData, Observation: e.target.value })}
              placeholder="Observations facultatives..."
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Card résumé */}
        {formData.Montant > 0 && (
          <div className="form-card-summary">
            <div className="summary-header">💰 Résumé</div>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Montant</span>
                <span className="summary-value primary">{formData.Montant.toLocaleString()} FCFA</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Durée</span>
                <span className="summary-value">{formData.Duree} mois</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date</span>
                <span className="summary-value">{format(new Date(formData.DateVersement), 'dd/MM/yyyy')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormContratsDSE;
