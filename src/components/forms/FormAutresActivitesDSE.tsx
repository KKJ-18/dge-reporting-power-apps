import React, { useState } from 'react';
import { ActivitesTransversalesService } from '../../services/ActivitesTransversalesService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 6 DSE — Autres Activités
 * 7 sous-types:
 * - Visite unité pour la collecte documentaire (hebdomadaire)
 * - Études (semestriel)
 * - Autres: validation des dossiers de crédit → Nombre de dossier validé, montant (journalière)
 * - Formation (hebdomadaire)
 * - Gestion des relations entités ext./int. → CNEF collecte TEG → Nombre de dossier (hebdomadaire)
 * - Projets avec la DRI et DSI (hebdomadaire)
 * - Rédaction des procédures (semestriel)
 */

type AutresActivitesSpecificType =
  | 'visite-unite'
  | 'etudes-dse'
  | 'validation-dossiers'
  | 'formation-dse'
  | 'gestion-relations'
  | 'projets-dri-dsi'
  | 'redaction-procedures';

interface FormAutresActivitesDSEProps {
  activityName: string;
  specificType: AutresActivitesSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormAutresActivitesDSE: React.FC<FormAutresActivitesDSEProps> = ({
  activityName, specificType, onClose, onSave
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  // Pour 'validation-dossiers' et 'gestion-relations' (avec nombre/montant)
  const [quantData, setQuantData] = useState({
    nombreDossiers: 0,
    montant: 0,
    observation: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Pour les activités simples (visite, formation, projets DRI/DSI)
  const [simpleData, setSimpleData] = useState({
    theme: '',
    resultat: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Pour études et procédures
  const [docData, setDocData] = useState({
    titre: '',
    dateTransmission: new Date().toISOString().split('T')[0],
    dateValidation: '',
    observation: '',
  });

  const getSubtypeLabel = () => {
    switch (specificType) {
      case 'visite-unite': return 'Visite unité pour la collecte documentaire';
      case 'etudes-dse': return 'Études';
      case 'validation-dossiers': return 'Validation des dossiers de crédit';
      case 'formation-dse': return 'Formation';
      case 'gestion-relations': return 'Gestion des relations — Collecte TEG (CNEF)';
      case 'projets-dri-dsi': return 'Projets avec la DRI et DSI';
      case 'redaction-procedures': return 'Rédaction des procédures';
    }
  };

  const isQuantitative = specificType === 'validation-dossiers' || specificType === 'gestion-relations';
  const isDocument = specificType === 'etudes-dse' || specificType === 'redaction-procedures';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isQuantitative) {
        // Sauvegarder avec nombre et montant dans DetailsDossiers
        const reference = `DSE-AA-${specificType.toUpperCase()}-${Date.now()}`;
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: getSubtypeLabel(),
          Matricule: '',
          MontantSollicite: quantData.montant,
          ObjetCommentaire: specificType === 'validation-dossiers' 
            ? `${quantData.nombreDossiers} dossiers validés` 
            : `${quantData.nombreDossiers} dossiers — Collecte TEG`,
          Commentaire: quantData.observation,
          Reference: reference,
          Date: quantData.date,
        });
      } else if (isDocument) {
        if (!docData.titre) {
          showError('Erreur', 'Veuillez renseigner le titre');
          setLoading(false);
          return;
        }
        // Sauvegarder dans ActivitesTransversales
        await ActivitesTransversalesService.create({
          Title: activityName,
          TitreOuTheme: docData.titre,
          DateValidation: docData.dateValidation || undefined,
          DateTransmissionQualite: docData.dateTransmission,
          Date: docData.dateTransmission,
        });
      } else {
        // Activités simples: visite, formation, projets DRI/DSI
        await ActivitesTransversalesService.create({
          Title: activityName,
          TitreOuTheme: simpleData.theme || getSubtypeLabel(),
          Resultat: simpleData.resultat,
          Date: simpleData.date,
        });
      }

      showSuccess('Succès', 'Activité enregistrée avec succès');
      setTimeout(() => { onSave(); }, 1500);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showError('Erreur', 'Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  const renderQuantitativeForm = () => (
    <div className="form-section">
      <h3 className="section-title">📊 Données quantitatives</h3>
      <div style={{ display: 'grid', gridTemplateColumns: specificType === 'validation-dossiers' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Nombre de dossiers <span className="required">*</span></label>
          <input type="number" value={quantData.nombreDossiers || ''} onChange={e => setQuantData(prev => ({ ...prev, nombreDossiers: parseInt(e.target.value) || 0 }))} placeholder="0" min="0" required />
        </div>
        {specificType === 'validation-dossiers' && (
          <div className="form-group">
            <label>Montant (FCFA)</label>
            <input type="number" value={quantData.montant || ''} onChange={e => setQuantData(prev => ({ ...prev, montant: parseFloat(e.target.value) || 0 }))} placeholder="0" min="0" />
          </div>
        )}
        <div className="form-group">
          <label>Date <span className="required">*</span></label>
          <input type="date" value={quantData.date} onChange={e => setQuantData(prev => ({ ...prev, date: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Observation</label>
        <textarea value={quantData.observation} onChange={e => setQuantData(prev => ({ ...prev, observation: e.target.value }))} placeholder="Observations" rows={3} />
      </div>
    </div>
  );

  const renderDocumentForm = () => (
    <div className="form-section">
      <h3 className="section-title">📄 {specificType === 'etudes-dse' ? 'Étude' : 'Procédure'}</h3>
      <div className="form-group">
        <label>Titre <span className="required">*</span></label>
        <input type="text" value={docData.titre} onChange={e => setDocData(prev => ({ ...prev, titre: e.target.value }))} placeholder={specificType === 'etudes-dse' ? 'Titre de l\'étude' : 'Titre de la procédure'} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="form-group">
          <label>Date de transmission <span className="required">*</span></label>
          <input type="date" value={docData.dateTransmission} onChange={e => setDocData(prev => ({ ...prev, dateTransmission: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Date de validation</label>
          <input type="date" value={docData.dateValidation} onChange={e => setDocData(prev => ({ ...prev, dateValidation: e.target.value }))} />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Observation</label>
        <textarea value={docData.observation} onChange={e => setDocData(prev => ({ ...prev, observation: e.target.value }))} placeholder="Observations" rows={3} />
      </div>
    </div>
  );

  const renderSimpleForm = () => (
    <div className="form-section">
      <h3 className="section-title">📝 Informations</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Thème / Sujet</label>
          <input type="text" value={simpleData.theme} onChange={e => setSimpleData(prev => ({ ...prev, theme: e.target.value }))} placeholder="Thème ou sujet" />
        </div>
        <div className="form-group">
          <label>Date <span className="required">*</span></label>
          <input type="date" value={simpleData.date} onChange={e => setSimpleData(prev => ({ ...prev, date: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Résultat / Compte rendu</label>
        <textarea value={simpleData.resultat} onChange={e => setSimpleData(prev => ({ ...prev, resultat: e.target.value }))} placeholder="Résultat obtenu ou compte rendu" rows={4} />
      </div>
    </div>
  );

  return (
    <div className="form-container">
      <NotificationModal isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} onClose={closeNotification} />
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">{getSubtypeLabel()}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        {isQuantitative && renderQuantitativeForm()}
        {isDocument && renderDocumentForm()}
        {!isQuantitative && !isDocument && renderSimpleForm()}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormAutresActivitesDSE;
