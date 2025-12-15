import React, { useState, useEffect } from 'react';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

interface FormSuiviAnomalieClientProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormSuiviAnomalieClient: React.FC<FormSuiviAnomalieClientProps> = ({
  activityName,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    dateEntree: new Date().toISOString().split('T')[0],
    matricule: '',
    nomClient: '',
    volumeAnomalie: 0,
    agence: '',
    statut: 'réception',
    commentaire: '',
  });

  const statutOptions = [
    'réception',
    'attente complément d\'observation',
    'en cours d\'analyse',
    'attente décision',
    'accord comité',
    'renvoi comité',
    'attente avis conformité',
    'attente comité crédit',
  ];

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'volumeAnomalie' ? Number(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.dateEntree) {
      setError('La date d\'entrée est obligatoire');
      return false;
    }

    if (!formData.matricule.trim()) {
      setError('Le matricule client est obligatoire');
      return false;
    }

    if (!formData.nomClient.trim()) {
      setError('L\'intitulé client est obligatoire');
      return false;
    }

    if (formData.volumeAnomalie <= 0) {
      setError('Le volume anomalie doit être supérieur à 0');
      return false;
    }

    if (!formData.agence) {
      setError('L\'agence est obligatoire');
      return false;
    }

    if (!formData.statut) {
      setError('Le statut est obligatoire');
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
        Title: `${activityName} - ${formData.nomClient}`,
        NomClient: formData.nomClient,
        Matricule: formData.matricule,
        MontantSollicite: formData.volumeAnomalie,
        Decision: formData.statut,
        Commentaire: formData.commentaire,
        Comite: formData.agence,
        DetailDecision: `Date d'entrée: ${formData.dateEntree}`,
      };

      console.log('💾 Sauvegarde anomalie client:', dataToSave);
      const result = await DetailsDossiersService.create(dataToSave);
      console.log('✅ Résultat:', result);

      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }

      showSuccess(
        'Enregistrement réussi',
        `Anomalie client "${formData.nomClient}" enregistrée avec succès.\nStatut: ${formData.statut}`
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
    <div className="suivi-anomalie-client-form-container">
      <div className="form-header">
        <h2>📋 {activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="suivi-anomalie-client-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Section 1: Informations Client */}
        <div className="form-section">
          <h3>👤 Informations Client</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dateEntree">
                Date d'entrée <span className="required">*</span>
              </label>
              <input
                type="date"
                id="dateEntree"
                name="dateEntree"
                value={formData.dateEntree}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="matricule">
                Matricule client <span className="required">*</span>
              </label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                placeholder="Ex: CLT123456"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="nomClient">
                Intitulé client <span className="required">*</span>
              </label>
              <input
                type="text"
                id="nomClient"
                name="nomClient"
                value={formData.nomClient}
                onChange={handleInputChange}
                placeholder="Ex: ENTREPRISE ABC SARL"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Détails Anomalie */}
        <div className="form-section">
          <h3>💰 Détails de l'Anomalie</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="volumeAnomalie">
                Volume anomalie (FCFA) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="volumeAnomalie"
                name="volumeAnomalie"
                value={formData.volumeAnomalie}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Ex: 5000000"
                required
              />
              <small className="field-hint">
                {formData.volumeAnomalie > 0 &&
                  `${formData.volumeAnomalie.toLocaleString('fr-FR')} FCFA`}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="agence">
                Agence <span className="required">*</span>
              </label>
              <select
                id="agence"
                name="agence"
                value={formData.agence}
                onChange={handleInputChange}
                required
                disabled={loadingAgences}
              >
                <option value="">
                  {loadingAgences ? 'Chargement...' : 'Sélectionner une agence'}
                </option>
                {agences.map((agence) => (
                  <option key={agence} value={agence}>
                    {agence}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Statut et Commentaires */}
        <div className="form-section">
          <h3>📊 Statut & Observations</h3>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="statut">
                Statut <span className="required">*</span>
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={handleInputChange}
                required
              >
                {statutOptions.map((statut) => (
                  <option key={statut} value={statut}>
                    {statut}
                  </option>
                ))}
              </select>
              <small className="field-hint">
                Sélectionnez le statut actuel du dossier
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="commentaire">Commentaire / Observation</label>
              <textarea
                id="commentaire"
                name="commentaire"
                value={formData.commentaire}
                onChange={handleInputChange}
                rows={4}
                placeholder="Ajoutez des commentaires ou observations..."
              />
            </div>
          </div>
        </div>

        {/* Section 4: Résumé */}
        <div className="form-section summary-section">
          <h3>📝 Résumé</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Client:</span>
              <span className="summary-value">
                {formData.nomClient || '-'} ({formData.matricule || '-'})
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Volume anomalie:</span>
              <span className="summary-value">
                {formData.volumeAnomalie > 0
                  ? `${formData.volumeAnomalie.toLocaleString('fr-FR')} FCFA`
                  : '-'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Agence:</span>
              <span className="summary-value">{formData.agence || '-'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Statut:</span>
              <span className="summary-value status-badge">{formData.statut}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
            {loading ? (
              <>
                <span className="spinner"></span> Enregistrement...
              </>
            ) : (
              <>✓ Enregistrer</>
            )}
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

      <style jsx>{`
        .suivi-anomalie-client-form-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0.5rem;
          line-height: 1;
        }

        .close-btn:hover {
          color: #dc2626;
        }

        .suivi-anomalie-client-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
        }

        .form-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-row:last-child {
          margin-bottom: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-group .required {
          color: #dc2626;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.625rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .field-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 0.75rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .summary-section {
          background-color: #f9fafb;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border-radius: 4px;
        }

        .summary-label {
          font-weight: 500;
          color: #6b7280;
        }

        .summary-value {
          font-weight: 600;
          color: #1f2937;
        }

        .status-badge {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 0.625rem 1.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .suivi-anomalie-client-form-container {
            padding: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-header h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FormSuiviAnomalieClient;
