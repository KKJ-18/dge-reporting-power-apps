import React, { useState, useEffect } from 'react';
import { AccordsService } from '../../services/AccordsService';
import '../../styles/forms.css';


interface FormAccordsDSEProps {
  activityName: string;
  accordType: 'autorisation-mobilisation' | 'accords-classement' | 'accords-liste';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;
}

const FormAccordsDSE: React.FC<FormAccordsDSEProps> = ({ 
  activityName, 
  accordType,
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
    Matricule: '',
    Statut: 'Representer',
    MontanPret: 0,
    MontantDemande: 0,
    MontantAccorde: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        Matricule: formData.Matricule,
        Statut: { Value: formData.Statut },
        MontanPret: formData.MontanPret,
        MontantDemande: formData.MontantDemande,
        MontantAccorde: formData.MontantAccorde,
      };

      console.log('📤 Envoi de la requête Accords:', { record, activityName, accordType });

      const result = await AccordsService.create(record);
      
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

  const getAccordIcon = () => {
    switch (accordType) {
      case 'autorisation-mobilisation': return '📝';
      case 'accords-classement': return '📊';
      case 'accords-liste': return '📋';
      default: return '📄';
    }
  };

  const getAccordLabel = () => {
    switch (accordType) {
      case 'autorisation-mobilisation': return 'Autorisation Individuelle de Mobilisation';
      case 'accords-classement': return 'Accords de Classement';
      case 'accords-liste': return 'Accords sur Liste';
      default: return accordType;
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
        <p>L'accord a été enregistré avec succès</p>
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
          <span style={{ fontSize: '2rem' }}>{getAccordIcon()}</span>
        </div>
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <div className="form-badge">{getAccordLabel()}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Matricule Client *</label>
            <input
              type="text"
              className="form-input"
              value={formData.Matricule}
              onChange={(e) => setFormData({ ...formData, Matricule: e.target.value })}
              required
              placeholder="Exemple: CLI-12345"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Statut *</label>
            <select
              className="form-input"
              value={formData.Statut}
              onChange={(e) => setFormData({ ...formData, Statut: e.target.value })}
              required
            >
              <option value="Representer">Représenter</option>
              <option value="Non Representer">Non Représenter</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Montant Prêt (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.MontanPret === 0 ? '' : formData.MontanPret}
              onChange={(e) => setFormData({ ...formData, MontanPret: parseFloat(e.target.value) || 0 })}
              required
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Montant Demandé (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.MontantDemande === 0 ? '' : formData.MontantDemande}
              onChange={(e) => setFormData({ ...formData, MontantDemande: parseFloat(e.target.value) || 0 })}
              required
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Montant Accordé (FCFA) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.MontantAccorde === 0 ? '' : formData.MontantAccorde}
              onChange={(e) => setFormData({ ...formData, MontantAccorde: parseFloat(e.target.value) || 0 })}
              required
              placeholder="0"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        </div>

        {/* Card résumé */}
        {(formData.MontantDemande > 0 || formData.MontantAccorde > 0) && (
          <div className="form-card-summary">
            <div className="summary-header">📊 Résumé</div>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Demandé</span>
                <span className="summary-value">{formData.MontantDemande.toLocaleString()} FCFA</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Accordé</span>
                <span className="summary-value success">{formData.MontantAccorde.toLocaleString()} FCFA</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Taux d'accord</span>
                <span className="summary-value primary">
                  {formData.MontantDemande > 0 
                    ? ((formData.MontantAccorde / formData.MontantDemande) * 100).toFixed(1) 
                    : 0}%
                </span>
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

export default FormAccordsDSE;
