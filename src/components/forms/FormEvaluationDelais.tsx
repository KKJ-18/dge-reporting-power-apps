import React, { useState } from 'react';
import { AnalyseDelaisCreditService } from '../../services/AnalyseDelaisCreditService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

interface FormData {
  delaiMoyenDceJour: number;
  delaiMoyenUniteJour: number;
  delaiMoyenDrisqueJour: number;
  delaiMoyenDconfJour: number;
  delaiMoyenChaineJour: number;
}

interface FormEvaluationDelaisProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormEvaluationDelais: React.FC<FormEvaluationDelaisProps> = ({
  activityName,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    delaiMoyenDceJour: 0,
    delaiMoyenUniteJour: 0,
    delaiMoyenDrisqueJour: 0,
    delaiMoyenDconfJour: 0,
    delaiMoyenChaineJour: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const validateForm = (): boolean => {
    const values = Object.values(formData);
    
    if (values.every((v) => v === 0)) {
      setError('Au moins un délai doit être renseigné');
      return false;
    }

    if (values.some((v) => v < 0)) {
      setError('Les délais ne peuvent pas être négatifs');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        Title: activityName,
        DelaiMoyenDceJour: formData.delaiMoyenDceJour,
        DelaiMoyenUniteJour: formData.delaiMoyenUniteJour,
        DelaiMoyenDrisqueJour: formData.delaiMoyenDrisqueJour,
        DelaiMoyenDconfJour: formData.delaiMoyenDconfJour,
        DelaiMoyenChaineJour: formData.delaiMoyenChaineJour,
      };

      console.log('💾 Sauvegarde délais:', dataToSave);
      const result = await AnalyseDelaisCreditService.create(dataToSave);
      console.log('✅ Résultat:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }
      
      showSuccess(
        'Enregistrement réussi',
        `Délais de crédit enregistrés avec succès pour "${activityName}".`
      );
      
      setTimeout(() => onSave(), 500);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      showError(
        'Erreur d\'enregistrement',
        err.message || 'Une erreur est survenue lors de la sauvegarde'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="evaluation-delais-form-container">
      <div className="form-header">
        <h2>{activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="evaluation-delais-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="form-section">
          <h3>⏱️ Délais Moyens (en jours)</h3>
          <p className="section-info">
            Saisissez les délais moyens d'exécution pour chaque étape du processus de crédit.
          </p>

          <div className="delais-grid">
            <div className="form-group">
              <label htmlFor="delaiMoyenDceJour">
                Délai moyen DCE
                <span className="tooltip" title="Délai moyen de traitement par la Direction du Crédit et de l'Engagement">ℹ️</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="delaiMoyenDceJour"
                  name="delaiMoyenDceJour"
                  value={formData.delaiMoyenDceJour}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
                <span className="unit">jours</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delaiMoyenUniteJour">
                Délai moyen Unité
                <span className="tooltip" title="Délai moyen de traitement par l'unité">ℹ️</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="delaiMoyenUniteJour"
                  name="delaiMoyenUniteJour"
                  value={formData.delaiMoyenUniteJour}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
                <span className="unit">jours</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delaiMoyenDrisqueJour">
                Délai moyen DRISQUE
                <span className="tooltip" title="Délai moyen de traitement par la Direction des Risques">ℹ️</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="delaiMoyenDrisqueJour"
                  name="delaiMoyenDrisqueJour"
                  value={formData.delaiMoyenDrisqueJour}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
                <span className="unit">jours</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delaiMoyenDconfJour">
                Délai moyen DCONF
                <span className="tooltip" title="Délai moyen de traitement par la Direction Conformité">ℹ️</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="delaiMoyenDconfJour"
                  name="delaiMoyenDconfJour"
                  value={formData.delaiMoyenDconfJour}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
                <span className="unit">jours</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="delaiMoyenChaineJour">
                Délai moyen Chaîne globale
                <span className="tooltip" title="Délai moyen global de traitement de bout en bout">ℹ️</span>
              </label>
              <div className="input-with-unit">
                <input
                  type="number"
                  id="delaiMoyenChaineJour"
                  name="delaiMoyenChaineJour"
                  value={formData.delaiMoyenChaineJour}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
                <span className="unit">jours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </form>
      
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
};

export default FormEvaluationDelais;
