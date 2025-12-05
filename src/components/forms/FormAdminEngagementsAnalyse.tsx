import React, { useState, useEffect } from 'react';
import { AnalyseEngagementsService } from '../../services/AnalyseEngagementsService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

interface FormData {
  reseau: string;
  agence: string;
  segment: string;
  montant: number;
}

interface FormAdminEngagementsAnalyseProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

const FormAdminEngagementsAnalyse: React.FC<FormAdminEngagementsAnalyseProps> = ({
  activityName,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [agences, setAgences] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    reseau: '',
    agence: '',
    segment: '',
    montant: 0,
  });

  const segmentOptions = ['Particulier', 'Entreprise'];

  useEffect(() => {
    loadAgencesEtReseaux();
  }, []);

  const loadAgencesEtReseaux = async () => {
    setLoadingAgences(true);
    try {
      const result = await AgenceResauService.getAll();
      const data = result?.data || result?.value || [];

      // Extraire les réseaux uniques
      const reseauxUniques = [...new Set(data.map((item: any) => item.NomResau).filter(Boolean))] as string[];
      setReseaux(reseauxUniques);

      // Extraire les agences uniques
      const agencesUniques = [...new Set(data.map((item: any) => item.Title).filter(Boolean))] as string[];
      setAgences(agencesUniques);

      console.log('📍 Réseaux chargés:', reseauxUniques);
      console.log('🏢 Agences chargées:', agencesUniques);
    } catch (err) {
      console.error('❌ Erreur chargement agences:', err);
      setError('Impossible de charger les agences et réseaux');
      // Valeurs par défaut
      setReseaux(['National', 'International']);
    } finally {
      setLoadingAgences(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'montant' ? Number(value) : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.reseau) {
      setError('Le réseau est obligatoire');
      return false;
    }

    if (!formData.agence) {
      setError('L\'agence est obligatoire');
      return false;
    }

    if (!formData.segment) {
      setError('Le segment est obligatoire');
      return false;
    }

    if (formData.montant <= 0) {
      setError('Le montant doit être supérieur à 0');
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
        Reseau: formData.reseau,
        Agence: formData.agence,
        Segment: formData.segment,
        Montant: formData.montant,
      };

      console.log('💾 Sauvegarde engagement:', dataToSave);
      const result = await AnalyseEngagementsService.create(dataToSave);
      console.log('✅ Résultat:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }
      
      showSuccess(
        'Enregistrement réussi',
        `Engagement enregistré avec succès pour "${activityName}".\nRéseau: ${formData.reseau}, Agence: ${formData.agence}\nMontant: ${formData.montant.toLocaleString()} FCFA.`
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
    <div className="admin-engagements-analyse-form-container">
      <div className="form-header">
        <h2>{activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-engagements-analyse-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <div className="form-section">
          <h3>🏦 Informations de l'Engagement</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reseau">
                Réseau <span className="required">*</span>
              </label>
              <select
                id="reseau"
                name="reseau"
                value={formData.reseau}
                onChange={handleInputChange}
                disabled={loadingAgences}
                required
              >
                <option value="">
                  {loadingAgences ? '⏳ Chargement...' : '-- Sélectionner un réseau --'}
                </option>
                {reseaux.map((reseau) => (
                  <option key={reseau} value={reseau}>
                    {reseau}
                  </option>
                ))}
              </select>
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
                disabled={loadingAgences}
                required
              >
                <option value="">
                  {loadingAgences ? '⏳ Chargement...' : '-- Sélectionner une agence --'}
                </option>
                {agences.map((agence) => (
                  <option key={agence} value={agence}>
                    {agence}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="segment">
                Segment <span className="required">*</span>
              </label>
              <select
                id="segment"
                name="segment"
                value={formData.segment}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Sélectionner un segment --</option>
                {segmentOptions.map((segment) => (
                  <option key={segment} value={segment}>
                    {segment}
                  </option>
                ))}
              </select>
              <small>Particulier ou Entreprise</small>
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

        <div className="info-box">
          <h4>ℹ️ À propos de cet engagement</h4>
          <p>
            <strong>Activité :</strong> {activityName}
          </p>
          <p>
            Cet enregistrement sera associé au mois en cours (
            {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}).
          </p>
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

export default FormAdminEngagementsAnalyse;
