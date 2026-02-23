import React, { useState, useEffect } from 'react';
import { SuiviDossiersRestructurationService } from '../../services/SuiviDossiersRestructurationService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

interface Props {
  activityName: string;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const MOIS = [
  { v: 1, l: 'Janvier' }, { v: 2, l: 'Février' }, { v: 3, l: 'Mars' },
  { v: 4, l: 'Avril' }, { v: 5, l: 'Mai' }, { v: 6, l: 'Juin' },
  { v: 7, l: 'Juillet' }, { v: 8, l: 'Août' }, { v: 9, l: 'Septembre' },
  { v: 10, l: 'Octobre' }, { v: 11, l: 'Novembre' }, { v: 12, l: 'Décembre' },
];

const FormSuiviCreancesRestructurees: React.FC<Props> = ({ activityName, onClose, onSave }) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);

  const thisYear = new Date().getFullYear();
  const [form, setForm] = useState({
    Matricule: '',
    NomClient: '',
    Agence: '',
    Reseau: '',
    MontantPaye: 0,
    VolumeEngagements: 0,
    VolumeProvisions: 0,
    Mois: new Date().getMonth() + 1,
    Annee: thisYear,
    StatutEcheancier: '',
    DateMiseEnPlace: '',
  });

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

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ref = `CRST-${form.Annee}${String(form.Mois).padStart(2,'0')}-${form.Matricule}`;
    try {
      await SuiviDossiersRestructurationService.create({
        Title: activityName,
        Agence: form.Agence,
        Date: form.DateMiseEnPlace || new Date().toISOString().split('T')[0],
        VolumeGlobalEngagements: form.VolumeEngagements,
        VolumeAnomalies: form.VolumeProvisions,
        MontantSollicite: form.MontantPaye,
        Reference: `${form.Mois}/${form.Annee}|${form.StatutEcheancier}|Réseau:${form.Reseau}`,
      });
      await DetailsDossiersService.create({
        Title: activityName,
        NomClient: form.NomClient,
        Matricule: form.Matricule,
        MontantSollicite: form.MontantPaye,
        Decision: `suivi-creances-${form.StatutEcheancier}`,
        ObjetCommentaire: `Échéance ${form.Mois}/${form.Annee} — ${form.StatutEcheancier}`,
        Commentaire: `Agence:${form.Agence}|Réseau:${form.Reseau}|Provisions:${form.VolumeProvisions}`,
        Reference: ref,
        Date: form.DateMiseEnPlace || new Date().toISOString().split('T')[0],
      });
      showSuccess('Enregistrement réussi', `Échéance ${form.Mois}/${form.Annee} enregistrée pour ${form.NomClient}.`);
      setTimeout(() => onSave(), 1500);
    } catch (err: any) {
      showError('Erreur', err.message || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  const SelectList = ({ label, name, value, list, req = false, loading: ld = false }: any) => (
    <div className="form-group">
      <label>{label}{req && <span className="required"> *</span>}</label>
      {ld ? <div className="loading">Chargement...</div> : list.length > 0 ? (
        <select name={name} value={value} onChange={change} required={req}>
          <option value="">-- Sélectionner --</option>
          {list.map((v: any) => <option key={v.v ?? v} value={v.v ?? v}>{v.l ?? v}</option>)}
        </select>
      ) : (
        <input type="text" name={name} value={value} onChange={change} required={req} />
      )}
    </div>
  );

  return (
    <div className="form-container">
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">Remboursement d'échéance mensuelle</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Matricule client <span className="required">*</span></label><input type="text" name="Matricule" value={form.Matricule} onChange={change} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" /></div>
            <div className="form-group"><label>Nom complet du client <span className="required">*</span></label><input type="text" name="NomClient" value={form.NomClient} onChange={change} required /></div>
            <SelectList label="Agence" name="Agence" value={form.Agence} list={agences} req loading={loadingAgences} />
            <SelectList label="Réseau" name="Reseau" value={form.Reseau} list={reseaux} req loading={loadingAgences} />
            <div className="form-group"><label>Montant payé (FCFA) <span className="required">*</span></label><input type="number" name="MontantPaye" value={form.MontantPaye || ''} onChange={change} required /></div>
            <div className="form-group"><label>Volume global des engagements (FCFA) <span className="required">*</span></label><input type="number" name="VolumeEngagements" value={form.VolumeEngagements || ''} onChange={change} required /></div>
            <div className="form-group"><label>Volume des provisions (FCFA) <span className="required">*</span></label><input type="number" name="VolumeProvisions" value={form.VolumeProvisions || ''} onChange={change} required /></div>
            <SelectList label="Mois" name="Mois" value={form.Mois} list={MOIS} req />
            <div className="form-group"><label>Année <span className="required">*</span></label>
              <select name="Annee" value={form.Annee} onChange={change} required>
                {[thisYear - 1, thisYear, thisYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Statut échéancier <span className="required">*</span></label>
              <select name="StatutEcheancier" value={form.StatutEcheancier} onChange={change} required>
                <option value="">-- Sélectionner --</option>
                <option value="payé">Payé</option>
                <option value="impayé">Impayé</option>
              </select>
            </div>
            <div className="form-group"><label>Date de mise en place du dossier</label><input type="date" name="DateMiseEnPlace" value={form.DateMiseEnPlace} onChange={change} /></div>
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

export default FormSuiviCreancesRestructurees;
