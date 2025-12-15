import React, { useState, useEffect } from 'react';
import { SuiviDossiersRestructurationService } from '../../services/SuiviDossiersRestructurationService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

interface FormDossiersRestructurationV2Props {
  activityName: string;
  specificType: 'dossiers-recus' | 'dossiers-complements' | 'dossier-analyse' | 'dossier-attente-comite' 
    | 'dossier-attente-decision' | 'dossier-accord' | 'dossier-renvoye' | 'dossier-avis-conformite' 
    | 'attente-comite-credit' | 'remboursement-echeance';
  onClose: () => void;
  onSave: () => void;
}

interface DossierClient {
  id: string;
  matricule: string;
  nomClient: string;
  volumeAnomalie: number;
  statut: string;
  commentaire: string;
}

const FormDossiersRestructurationV2: React.FC<FormDossiersRestructurationV2Props> = ({
  activityName,
  specificType,
  onClose,
  onSave,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const getDefaultStatut = (): string => {
    return 'réception';
  };

  const [formData, setFormData] = useState({
    dateEntree: new Date().toISOString().split('T')[0],
    agence: '',
  });

  const [dossiers, setDossiers] = useState<DossierClient[]>([]);
  const [currentDossier, setCurrentDossier] = useState<DossierClient>({
    id: '',
    matricule: '',
    nomClient: '',
    volumeAnomalie: 0,
    statut: getDefaultStatut(),
    commentaire: '',
  });

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

  const generateReference = (): string => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RESTR-${date}-${time}-${random}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDossierChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentDossier((prev) => ({
      ...prev,
      [name]: name === 'volumeAnomalie' ? Number(value) : value,
    }));
  };

  const addDossier = () => {
    if (!currentDossier.matricule.trim()) {
      setError('Le matricule client est obligatoire');
      return;
    }

    if (!currentDossier.nomClient.trim()) {
      setError('L\'intitulé client est obligatoire');
      return;
    }

    if (currentDossier.volumeAnomalie <= 0) {
      setError('Le volume anomalie doit être supérieur à 0');
      return;
    }

    const newDossier = {
      ...currentDossier,
      id: `temp-${Date.now()}`,
    };

    setDossiers((prev) => [...prev, newDossier]);
    setCurrentDossier({
      id: '',
      matricule: '',
      nomClient: '',
      volumeAnomalie: 0,
      statut: getDefaultStatut(),
      commentaire: '',
    });
    setError(null);
  };

  const removeDossier = (id: string) => {
    setDossiers((prev) => prev.filter((d) => d.id !== id));
  };

  const calculateTotals = () => {
    const volumeGlobal = dossiers.reduce((sum, d) => sum + d.volumeAnomalie, 0);
    const volumeAnomalies = volumeGlobal; // Peut être ajusté selon la logique métier
    return { volumeGlobal, volumeAnomalies };
  };

  const validateForm = (): boolean => {
    if (!formData.dateEntree) {
      setError('La date d\'entrée est obligatoire');
      return false;
    }

    if (!formData.agence) {
      setError('L\'agence est obligatoire');
      return false;
    }

    if (dossiers.length === 0) {
      setError('Vous devez ajouter au moins un dossier client');
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
      // Générer un ID de référence unique
      const reference = generateReference();
      const totals = calculateTotals();

      // 1. Créer l'enregistrement principal dans SuiviDossiersRestructuration
      const mainData = {
        Title: activityName,
        DateEntree: formData.dateEntree,
        Agence: formData.agence,
        VolumeGlobalEngagements: totals.volumeGlobal,
        VolumeAnomalies: totals.volumeAnomalies,
        MontantSollicite: totals.volumeGlobal,
        Reference: reference,
      };

      console.log('💾 Sauvegarde principale:', mainData);
      const mainResult = await SuiviDossiersRestructurationService.create(mainData);

      if (!mainResult.success) {
        throw new Error(mainResult.error?.message || 'Échec de la sauvegarde principale');
      }

      // 2. Créer les détails dans DetailsDossiers
      for (const dossier of dossiers) {
        const detailData = {
          Title: `${activityName} - ${dossier.nomClient}`,
          NomClient: dossier.nomClient,
          Matricule: dossier.matricule,
          MontantSollicite: dossier.volumeAnomalie,
          Decision: dossier.statut,
          Commentaire: dossier.commentaire,
          Comite: formData.agence,
          ObjetCommentaire: reference, // Lien via référence
          DetailDecision: `Référence: ${reference} | Date entrée: ${formData.dateEntree}`,
        };

        console.log('💾 Sauvegarde détail:', detailData);
        const detailResult = await DetailsDossiersService.create(detailData);

        if (!detailResult.success) {
          console.error('Erreur sauvegarde détail:', detailResult.error);
          // Continue avec les autres même si un échoue
        }
      }

      showSuccess(
        'Enregistrement réussi',
        `Référence: ${reference}\n${dossiers.length} dossier(s) enregistré(s)\nVolume total: ${totals.volumeGlobal.toLocaleString('fr-FR')} FCFA`
      );

      setTimeout(() => onSave(), 1500);
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

  const totals = calculateTotals();

  return (
    <div className="form-restructuration-v2-container">
      <div className="form-header">
        <h2>🔄 {activityName}</h2>
        <button className="close-btn" onClick={onClose} type="button">
          ✕
        </button>
      </div>

      <div className="form-subtitle">
        <span className="status-badge">Analyse des dossiers de restructuration</span>
      </div>

      <form onSubmit={handleSubmit} className="form-restructuration-v2">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Section 1: Informations générales */}
        <div className="form-section">
          <h3>📋 Informations Générales</h3>

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

        {/* Section 2: Ajout de dossier client */}
        <div className="form-section">
          <h3>👤 Ajouter un Dossier Client</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="matricule">Matricule client</label>
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={currentDossier.matricule}
                onChange={handleDossierChange}
                placeholder="Ex: CLT123456"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nomClient">Intitulé client</label>
              <input
                type="text"
                id="nomClient"
                name="nomClient"
                value={currentDossier.nomClient}
                onChange={handleDossierChange}
                placeholder="Ex: ENTREPRISE ABC SARL"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="volumeAnomalie">Volume anomalie (FCFA)</label>
              <input
                type="number"
                id="volumeAnomalie"
                name="volumeAnomalie"
                value={currentDossier.volumeAnomalie}
                onChange={handleDossierChange}
                min="0"
                step="0.01"
                placeholder="Ex: 5000000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="statut">Statut</label>
              <select
                id="statut"
                name="statut"
                value={currentDossier.statut}
                onChange={handleDossierChange}
              >
                {statutOptions.map((statut) => (
                  <option key={statut} value={statut}>
                    {statut}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="commentaire">Commentaire</label>
              <textarea
                id="commentaire"
                name="commentaire"
                value={currentDossier.commentaire}
                onChange={handleDossierChange}
                rows={2}
                placeholder="Ajoutez un commentaire..."
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-add"
            onClick={addDossier}
          >
            ➕ Ajouter ce dossier
          </button>
        </div>

        {/* Section 3: Liste des dossiers */}
        {dossiers.length > 0 && (
          <div className="form-section">
            <h3>📑 Dossiers Ajoutés ({dossiers.length})</h3>

            <div className="dossiers-list">
              {dossiers.map((dossier) => (
                <div key={dossier.id} className="dossier-card">
                  <div className="dossier-header">
                    <div className="dossier-title">
                      <strong>{dossier.nomClient}</strong>
                      <span className="dossier-matricule">({dossier.matricule})</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeDossier(dossier.id)}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="dossier-details">
                    <div className="dossier-detail-item">
                      <span className="label">Volume:</span>
                      <span className="value">
                        {dossier.volumeAnomalie.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    {dossier.commentaire && (
                      <div className="dossier-detail-item full-width">
                        <span className="label">Commentaire:</span>
                        <span className="value">{dossier.commentaire}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Totaux */}
        {dossiers.length > 0 && (
          <div className="form-section totals-section">
            <h3>💰 Totaux</h3>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Nombre de dossiers:</span>
                <span className="total-value">{dossiers.length}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Volume global engagements:</span>
                <span className="total-value">
                  {totals.volumeGlobal.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="total-item">
                <span className="total-label">Volume anomalies:</span>
                <span className="total-value">
                  {totals.volumeAnomalies.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || dossiers.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Enregistrement...
              </>
            ) : (
              <>✓ Enregistrer ({dossiers.length} dossier{dossiers.length > 1 ? 's' : ''})</>
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

      <style>{`
        .form-restructuration-v2-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
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
        }

        .close-btn:hover {
          color: #dc2626;
        }

        .form-subtitle {
          margin-bottom: 2rem;
        }

        .status-badge {
          background-color: #dbeafe;
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .form-restructuration-v2 {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          background: white;
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

        .required {
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

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 0.75rem;
          color: #dc2626;
          font-size: 0.875rem;
        }

        .btn-add {
          background-color: #10b981;
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }

        .btn-add:hover {
          background-color: #059669;
        }

        .dossiers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .dossier-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 1rem;
        }

        .dossier-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
        }

        .dossier-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .dossier-matricule {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .btn-remove {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 1.25rem;
          padding: 0.25rem;
          line-height: 1;
        }

        .btn-remove:hover {
          color: #991b1b;
        }

        .dossier-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .dossier-detail-item {
          display: flex;
          flex-direction: column;
        }

        .dossier-detail-item.full-width {
          grid-column: 1 / -1;
        }

        .dossier-detail-item .label {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .dossier-detail-item .value {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 500;
        }

        .totals-section {
          background-color: #f0fdf4;
          border-color: #86efac;
        }

        .totals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .total-item {
          display: flex;
          flex-direction: column;
          text-align: center;
        }

        .total-label {
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .total-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #059669;
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
          .form-restructuration-v2-container {
            padding: 1rem;
          }

          .form-row,
          .dossier-details,
          .totals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FormDossiersRestructurationV2;
