import React, { useState, useEffect } from 'react';
import { SuiviAnomaliesService } from '../../services/SuiviAnomaliesService';
import { ActivitesTransversalesService } from '../../services/ActivitesTransversalesService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

type AnomaliesSpecificType = 'anomalies-leasing' | 'parc-auto' | 'tracking' | 'anomalies-proximite';

interface FormSuiviAnomaliesProps {
  activityName: string;
  specificType: AnomaliesSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviAnomalies: React.FC<FormSuiviAnomaliesProps> = ({activityName, specificType, onClose, onSave}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);

  // anomalies-leasing (per-client nominative)
  const [leasingData, setLeasingData] = useState({ matricule: '', nomClient: '', agence: '', reseau: '', volumeEngagements: 0, volumeAnomalies: 0, origineAnomalie: '' });
  // parc-auto
  const [parcData, setParcData] = useState({ numeroChassis: '', typeVehicule: '', nomClient: '', agence: '', reseau: '', matricule: '', valeurMateriel: 0 });
  // tracking
  const [trackingData, setTrackingData] = useState({ nomClient: '', agence: '', reseau: '', matricule: '', entrepriseTracking: '', etatTracking: '' });
  // anomalies-proximite
  const [proxData, setProxData] = useState({ matricule: '', nomClient: '', agence: '', reseau: '', volumeEngagements: 0, volumeAnomalies: 0, origineAnomalie: '' });

  useEffect(() => {
    (async () => {
      setLoadingAgences(true);
      try {
        const result = await AgenceResauService.getAll();
        const data: any[] = result?.data || result?.value || [];
        setAgences(Array.from(new Set(data.map((d: any) => d.Title).filter(Boolean))).sort() as string[]);
        setReseaux(Array.from(new Set(data.map((d: any) => d.NomResau).filter(Boolean))).sort() as string[]);
      } catch { /* silent */ } finally { setLoadingAgences(false); }
    })();
  }, []);

