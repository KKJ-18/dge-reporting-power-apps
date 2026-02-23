import React, { useState, useEffect } from 'react';
import { SuiviDossiersRestructurationService } from '../../services/SuiviDossiersRestructurationService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

type RestructurationType =
  | 'reception-dossiers'
  | 'dossiers-complements'
  | 'dossiers-elements-recus'
  | 'dossier-analyse'
  | 'dossier-attente-comite'
  | 'dossier-attente-decision'
  | 'dossier-accord'
  | 'dossier-rejete';

interface FormDossiersRestructurationV2Props {
  activityName: string;
  specificType?: string;
  onClose: () => void;
  onSave: () => void;
  departmentColor?: string;
}

const TYPE_LABELS: Record<RestructurationType, string> = {
  'reception-dossiers': 'Réception des dossiers',
  'dossiers-complements': 'Envoi pour compléments d\'informations',
  'dossiers-elements-recus': 'Éléments reçus de l\'unité',
  'dossier-analyse': 'Dossier en cours d\'analyse',
  'dossier-attente-comite': 'Dossier en attente de comité',
  'dossier-attente-decision': 'Dossier en attente de décision',
  'dossier-accord': 'Accord (comité + PV)',
  'dossier-rejete': 'Dossier rejeté',
};

const FormDossiersRestructurationV2: React.FC<FormDossiersRestructurationV2Props> = ({
  activityName,
  specificType,
  onClose,
  onSave,
}) => {
  const subType = (specificType || 'reception-dossiers') as RestructurationType;
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    dateField: today,
    volumeEngagements: 0,
    volumeAnomalies: 0,
    montantSollicite: 0,
    montantAccorde: 0,
    volumeProvisions: 0,
    agence: '',
    reseau: '',
    matricule: '',
    nomClient: '',
    nomGestionnaire: '',
    mailGestionnaire: '',
    infosSollicitees: '',
    statutDossier: '',
    statAnalyse: '',
    dateFinAnalyse: '',
    etapeRejet: '',
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

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const generateRef = () => `RESTR-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const SelectField = ({ label, name, value, list, req = false }: { label: string; name: string; value: string; list: string[]; req?: boolean }) => (
    <div className="form-group">
      <label>{label}{req && <span className="required"> *</span>}</label>
      {loadingAgences ? <div className="loading">Chargement...</div> : list.length > 0 ? (
        <select name={name} value={value} onChange={change} required={req}>
          <option value="">-- Sélectionner --</option>
          {list.map((v: string) => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : (
        <input type="text" name={name} value={value} onChange={change} required={req} placeholder={label} />
      )}
    </div>
  );

  const getDateLabel = (): string => {
    switch (subType) {
      case 'reception-dossiers': return 'Date d\'entrée du dossier';
      case 'dossiers-complements': return 'Date d\'envoi à l\'unité';
      case 'dossiers-elements-recus': return 'Date de réception de l\'unité';
      case 'dossier-analyse': return 'Date d\'entrée du dossier complet';
      case 'dossier-attente-comite': return 'Date de convocation du comité';
      case 'dossier-attente-decision': return 'Date de transmission à la 1ère décision';
      case 'dossier-accord': return 'Date de réception de la décision';
      case 'dossier-rejete': return 'Date du rejet';
      default: return 'Date';
    }
  };

  // Sub-type field visibility flags
  const hasClient = ['reception-dossiers', 'dossiers-complements', 'dossiers-elements-recus', 'dossier-analyse'].includes(subType);
  const hasGestionnaire = ['reception-dossiers', 'dossiers-complements', 'dossiers-elements-recus', 'dossier-analyse'].includes(subType);
  const hasMailGestionnaire = subType === 'reception-dossiers';
  const hasProvisions = ['reception-dossiers', 'dossiers-complements', 'dossiers-elements-recus', 'dossier-analyse'].includes(subType);
  const hasInfosSollicitees = ['dossiers-complements', 'dossiers-elements-recus'].includes(subType);
  const hasStatutDossier = subType === 'dossiers-elements-recus';
  const hasStatAnalyse = subType === 'dossier-analyse';
  const hasMontantSollicite = ['dossier-attente-comite', 'dossier-attente-decision', 'dossier-accord', 'dossier-rejete'].includes(subType);
  const hasMontantAccorde = subType === 'dossier-accord';
  const hasEtapeRejet = subType === 'dossier-rejete';
  const hasMatriculeRejete = subType === 'dossier-rejete';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ref = generateRef();
    try {
      await SuiviDossiersRestructurationService.create({
        Title: activityName,
        DateEntree: form.dateField,
        Agence: form.agence,
        VolumeGlobalEngagements: form.volumeEngagements,
        VolumeAnomalies: form.volumeAnomalies,
        MontantSollicite: hasMontantSollicite ? form.montantSollicite : form.volumeEngagements,
        Date: form.dateField,
        Reference: ref,
      });

      if (hasClient || hasGestionnaire || hasMatriculeRejete) {
        const commentParts: string[] = [];
        if (form.reseau) commentParts.push(`Réseau:${form.reseau}`);
        if (hasProvisions) commentParts.push(`Provisions:${form.volumeProvisions}`);
        if (hasMontantAccorde) commentParts.push(`MontantAccordé:${form.montantAccorde}`);
        if (hasInfosSollicitees && form.infosSollicitees) commentParts.push(`Infos:${form.infosSollicitees}`);
        if (hasStatutDossier && form.statutDossier) commentParts.push(`Statut:${form.statutDossier}`);
        if (hasStatAnalyse) {
          commentParts.push(`StatAnalyse:${form.statAnalyse}`);
          if (form.dateFinAnalyse) commentParts.push(`FinAnalyse:${form.dateFinAnalyse}`);
        }
        if (hasEtapeRejet && form.etapeRejet) commentParts.push(`ÉtapeRejet:${form.etapeRejet}`);
        if (hasMailGestionnaire && form.mailGestionnaire) commentParts.push(`Mail:${form.mailGestionnaire}`);

        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: hasClient ? form.nomClient : (hasMatriculeRejete ? form.nomGestionnaire : ''),
          Matricule: hasClient ? form.matricule : (hasMatriculeRejete ? form.matricule : ''),
          MontantSollicite: hasMontantSollicite ? form.montantSollicite : form.volumeEngagements,
          Decision: subType,
          DetailDecision: `Étape: ${TYPE_LABELS[subType]}`,
          ObjetCommentaire: hasGestionnaire ? `Gestionnaire:${form.nomGestionnaire}` : activityName,
          Commentaire: commentParts.join('|'),
          Comite: form.agence,
          Reference: ref,
          Date: form.dateField,
        });
      }

      showSuccess('Enregistrement réussi', `${TYPE_LABELS[subType]} — Réf: ${ref}`);
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
          <span className="form-badge">{TYPE_LABELS[subType]}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

            {/* Date (always) */}
            <div className="form-group">
              <label>{getDateLabel()} <span className="required">*</span></label>
              <input type="date" name="dateField" value={form.dateField} onChange={change} required />
            </div>

            {/* Agence & Réseau (always) */}
            <SelectField label="Agence" name="agence" value={form.agence} list={agences} req />
            <SelectField label="Réseau" name="reseau" value={form.reseau} list={reseaux} req />

            {/* Volume engagements & anomalies (always) */}
            <div className="form-group">
              <label>Volume global des engagements (FCFA) <span className="required">*</span></label>
              <input type="number" name="volumeEngagements" value={form.volumeEngagements || ''} onChange={change} required />
            </div>
            <div className="form-group">
              <label>Volume des anomalies — agios + impayés (FCFA) <span className="required">*</span></label>
              <input type="number" name="volumeAnomalies" value={form.volumeAnomalies || ''} onChange={change} required />
            </div>

            {/* Client (réception, compléments, éléments reçus, analyse) */}
            {hasClient && (<>
              <div className="form-group">
                <label>Matricule client <span className="required">*</span></label>
                <input type="text" name="matricule" value={form.matricule} onChange={change} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" />
              </div>
              <div className="form-group">
                <label>Nom du client <span className="required">*</span></label>
                <input type="text" name="nomClient" value={form.nomClient} onChange={change} required />
              </div>
            </>)}

            {/* Provisions (réception, compléments, éléments reçus, analyse) */}
            {hasProvisions && (
              <div className="form-group">
                <label>Volume des provisions (FCFA) <span className="required">*</span></label>
                <input type="number" name="volumeProvisions" value={form.volumeProvisions || ''} onChange={change} required />
              </div>
            )}

            {/* Gestionnaire (réception, compléments, éléments reçus, analyse) */}
            {hasGestionnaire && (
              <div className="form-group">
                <label>Nom du gestionnaire <span className="required">*</span></label>
                <input type="text" name="nomGestionnaire" value={form.nomGestionnaire} onChange={change} required />
              </div>
            )}

            {/* Mail gestionnaire (réception uniquement) */}
            {hasMailGestionnaire && (
              <div className="form-group">
                <label>Adresse mail du gestionnaire</label>
                <input type="email" name="mailGestionnaire" value={form.mailGestionnaire} onChange={change} placeholder="email@exemple.com" />
              </div>
            )}

            {/* Infos sollicitées (compléments, éléments reçus) */}
            {hasInfosSollicitees && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Informations sollicitées de l'unité <span className="required">*</span></label>
                <textarea name="infosSollicitees" value={form.infosSollicitees} onChange={change} rows={3} required placeholder="Détail des informations demandées..." />
              </div>
            )}

            {/* Statut dossier (éléments reçus: complet/incomplet) */}
            {hasStatutDossier && (
              <div className="form-group">
                <label>Statut du dossier <span className="required">*</span></label>
                <select name="statutDossier" value={form.statutDossier} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  <option value="complet">Complet</option>
                  <option value="incomplet">Incomplet (retour compléments)</option>
                </select>
              </div>
            )}

            {/* Stat analyse (en cours d'analyse) */}
            {hasStatAnalyse && (<>
              <div className="form-group">
                <label>Statut d'analyse <span className="required">*</span></label>
                <select name="statAnalyse" value={form.statAnalyse} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  <option value="attente comité">Dossier en attente de comité</option>
                  <option value="monte PV">Dossier dont on monte le PV</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date de fin d'analyse</label>
                <input type="date" name="dateFinAnalyse" value={form.dateFinAnalyse} onChange={change} />
              </div>
            </>)}

            {/* Montant sollicité (attente comité, attente décision, accord, rejeté) */}
            {hasMontantSollicite && (
              <div className="form-group">
                <label>Montant sollicité (FCFA) <span className="required">*</span></label>
                <input type="number" name="montantSollicite" value={form.montantSollicite || ''} onChange={change} required />
              </div>
            )}

            {/* Montant accordé (accord uniquement) */}
            {hasMontantAccorde && (
              <div className="form-group">
                <label>Montant accordé (FCFA) <span className="required">*</span></label>
                <input type="number" name="montantAccorde" value={form.montantAccorde || ''} onChange={change} required />
              </div>
            )}

            {/* Rejeté: Matricule, nom gestionnaire, étape du rejet */}
            {hasMatriculeRejete && (<>
              <div className="form-group">
                <label>Matricule <span className="required">*</span></label>
                <input type="text" name="matricule" value={form.matricule} onChange={change} required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" placeholder="7 chiffres" />
              </div>
              <div className="form-group">
                <label>Nom du gestionnaire <span className="required">*</span></label>
                <input type="text" name="nomGestionnaire" value={form.nomGestionnaire} onChange={change} required />
              </div>
            </>)}

            {hasEtapeRejet && (
              <div className="form-group">
                <label>Étape du rejet <span className="required">*</span></label>
                <select name="etapeRejet" value={form.etapeRejet} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  <option value="analyse">À l'analyse</option>
                  <option value="premiere-decision">À la première décision</option>
                  <option value="deuxieme-decision">À la deuxième décision</option>
                </select>
              </div>
            )}

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

export default FormDossiersRestructurationV2;
