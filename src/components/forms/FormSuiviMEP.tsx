import React, { useState } from 'react';
import { AnalyseSuiviMEPService } from '../../services/AnalyseSuiviMEPService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

interface FormData {
  dossiersAttentePrecedent: number;
  mouvementMois: number;
  stockRestant: number;
}

interface FormSuiviMEPProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviMEP: React.FC<FormSuiviMEPProps> = ({
  activityName,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    dossiersAttentePrecedent: 0,
    mouvementMois: 0,
    stockRestant: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const validateForm = (): boolean => {
    if (formData.dossiersAttentePrecedent < 0) {
      setError('Le nombre de dossiers en attente ne peut pas être négatif');
      return false;
    }

    // Stock restant doit égaler: (Attente précédent + Mouvement mois)
    const calculatedStock =
      formData.dossiersAttentePrecedent + formData.mouvementMois;
    if (formData.stockRestant !== calculatedStock) {
      setError(
        `Le stock restant doit être égal à ${calculatedStock} (Attente précédent ${formData.dossiersAttentePrecedent} + Mouvement du mois ${formData.mouvementMois})`
      );
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
        DossiersAttentePrecedent: formData.dossiersAttentePrecedent,
        MouvementMois: formData.mouvementMois,
        StockRestant: formData.stockRestant,
      };

      console.log('💾 Sauvegarde MEP:', dataToSave);
      const result = await AnalyseSuiviMEPService.create(dataToSave);
      console.log('✅ Résultat:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }
      
      showSuccess(
        'Enregistrement réussi',
        `Suivi MEP enregistré avec succès pour "${activityName}".\nStock restant: ${formData.stockRestant} dossier(s).`
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

  // Auto-calculer le stock restant
  React.useEffect(() => {
    const calculatedStock =
      formData.dossiersAttentePrecedent + formData.mouvementMois;
    if (formData.stockRestant !== calculatedStock) {
      setFormData((prev) => ({
        ...prev,
        stockRestant: calculatedStock,
      }));
    }
  }, [formData.dossiersAttentePrecedent, formData.mouvementMois]);

  return (
    <div className="suivi-mep-form-container">
      <div className="form-header">
        <h2>{activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="suivi-mep-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="form-section">
          <h3>📋 Suivi des Mises en Place</h3>
          <p className="section-info">
            Suivez l'évolution des dossiers en attente de mise en place.
          </p>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dossiersAttentePrecedent">
                Dossiers en attente du mois précédent{' '}
                <span className="required">*</span>
              </label>
              <input
                type="number"
                id="dossiersAttentePrecedent"
                name="dossiersAttentePrecedent"
                value={formData.dossiersAttentePrecedent}
                onChange={handleInputChange}
                min="0"
                required
              />
              <small>Nombre de dossiers en attente reportés du mois précédent</small>
            </div>

            <div className="form-group">
              <label htmlFor="mouvementMois">
                Mouvement du mois <span className="required">*</span>
              </label>
              <input
                type="number"
                id="mouvementMois"
                name="mouvementMois"
                value={formData.mouvementMois}
                onChange={handleInputChange}
                required
              />
              <small>
                Nombre de dossiers traités dans le mois (positif = nouveaux,
                négatif = clôturés)
              </small>
            </div>

            <div className="form-group calculated-field">
              <label htmlFor="stockRestant">
                Stock restant <span className="auto-calc">✓ Calculé automatiquement</span>
              </label>
              <input
                type="number"
                id="stockRestant"
                name="stockRestant"
                value={formData.stockRestant}
                readOnly
                disabled
              />
              <small>
                Attente précédent ({formData.dossiersAttentePrecedent}) +
                Mouvement ({formData.mouvementMois}) ={' '}
                <strong>{formData.stockRestant}</strong>
              </small>
            </div>
          </div>
        </div>

        <div className="info-box">
          <h4>ℹ️ Comment remplir ce formulaire</h4>
          <ul>
            <li>
              <strong>Dossiers en attente du mois précédent :</strong> Le nombre de
              dossiers qui étaient en attente à la fin du mois dernier
            </li>
            <li>
              <strong>Mouvement du mois :</strong> Les nouveaux dossiers ajoutés
              (valeur positive) ou les dossiers clôturés (valeur négative)
            </li>
            <li>
              <strong>Stock restant :</strong> Se calcule automatiquement
              (Attente + Mouvement)
            </li>
          </ul>
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

export default FormSuiviMEP;
