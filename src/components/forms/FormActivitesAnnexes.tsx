import React, { useState, useEffect } from 'react';
import { VisiteClienteleService } from '../../services/VisiteClienteleService';
import { FormationsService } from '../../services/FormationsService';
import { ActivitesTransversalesService } from '../../services/ActivitesTransversalesService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';

type ActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';

interface VisiteFormData {
  agence: string;
  client: string;
  dateVisite: string;
  objetVisite: string;
  compteRendu: string;
}

interface FormationFormData {
  libelle: string;
  duree: number;
  dateValidation: string;
}

interface ActiviteTransversaleFormData {
  titreOuTheme: string;
  dateValidation: string;
  dateTransmissionQualite: string;
  resultat: string;
}

interface FormActivitesAnnexesProps {
  activityName: string;
  activityType: ActivityType;
  onSave: () => void;
  onCancel: () => void;
}

const FormActivitesAnnexes: React.FC<FormActivitesAnnexesProps> = ({
  activityName,
  activityType,
  onSave,
  onCancel,
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agences, setAgences] = useState<string[]>([]);

  const [visiteData, setVisiteData] = useState<VisiteFormData>({
    agence: '',
    client: '',
    dateVisite: '',
    objetVisite: '',
    compteRendu: '',
  });

  const [formationData, setFormationData] = useState<FormationFormData>({
    libelle: '',
    duree: 0,
    dateValidation: '',
  });

  const [activiteData, setActiviteData] = useState<ActiviteTransversaleFormData>({
    titreOuTheme: '',
    dateValidation: '',
    dateTransmissionQualite: '',
    resultat: '',
  });

  useEffect(() => {
    if (activityType === 'visites') {
      loadAgences();
    }
  }, [activityType]);

  const loadAgences = async () => {
    setLoadingAgences(true);
    try {
      console.log('� Chargement des agences...');
      
      // Utiliser la même logique que AdminEngagementsForm
      const result = await AgenceResauService.getAll();
      const data = result?.data || result?.value || [];
      
      console.log(`✅ ${data.length} agences/réseaux chargés`, data);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune agence trouvée');
        setAgences([]);
        return;
      }
      
      // Extraire les agences uniques (colonne Title)
      const uniqueAgences = Array.from(
        new Set(data.map((item: any) => item.Title).filter(Boolean))
      ).sort() as string[];
      
      console.log('🏢 Agences uniques:', uniqueAgences);
      setAgences(uniqueAgences);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des agences:', err);
      setError('Impossible de charger les agences. Vous pouvez saisir manuellement le nom de l\'agence.');
      // Fallback: permettre la saisie manuelle
      setAgences([]);
    } finally {
      setLoadingAgences(false);
    }
  };

  const handleVisiteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVisiteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormationData((prev) => ({
      ...prev,
      [name]: name === 'duree' ? Number(value) : value,
    }));
  };

  const handleActiviteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setActiviteData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (activityType === 'visites') {
      if (!visiteData.agence || !visiteData.client || !visiteData.dateVisite) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
    } else if (activityType === 'formations') {
      if (!formationData.libelle || !formationData.dateValidation || formationData.duree <= 0) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
    } else {
      if (!activiteData.titreOuTheme || !activiteData.dateValidation) {
        setError('Veuillez remplir tous les champs obligatoires');
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
      let result;
      let activityDescription = '';
      
      if (activityType === 'visites') {
        const dataToSave = {
          Title: activityName,
          Agence: visiteData.agence,
          NomClient: visiteData.client,
          DateVisite: visiteData.dateVisite,
          ObjetVisite: visiteData.objetVisite,
          CompteRendu: visiteData.compteRendu,
        };
        console.log('💾 Sauvegarde visite:', dataToSave);
        result = await VisiteClienteleService.create(dataToSave);
        console.log('✅ Résultat:', result);
        activityDescription = `Visite clientèle chez ${visiteData.client} (${visiteData.agence})`;
      } else if (activityType === 'formations') {
        const dataToSave = {
          Title: activityName,
          Libelle: formationData.libelle,
          Duree: formationData.duree,
          DateValidation: formationData.dateValidation,
        };
        console.log('💾 Sauvegarde formation:', dataToSave);
        result = await FormationsService.create(dataToSave);
        console.log('✅ Résultat:', result);
        activityDescription = `Formation: ${formationData.libelle} (${formationData.duree}h)`;
      } else {
        const dataToSave = {
          Title: activityName,
          TitreOuTheme: activiteData.titreOuTheme,
          DateValidation: activiteData.dateValidation,
          DateTransmissionQualite: activiteData.dateTransmissionQualite,
          Resultat: activiteData.resultat,
        };
        console.log('💾 Sauvegarde activité transversale:', dataToSave);
        result = await ActivitesTransversalesService.create(dataToSave);
        console.log('✅ Résultat:', result);
        activityDescription = `${activiteData.titreOuTheme}`;
      }

      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }
      
      showSuccess(
        'Enregistrement réussi',
        `Activité "${activityName}" enregistrée avec succès.\n${activityDescription}`
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
    <div className="activites-annexes-form-container">
      <div className="form-header">
        <h2>{activityName}</h2>
        <button className="close-btn" onClick={onCancel} type="button">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="activites-annexes-form">
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Formulaire pour Visites Clientèle */}
        {activityType === 'visites' && (
          <div className="form-section">
            <h3>🤝 Visite Clientèle</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="agence">
                  Agence <span className="required">*</span>
                </label>
                <select
                  id="agence"
                  name="agence"
                  value={visiteData.agence}
                  onChange={handleVisiteChange}
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

              <div className="form-group">
                <label htmlFor="client">
                  Nom du client <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={visiteData.client}
                  onChange={handleVisiteChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateVisite">
                  Date de visite <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateVisite"
                  name="dateVisite"
                  value={visiteData.dateVisite}
                  onChange={handleVisiteChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="objetVisite">Objet de la visite</label>
                <input
                  type="text"
                  id="objetVisite"
                  name="objetVisite"
                  value={visiteData.objetVisite}
                  onChange={handleVisiteChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="compteRendu">Compte rendu</label>
                <textarea
                  id="compteRendu"
                  name="compteRendu"
                  value={visiteData.compteRendu}
                  onChange={handleVisiteChange}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Formulaire pour Formations */}
        {activityType === 'formations' && (
          <div className="form-section">
            <h3>🎓 Formation</h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="libelle">
                  Libellé de la formation <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="libelle"
                  name="libelle"
                  value={formationData.libelle}
                  onChange={handleFormationChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duree">
                  Durée (en heures) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="duree"
                  name="duree"
                  value={formationData.duree}
                  onChange={handleFormationChange}
                  min="0"
                  step="0.5"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateValidation">
                  Date de validation <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateValidation"
                  name="dateValidation"
                  value={formationData.dateValidation}
                  onChange={handleFormationChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Formulaire pour Activités Transversales (Procédures/Études) */}
        {(activityType === 'procedures' || activityType === 'etudes') && (
          <div className="form-section">
            <h3>
              {activityType === 'procedures' ? '📋 Actualisation de Procédure' : '📊 Étude'}
            </h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="titreOuTheme">
                  {activityType === 'procedures' ? 'Titre de la procédure' : 'Thème de l\'étude'}{' '}
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="titreOuTheme"
                  name="titreOuTheme"
                  value={activiteData.titreOuTheme}
                  onChange={handleActiviteChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateValidation">
                  Date de validation <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateValidation"
                  name="dateValidation"
                  value={activiteData.dateValidation}
                  onChange={handleActiviteChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateTransmissionQualite">
                  Date de transmission qualité
                </label>
                <input
                  type="date"
                  id="dateTransmissionQualite"
                  name="dateTransmissionQualite"
                  value={activiteData.dateTransmissionQualite}
                  onChange={handleActiviteChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="resultat">Résultat / Commentaire</label>
                <textarea
                  id="resultat"
                  name="resultat"
                  value={activiteData.resultat}
                  onChange={handleActiviteChange}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

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

export default FormActivitesAnnexes;