  const change = (setter: React.Dispatch<React.SetStateAction<any>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setter((p: any) => ({ ...p, [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value }));
    };

  const generateRef = () => `ANOM-${new Date().toISOString().split('T')[0].replace(/-/g,'')}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;

  const SelectField = ({ label, name, value, onChange, list, req = false }: any) => (
    <div className="form-group">
      <label>{label}{req && <span className="required"> *</span>}</label>
      {loadingAgences ? <div className="loading">Chargement...</div> : list.length > 0 ? (
        <select name={name} value={value} onChange={onChange} required={req}>
          <option value="">-- Sélectionner --</option>
          {list.map((v: string) => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : (
        <input type="text" name={name} value={value} onChange={onChange} placeholder={label} required={req} />
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ref = generateRef();
    const today = new Date().toISOString().split('T')[0];
    try {
      if (specificType === 'anomalies-leasing') {
        await SuiviAnomaliesService.create({ Title: activityName, NombreClient: 1, VolumeGlobalEngagement: leasingData.volumeEngagements, VolumeAnomalie: leasingData.volumeAnomalies, Agence: leasingData.agence, OrigineAnomalie: leasingData.origineAnomalie });
        await DetailsDossiersService.create({ Title: activityName, NomClient: leasingData.nomClient, Matricule: leasingData.matricule, MontantSollicite: leasingData.volumeEngagements, Decision: 'anomalie-leasing', ObjetCommentaire: leasingData.origineAnomalie, Commentaire: `VolumeAnomalies:${leasingData.volumeAnomalies}|Réseau:${leasingData.reseau}`, Reference: ref, Date: today });
      } else if (specificType === 'parc-auto') {
        await ActivitesTransversalesService.create({ Title: activityName, TitreOuTheme: `Parc auto|${parcData.nomClient}|Chassis:${parcData.numeroChassis}|${parcData.typeVehicule}`, Resultat: `Agence:${parcData.agence}|Réseau:${parcData.reseau}|Valeur:${parcData.valeurMateriel}`, DateValidation: today });
        if (parcData.matricule) await DetailsDossiersService.create({ Title: activityName, NomClient: parcData.nomClient, Matricule: parcData.matricule, MontantSollicite: parcData.valeurMateriel, Decision: 'suivi-parc-auto', ObjetCommentaire: `Chassis:${parcData.numeroChassis}|Type:${parcData.typeVehicule}`, Commentaire: `Agence:${parcData.agence}|Réseau:${parcData.reseau}`, Reference: ref, Date: today });
      } else if (specificType === 'tracking') {
        await ActivitesTransversalesService.create({ Title: activityName, TitreOuTheme: `Tracking|${trackingData.nomClient}|${trackingData.entrepriseTracking}`, Resultat: `État:${trackingData.etatTracking}|Agence:${trackingData.agence}|Réseau:${trackingData.reseau}`, DateValidation: today });
        if (trackingData.matricule) await DetailsDossiersService.create({ Title: activityName, NomClient: trackingData.nomClient, Matricule: trackingData.matricule, Decision: 'tracking', ObjetCommentaire: `Entreprise:${trackingData.entrepriseTracking}|État:${trackingData.etatTracking}`, Commentaire: `${trackingData.agence}|${trackingData.reseau}`, Reference: ref, Date: today });
      } else if (specificType === 'anomalies-proximite') {
        await SuiviAnomaliesService.create({ Title: activityName, NombreClient: 1, VolumeAnomalie: proxData.volumeAnomalies, Agence: proxData.agence, OrigineAnomalie: proxData.origineAnomalie });
        await DetailsDossiersService.create({ Title: activityName, NomClient: proxData.nomClient, Matricule: proxData.matricule, MontantSollicite: proxData.volumeEngagements, Decision: 'anomalie-proximite', ObjetCommentaire: proxData.origineAnomalie, Commentaire: `Volume anomalies:${proxData.volumeAnomalies}|Réseau:${proxData.reseau}`, Reference: ref, Date: today });
      }
      showSuccess('Enregistrement réussi', 'Données synchronisées avec SharePoint.');
      setTimeout(() => onSave(), 1500);
    } catch (err: any) {
      showError('Erreur', err.message || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  const typeLabels: Record<AnomaliesSpecificType, string> = {
    'anomalies-leasing': 'Anomalies leasing',
    'parc-auto': 'Suivi du parc automobile',
    'tracking': 'Tracking',
    'anomalies-proximite': 'Origine anomalies (proximité)',
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">{typeLabels[specificType]}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">

        {/* ── Anomalies Leasing ── */}
        {specificType === 'anomalies-leasing' && (
          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="matricule" value={leasingData.matricule} onChange={change(setLeasingData)} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
              <div className="form-group"><label>Nom du client <span className="required">*</span></label><input type="text" name="nomClient" value={leasingData.nomClient} onChange={change(setLeasingData)} required /></div>
              <SelectField label="Agence" name="agence" value={leasingData.agence} onChange={change(setLeasingData)} list={agences} req />
              <SelectField label="Réseau" name="reseau" value={leasingData.reseau} onChange={change(setLeasingData)} list={reseaux} req />
              <div className="form-group"><label>Volume global des engagements (FCFA) <span className="required">*</span></label><input type="number" name="volumeEngagements" value={leasingData.volumeEngagements||''} onChange={change(setLeasingData)} required /></div>
              <div className="form-group"><label>Volume anomalies — impayé + agios (FCFA) <span className="required">*</span></label><input type="number" name="volumeAnomalies" value={leasingData.volumeAnomalies||''} onChange={change(setLeasingData)} required /></div>
            </div>
            <div className="form-group" style={{marginTop:'1rem'}}><label>Origine de l'anomalie <span className="required">*</span></label><textarea name="origineAnomalie" value={leasingData.origineAnomalie} onChange={change(setLeasingData)} rows={3} required placeholder="Ex: impayé, dépassement non régularisé..." /></div>
          </div>
        )}

        {/* ── Parc Automobile ── */}
        {specificType === 'parc-auto' && (
          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Numéro de chassis <span className="required">*</span></label><input type="text" name="numeroChassis" value={parcData.numeroChassis} onChange={change(setParcData)} placeholder="Ex: WBA12345..." required /></div>
              <div className="form-group"><label>Type de véhicule <span className="required">*</span></label><input type="text" name="typeVehicule" value={parcData.typeVehicule} onChange={change(setParcData)} placeholder="Berline, SUV..." required /></div>
              <div className="form-group"><label>Nom du client <span className="required">*</span></label><input type="text" name="nomClient" value={parcData.nomClient} onChange={change(setParcData)} required /></div>
              <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="matricule" value={parcData.matricule} onChange={change(setParcData)} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
              <SelectField label="Agence" name="agence" value={parcData.agence} onChange={change(setParcData)} list={agences} req />
              <SelectField label="Réseau" name="reseau" value={parcData.reseau} onChange={change(setParcData)} list={reseaux} req />
              <div className="form-group"><label>Valeur du matériel (FCFA) <span className="required">*</span></label><input type="number" name="valeurMateriel" value={parcData.valeurMateriel||''} onChange={change(setParcData)} required /></div>
            </div>
          </div>
        )}

        {/* ── Tracking ── */}
        {specificType === 'tracking' && (
          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Nom du client <span className="required">*</span></label><input type="text" name="nomClient" value={trackingData.nomClient} onChange={change(setTrackingData)} required /></div>
              <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="matricule" value={trackingData.matricule} onChange={change(setTrackingData)} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
              <SelectField label="Agence" name="agence" value={trackingData.agence} onChange={change(setTrackingData)} list={agences} req />
              <SelectField label="Réseau" name="reseau" value={trackingData.reseau} onChange={change(setTrackingData)} list={reseaux} req />
              <div className="form-group"><label>Entreprise de tracking <span className="required">*</span></label><input type="text" name="entrepriseTracking" value={trackingData.entrepriseTracking} onChange={change(setTrackingData)} required /></div>
              <div className="form-group"><label>État du tracking <span className="required">*</span></label>
                <select name="etatTracking" value={trackingData.etatTracking} onChange={change(setTrackingData)} required>
                  <option value="">-- Sélectionner --</option>
                  <option>Actif</option><option>Suspendu</option><option>Résilié</option><option>En cours d'installation</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Anomalies Proximité ── */}
        {specificType === 'anomalies-proximite' && (
          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="matricule" value={proxData.matricule} onChange={change(setProxData)} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
              <div className="form-group"><label>Nom du client <span className="required">*</span></label><input type="text" name="nomClient" value={proxData.nomClient} onChange={change(setProxData)} required /></div>
              <SelectField label="Agence" name="agence" value={proxData.agence} onChange={change(setProxData)} list={agences} req />
              <SelectField label="Réseau" name="reseau" value={proxData.reseau} onChange={change(setProxData)} list={reseaux} req />
              <div className="form-group"><label>Volume global des engagements (FCFA) <span className="required">*</span></label><input type="number" name="volumeEngagements" value={proxData.volumeEngagements||''} onChange={change(setProxData)} required /></div>
              <div className="form-group"><label>Volume anomalies — impayé + agios (FCFA) <span className="required">*</span></label><input type="number" name="volumeAnomalies" value={proxData.volumeAnomalies||''} onChange={change(setProxData)} required /></div>
            </div>
            <div className="form-group" style={{marginTop:'1rem'}}><label>Origine de l'anomalie <span className="required">*</span></label><textarea name="origineAnomalie" value={proxData.origineAnomalie} onChange={change(setProxData)} rows={3} required placeholder="Ex: impayé, dépassement non régularisé..." /></div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
      <NotificationModal isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} onClose={closeNotification} />
    </div>
  );
};

export default FormSuiviAnomalies;
