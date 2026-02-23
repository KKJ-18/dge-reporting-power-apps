import React, { useState } from 'react';
import { ActivitesTransversalesService } from '../../services/ActivitesTransversalesService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 5 DSE — Déclaration Réglementaire
 * 4 sous-types: TEG, FIBANE, Douane, CRE
 * 
 * Variables résultats:
 * - TEG: Plateforme CNEF (mensuel)
 * - FIBANE 1/2/3: Plateforme CNEF (mensuel)
 * - Douane: Cautions Douane échues non apurées (mensuel)
 * - CRE: Thème, date de transmission pour validation (mensuel)
 * 
 * Fréquence: Mensuelle
 */

type DeclarationSpecificType =
  | 'teg'
  | 'fibane'
  | 'douane'
  | 'cre';

interface FormDeclarationReglementaireProps {
  activityName: string;
  specificType: DeclarationSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormDeclarationReglementaire: React.FC<FormDeclarationReglementaireProps> = ({
  activityName, specificType, onClose, onSave
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  // TEG & FIBANE
  const [cnefData, setCnefData] = useState({
    plateforme: 'CNEF',
    statut: '' as '' | 'transmis' | 'en_cours' | 'valide',
    dateTransmission: new Date().toISOString().split('T')[0],
    observation: '',
  });

  // Douane
  const [douaneData, setDouaneData] = useState({
    nombreCautions: 0,
    montantCautions: 0,
    dateEcheance: new Date().toISOString().split('T')[0],
    observation: '',
  });

  // CRE
  const [creData, setCreData] = useState({
    theme: '',
    dateTransmission: new Date().toISOString().split('T')[0],
    dateValidation: '',
    observation: '',
  });

  const getSubtypeLabel = () => {
    switch (specificType) {
      case 'teg': return 'TEG — Plateforme CNEF';
      case 'fibane': return 'FIBANE 1/2/3 — Plateforme CNEF';
      case 'douane': return 'Douane — Cautions échues non apurées';
      case 'cre': return 'CRE — Thème & transmission';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let saveData: any = { Title: activityName };

      if (specificType === 'teg' || specificType === 'fibane') {
        saveData.TitreOuTheme = specificType === 'teg' ? 'TEG' : 'FIBANE 1/2/3';
        saveData.Resultat = `Plateforme CNEF — Statut: ${cnefData.statut || 'non renseigné'}`;
        saveData.DateValidation = cnefData.dateTransmission;
        saveData.Date = cnefData.dateTransmission;
      } else if (specificType === 'douane') {
        saveData.TitreOuTheme = 'Cautions Douane échues non apurées';
        saveData.Resultat = `${douaneData.nombreCautions} cautions — ${douaneData.montantCautions.toLocaleString('fr-FR')} FCFA`;
        saveData.DateValidation = douaneData.dateEcheance;
        saveData.Date = douaneData.dateEcheance;
      } else if (specificType === 'cre') {
        if (!creData.theme) {
          showError('Erreur', 'Veuillez renseigner le thème');
          setLoading(false);
          return;
        }
        saveData.TitreOuTheme = creData.theme;
        saveData.DateValidation = creData.dateValidation || undefined;
        saveData.DateTransmissionQualite = creData.dateTransmission;
        saveData.Date = creData.dateTransmission;
      }

      await ActivitesTransversalesService.create(saveData);

      showSuccess('Succès', 'Déclaration réglementaire enregistrée avec succès');
      setTimeout(() => { onSave(); }, 1500);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showError('Erreur', 'Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  const renderTEGFibane = () => (
    <div className="form-section">
      <h3 className="section-title">🏛️ Plateforme CNEF</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Statut <span className="required">*</span></label>
          <select value={cnefData.statut} onChange={e => setCnefData(prev => ({ ...prev, statut: e.target.value as any }))} required>
            <option value="">Sélectionner le statut</option>
            <option value="transmis">Transmis</option>
            <option value="en_cours">En cours</option>
            <option value="valide">Validé</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date de transmission <span className="required">*</span></label>
          <input type="date" value={cnefData.dateTransmission} onChange={e => setCnefData(prev => ({ ...prev, dateTransmission: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Observation</label>
        <textarea value={cnefData.observation} onChange={e => setCnefData(prev => ({ ...prev, observation: e.target.value }))} placeholder="Observations" rows={3} />
      </div>
    </div>
  );

  const renderDouane = () => (
    <div className="form-section">
      <h3 className="section-title">🛃 Cautions Douane</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label>Nombre de cautions échues <span className="required">*</span></label>
          <input type="number" value={douaneData.nombreCautions || ''} onChange={e => setDouaneData(prev => ({ ...prev, nombreCautions: parseInt(e.target.value) || 0 }))} placeholder="0" min="0" required />
        </div>
        <div className="form-group">
          <label>Montant total (FCFA) <span className="required">*</span></label>
          <input type="number" value={douaneData.montantCautions || ''} onChange={e => setDouaneData(prev => ({ ...prev, montantCautions: parseFloat(e.target.value) || 0 }))} placeholder="0" min="0" required />
        </div>
        <div className="form-group">
          <label>Date d'échéance <span className="required">*</span></label>
          <input type="date" value={douaneData.dateEcheance} onChange={e => setDouaneData(prev => ({ ...prev, dateEcheance: e.target.value }))} required />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Observation</label>
        <textarea value={douaneData.observation} onChange={e => setDouaneData(prev => ({ ...prev, observation: e.target.value }))} placeholder="Observations" rows={3} />
      </div>
    </div>
  );

  const renderCRE = () => (
    <div className="form-section">
      <h3 className="section-title">📄 CRE</h3>
      <div className="form-group">
        <label>Thème <span className="required">*</span></label>
        <input type="text" value={creData.theme} onChange={e => setCreData(prev => ({ ...prev, theme: e.target.value }))} placeholder="Thème de la déclaration" required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="form-group">
          <label>Date de transmission pour validation <span className="required">*</span></label>
          <input type="date" value={creData.dateTransmission} onChange={e => setCreData(prev => ({ ...prev, dateTransmission: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label>Date de validation</label>
          <input type="date" value={creData.dateValidation} onChange={e => setCreData(prev => ({ ...prev, dateValidation: e.target.value }))} />
        </div>
      </div>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>Observation</label>
        <textarea value={creData.observation} onChange={e => setCreData(prev => ({ ...prev, observation: e.target.value }))} placeholder="Observations" rows={3} />
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
        {(specificType === 'teg' || specificType === 'fibane') && renderTEGFibane()}
        {specificType === 'douane' && renderDouane()}
        {specificType === 'cre' && renderCRE()}

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

export default FormDeclarationReglementaire;
