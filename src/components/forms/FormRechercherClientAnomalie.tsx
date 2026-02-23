import React, { useState, useEffect } from 'react';
import { RechercherClientAnomalieService } from '../../services/RechercherClientAnomalieService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';


interface Props { 
  activityName: string; 
  specificType: string; 
  onClose: () => void; 
  onSave: () => void; 
}

const EMPTY_CLIENT = {
  Matricule: '',
  NomClient: '',
  Agence: '',
  PaysResidence: '',
  Employeur: '',
  MontantGlobalEngagements: 0,
  VolumeAnomalies: 0,
  Statut: '',
  PropositionClient: '',
};

const FormRechercherClientAnomalie: React.FC<Props> = ({ 
  activityName, 
  specificType,
  onClose,
  onSave 
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [client, setClient] = useState({ ...EMPTY_CLIENT });

  const isAyantRepondu = specificType === 'clients-ayant-repondu';
  const typeLabel = isAyantRepondu ? 'Clients ayant répondu' : 'Clients contactés';

  useEffect(() => {
    (async () => {
      setLoadingAgences(true);
      try {
        const result = await AgenceResauService.getAll();
        const data: any[] = result?.data || result?.value || [];
        setAgences(Array.from(new Set(data.map((d: any) => d.Title).filter(Boolean))).sort() as string[]);
      } catch { /* silent */ } finally { setLoadingAgences(false); }
    })();
  }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClient(p => ({ ...p, [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const ref = `RECH-${today.replace(/-/g,'')}-${client.Matricule || Math.random().toString(36).substring(2,6).toUpperCase()}`;
    try {
      await RechercherClientAnomalieService.create({
        Title: activityName,
        NbreClientAnomalie: 1,
        NbreClientRetrouve: 1,
        NbreClientContacte: 1,
        NbreClientAyantRepondu: isAyantRepondu ? 1 : 0,
        NbreClientCooperatif: isAyantRepondu && client.Statut === 'coopératif' ? 1 : 0,
        NbreClientAyantDemandeRestructur: 0,
        MontantGlobalEngagement: client.MontantGlobalEngagements,
        VolumeAnomalie: client.VolumeAnomalies,
        MontantVersement: 0,
        DateVersement: today,
      });
      await DetailsDossiersService.create({
        Title: activityName,
        NomClient: client.NomClient,
        Matricule: client.Matricule,
        MontantSollicite: client.MontantGlobalEngagements,
        Decision: isAyantRepondu ? `ayant-repondu-${client.Statut}` : 'client-contacte',
        ObjetCommentaire: isAyantRepondu ? client.PropositionClient : `Pays:${client.PaysResidence}|Employeur:${client.Employeur}`,
        Commentaire: `Pays:${client.PaysResidence}|Employeur:${client.Employeur}|Agence:${client.Agence}`,
        Reference: ref,
        Date: today,
      });
      showSuccess('Enregistrement réussi', `${typeLabel} — ${client.NomClient} enregistré.`);
      setTimeout(() => onSave(), 1500);
    } catch (err: any) {
      showError('Erreur', err.message || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">{typeLabel}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="Matricule" value={client.Matricule} onChange={change} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
            <div className="form-group"><label>Nom complet du client <span className="required">*</span></label><input type="text" name="NomClient" value={client.NomClient} onChange={change} required /></div>
            <div className="form-group">
              <label>Agence <span className="required">*</span></label>
              {loadingAgences ? <div className="loading">Chargement...</div> : agences.length > 0 ? (
                <select name="Agence" value={client.Agence} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  {agences.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input type="text" name="Agence" value={client.Agence} onChange={change} required />
              )}
            </div>
            <div className="form-group"><label>Pays de résidence <span className="required">*</span></label><input type="text" name="PaysResidence" value={client.PaysResidence} onChange={change} required /></div>
            <div className="form-group"><label>Employeur / Entreprise</label><input type="text" name="Employeur" value={client.Employeur} onChange={change} /></div>
            <div className="form-group"><label>Montant global des engagements (FCFA) <span className="required">*</span></label><input type="number" name="MontantGlobalEngagements" value={client.MontantGlobalEngagements || ''} onChange={change} required /></div>
            <div className="form-group"><label>Volume anomalies — impayé + agios (FCFA) <span className="required">*</span></label><input type="number" name="VolumeAnomalies" value={client.VolumeAnomalies || ''} onChange={change} required /></div>

            {isAyantRepondu && (<>
              <div className="form-group">
                <label>Statut du client <span className="required">*</span></label>
                <select name="Statut" value={client.Statut} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  <option value="coopératif">Coopératif</option>
                  <option value="non coopératif">Non coopératif</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Proposition du client</label>
                <textarea name="PropositionClient" value={client.PropositionClient} onChange={change} rows={3} placeholder="Proposition de régularisation, plan de remboursement..." />
              </div>
            </>)}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
      <NotificationModal isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} onClose={closeNotification} />
    </div>
  );
};

export default FormRechercherClientAnomalie;
