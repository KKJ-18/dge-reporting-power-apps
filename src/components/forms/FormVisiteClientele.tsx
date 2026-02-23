import React, { useState, useEffect } from 'react';
import { VisiteClienteleService } from '../../services/VisiteClienteleService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

interface Props { activityName: string; departmentColor?: string; onClose: () => void; onSave: () => void; }

const FormVisiteClientele: React.FC<Props> = ({ activityName, onClose, onSave }) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [form, setForm] = useState({
    Agence: '',
    NomClient: '',
    DateVisite: new Date().toISOString().split('T')[0],
    ObjetVisite: '',
    CompteRendu: '',
    MontantEngagements: 0,
    VolumeAnomalies: 0,
  });

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
    setForm(p => ({ ...p, [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await VisiteClienteleService.create({
        Title: activityName,
        Agence: form.Agence,
        NomClient: form.NomClient,
        DateVisite: form.DateVisite,
        ObjetVisite: form.ObjetVisite,
        CompteRendu: form.CompteRendu,
      });
      // Save financial data to DetailsDossiers
      if (form.MontantEngagements || form.VolumeAnomalies) {
        const { DetailsDossiersService } = await import('../../services/DetailsDossiersService');
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: form.NomClient,
          MontantSollicite: form.MontantEngagements,
          Decision: 'visite-clientele',
          Commentaire: `VolumeAnomalies:${form.VolumeAnomalies}|Agence:${form.Agence}`,
          Date: form.DateVisite,
        });
      }
      showSuccess('Enregistrement réussi', `Visite de ${form.NomClient} enregistrée.`);
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
          <span className="form-badge">Visite clientèle</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Agence <span className="required">*</span></label>
              {loadingAgences ? <div className="loading">Chargement...</div> : agences.length > 0 ? (
                <select name="Agence" value={form.Agence} onChange={change} required>
                  <option value="">-- Sélectionner --</option>
                  {agences.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input type="text" name="Agence" value={form.Agence} onChange={change} required />
              )}
            </div>
            <div className="form-group"><label>Nom du client <span className="required">*</span></label><input type="text" name="NomClient" value={form.NomClient} onChange={change} required /></div>
            <div className="form-group"><label>Date de visite <span className="required">*</span></label><input type="date" name="DateVisite" value={form.DateVisite} onChange={change} required /></div>
            <div className="form-group"><label>Objet de la visite</label><input type="text" name="ObjetVisite" value={form.ObjetVisite} onChange={change} placeholder="Ex: Régularisation, plan de remboursement..." /></div>
            <div className="form-group"><label>Montant global des engagements (FCFA) <span className="required">*</span></label><input type="number" name="MontantEngagements" value={form.MontantEngagements || ''} onChange={change} required /></div>
            <div className="form-group"><label>Volume anomalies — impayé + agios (FCFA) <span className="required">*</span></label><input type="number" name="VolumeAnomalies" value={form.VolumeAnomalies || ''} onChange={change} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Compte rendu</label><textarea name="CompteRendu" value={form.CompteRendu} onChange={change} rows={4} placeholder="Résumé de la visite, engagements pris..." /></div>
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

export default FormVisiteClientele;

