import React, { useState } from 'react';
import { AnalyseSuiviTransmissionService } from '../../services/AnalyseSuiviTransmissionService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import './FormSuiviTransmission.css';

interface FormData {
  nombre: number;
  montant: number;
  dateReception: string;
  dateTransmission: string;
  dateComite: string;
  typeComite: string;
}

interface FormSuiviTransmissionProps {
  activityName: string;
  requiresComite: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviTransmission: React.FC<FormSuiviTransmissionProps> = ({
  activityName,
  requiresComite,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    nombre: 0,
    montant: 0,
    dateReception: '',
    dateTransmission: '',
    dateComite: '',
    typeComite: '',
  });

  const typeComiteOptions = ['CC1', 'CC2', 'CC3', 'CC4', 'CCCA'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nombre' || name === 'montant' ? Number(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (formData.nombre <= 0) {
      setError('Le nombre de dossiers doit être supérieur à 0');
      return false;
    }

    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }

    if (!formData.dateReception) {
      setError('La date de réception est obligatoire');
      return false;
    }

    if (!formData.dateTransmission) {
      setError('La date de transmission est obligatoire');
      return false;
    }

    if (requiresComite) {
      if (!formData.dateComite) {
        setError('La date de comité est obligatoire');
        return false;
      }

      if (!formData.typeComite) {
        setError('Le type de comité est obligatoire');
        return false;
      }
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
        Nombre: formData.nombre,
        Montant: formData.montant,
        DateReception: formData.dateReception,
        DateTransmission: formData.dateTransmission,
        DateComite: requiresComite ? formData.dateComite : undefined,
      };

      console.log('💾 Sauvegarde transmission:', dataToSave);
      const result = await AnalyseSuiviTransmissionService.create(dataToSave);
      console.log('✅ Résultat:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }
      
      showSuccess(
        'Enregistrement réussi',
        `Activité "${activityName}" enregistrée avec succès.\n${formData.nombre} dossier(s) pour un montant de ${formData.montant.toLocaleString()} FCFA.`
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
    <div className="suivi-transmission-form-container">
      <div className="form-header">
        <h2>{activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="suivi-transmission-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="form-section">
          <h3>📊 Informations Générales</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre de dossiers <span className="required">*</span>
              </label>
              <input
                type="number"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="montant">
                Montant (en millions) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="montant"
                name="montant"
                value={formData.montant}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>📅 Dates</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateReception">
                Date de réception <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dateReception"
                name="dateReception"
                value={formData.dateReception}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateTransmission">
                Date de transmission <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dateTransmission"
                name="dateTransmission"
                value={formData.dateTransmission}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {requiresComite && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateComite">
                  Date de comité <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateComite"
                  name="dateComite"
                  value={formData.dateComite}
                  onChange={handleInputChange}
                  required={requiresComite}
                />
              </div>

              <div className="form-group">
                <label htmlFor="typeComite">
                  Type de comité <span className="required">*</span>
                </label>
                <select
                  id="typeComite"
                  name="typeComite"
                  value={formData.typeComite}
                  onChange={handleInputChange}
                  required={requiresComite}
                >
                  <option value="">-- Sélectionner --</option>
                  {typeComiteOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
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

export default FormSuiviTransmission;
