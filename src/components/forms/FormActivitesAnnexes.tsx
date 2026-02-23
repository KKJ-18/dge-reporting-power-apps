import React, { useState, useEffect } from 'react';
import { VisiteClienteleService } from '../../services/VisiteClienteleService';
import { FormationsService } from '../../services/FormationsService';
import { ActivitesTransversalesService } from '../../services/ActivitesTransversalesService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

type ActivityType = 'visites' | 'formations' | 'procedures' | 'etudes' | 'autres-activites';

interface VisiteFormData {
  agence: string;
  client: string;
  dateVisite: string;
  objetVisite: string;
  compteRendu: string;
  montantEngagements: number;
  volumeAnomalies: number;
}

interface AutresActiviteFormData {
  ObjetActivite: string;
  ResultatObtenu: string;
}

interface ActiviteTransversaleFormData {
  titreOuTheme: string;
  dateTransmissionValidation: string;
  dateTransmissionQualite: string;
  datePublication: string;
  dateValidation: string;
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
    montantEngagements: 0,
    volumeAnomalies: 0,
  });

  const [autresData, setAutresData] = useState<AutresActiviteFormData>({
    ObjetActivite: '',
    ResultatObtenu: '',
  });

  const [formationData, setFormationData] = useState({
    libelle: '',
    duree: 0,
    dateValidation: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [activiteData, setActiviteData] = useState<ActiviteTransversaleFormData>({
    titreOuTheme: '',
    dateTransmissionValidation: '',
    dateTransmissionQualite: '',
    datePublication: '',
    dateValidation: '',
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
    setVisiteData((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAutresChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAutresData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormationData((prev) => ({ ...prev, [name]: name === 'duree' ? Number(value) : value }));
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
      if (!formationData.libelle || !formationData.dateValidation || !formationData.date || formationData.duree <= 0) {
        setError('Veuillez remplir tous les champs obligatoires');
        return false;
      }
    } else if (activityType === 'autres-activites') {
      if (!autresData.ObjetActivite) {
        setError('Veuillez indiquer l\'objet de l\'activité');
        return false;
      }
    } else {
      if (!activiteData.titreOuTheme || !activiteData.dateTransmissionValidation) {
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
          MontantEngagements: visiteData.montantEngagements,
          VolumeAnomalies: visiteData.volumeAnomalies,
        };
        result = await VisiteClienteleService.create(dataToSave);
        activityDescription = `${visiteData.client} (${visiteData.agence})`;
      } else if (activityType === 'formations') {
        const dataToSave = {
          Title: activityName,
          Libelle: formationData.libelle,
          Duree: formationData.duree,
          DateValidation: formationData.dateValidation,
          Date: formationData.date,
        };
        result = await FormationsService.create(dataToSave);
        activityDescription = `Formation: ${formationData.libelle} (${formationData.duree}h)`;
      } else if (activityType === 'autres-activites') {
        const dataToSave = {
          Title: activityName,
          TitreOuTheme: autresData.ObjetActivite,
          DateValidation: new Date().toISOString().split('T')[0],
          DateTransmissionQualite: '',
          Resultat: autresData.ResultatObtenu,
        };
        result = await ActivitesTransversalesService.create(dataToSave);
        activityDescription = autresData.ObjetActivite;
      } else {
        const dataToSave = {
          Title: activityName,
          TitreOuTheme: activiteData.titreOuTheme,
          DateValidation: activiteData.dateTransmissionValidation,
          DateTransmissionQualite: activityType === 'procedures' ? activiteData.dateTransmissionQualite : activiteData.dateValidation,
          Resultat: activityType === 'procedures' ? (activiteData.datePublication ? `Publication:${activiteData.datePublication}` : '') : '',
        };
        result = await ActivitesTransversalesService.create(dataToSave);
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
    <div className="form-container">
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">Activités annexes</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', marginBottom: '1rem', color: '#c00' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Formulaire pour Visites Clientèle */}
        {activityType === 'visites' && (
          <div className="form-section">
            <h3 className="section-title">🤝 Visite Clientèle</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div className="form-group">
                <label htmlFor="montantEngagements">Montant global des engagements (FCFA) <span className="required">*</span></label>
                <input type="number" id="montantEngagements" name="montantEngagements" value={visiteData.montantEngagements || ''} onChange={handleVisiteChange} required placeholder="0" />
              </div>

              <div className="form-group">
                <label htmlFor="volumeAnomalies">Volume anomalies — impayé + agios (FCFA) <span className="required">*</span></label>
                <input type="number" id="volumeAnomalies" name="volumeAnomalies" value={visiteData.volumeAnomalies || ''} onChange={handleVisiteChange} required placeholder="0" />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
            <div className="form-group" style={{ marginTop: '1rem' }}>
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
        )}

        {/* Formulaire pour Autres Activités */}
        {activityType === 'autres-activites' && (
          <div className="form-section">
            <h3 className="section-title">📌 Autre activité</h3>
            <div className="form-group">
              <label htmlFor="ObjetActivite">Objet de l'activité <span className="required">*</span></label>
              <input type="text" id="ObjetActivite" name="ObjetActivite" value={autresData.ObjetActivite} onChange={handleAutresChange} required placeholder="Décrivez l'activité..." />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label htmlFor="ResultatObtenu">Résultat obtenu</label>
              <textarea id="ResultatObtenu" name="ResultatObtenu" value={autresData.ResultatObtenu} onChange={handleAutresChange} rows={4} placeholder="Résultat ou remarques..." />
            </div>
          </div>
        )}

        {/* Formulaire pour Formations */}
        {activityType === 'formations' && (
          <div className="form-section">
            <h3 className="section-title">🎓 Formation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label htmlFor="date">Date <span className="required">*</span></label><input type="date" id="date" name="date" value={formationData.date} onChange={handleFormationChange} required /></div>
              <div className="form-group"><label htmlFor="duree">Durée (heures) <span className="required">*</span></label><input type="number" id="duree" name="duree" value={formationData.duree} onChange={handleFormationChange} min="0" step="0.5" placeholder="0" required /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label htmlFor="libelle">Libellé de la formation <span className="required">*</span></label><input type="text" id="libelle" name="libelle" value={formationData.libelle} onChange={handleFormationChange} required /></div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}><label htmlFor="dateValidation">Date de validation <span className="required">*</span></label><input type="date" id="dateValidation" name="dateValidation" value={formationData.dateValidation} onChange={handleFormationChange} required /></div>
            </div>
          </div>
        )}

        {/* Formulaire pour Procédures */}
        {activityType === 'procedures' && (
          <div className="form-section">
            <h3 className="section-title">📋 Rédaction / Mise à jour de procédure</h3>
            <div className="form-group">
              <label htmlFor="titreOuTheme">
                Titre de la procédure <span className="required">*</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="dateTransmissionValidation">
                  Date de transmission pour validation <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateTransmissionValidation"
                  name="dateTransmissionValidation"
                  value={activiteData.dateTransmissionValidation}
                  onChange={handleActiviteChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateTransmissionQualite">
                  Date de transmission au Dpt QUALITÉ
                </label>
                <input
                  type="date"
                  id="dateTransmissionQualite"
                  name="dateTransmissionQualite"
                  value={activiteData.dateTransmissionQualite}
                  onChange={handleActiviteChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="datePublication">
                  Date de publication
                </label>
                <input
                  type="date"
                  id="datePublication"
                  name="datePublication"
                  value={activiteData.datePublication}
                  onChange={handleActiviteChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Formulaire pour Études */}
        {activityType === 'etudes' && (
          <div className="form-section">
            <h3 className="section-title">📊 Étude réalisée</h3>
            <div className="form-group">
              <label htmlFor="titreOuTheme">
                Thème de l'étude <span className="required">*</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="dateTransmissionValidation">
                  Date de transmission pour validation <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateTransmissionValidation"
                  name="dateTransmissionValidation"
                  value={activiteData.dateTransmissionValidation}
                  onChange={handleActiviteChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateValidation">
                  Date de validation
                </label>
                <input
                  type="date"
                  id="dateValidation"
                  name="dateValidation"
                  value={activiteData.dateValidation}
                  onChange={handleActiviteChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormActivitesAnnexes;
