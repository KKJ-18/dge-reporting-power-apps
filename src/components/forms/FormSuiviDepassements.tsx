import React, { useState, useEffect } from 'react';
import { SuiviDepassementsService } from '../../services/SuiviDepassementsService';
import { AgenceResauService } from '../../services/AgenceResauService';
import { format } from 'date-fns';
import CloseButton from '../CloseButton';

interface FormSuiviDepassementsProps {
  activityName: string;
  specificType: 'nombre-depassement' | 'depassement-regularise-72h' | 'depassement-attente-regularisation';
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviDepassements: React.FC<FormSuiviDepassementsProps> = ({ 
  activityName, specificType, departmentColor = '#990000', onClose, onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreCompte: 0,
    DateDepassement: format(new Date(), 'yyyy-MM-dd'),
    DureeDepassementJours: 0,
    VolumeDepassement: 0,
    Agence: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadAgences();
  }, []);

  const loadAgences = async () => {
    setLoadingAgences(true);
    try {
      const result = await AgenceResauService.getAll();
      const data = result?.data || result?.value || [];
      const uniqueAgences = Array.from(
        new Set(data.map((item: any) => item.Title).filter(Boolean))
      ).sort() as string[];
      setAgences(uniqueAgences);
    } catch (err) {
      console.error('Erreur chargement agences:', err);
      setAgences([]);
    } finally {
      setLoadingAgences(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await SuiviDepassementsService.create({ 
        Title: activityName, 
        NombreCompte: formData.NombreCompte,
        DateDepassement: formData.DateDepassement,
        DureeDepassementJours: formData.DureeDepassementJours,
        VolumeDepassement: formData.VolumeDepassement,
        Agence: formData.Agence
      });
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onSave(); }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return <div style={{ padding: '3rem 2rem', textAlign: 'center', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: `3px solid ${departmentColor}`, animation: 'bounce 0.6s ease-out' }}><div style={{ width: '80px', height: '80px', backgroundColor: `${departmentColor}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div><h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1A1A1A' }}>Enregistrement réussi</h3></div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <CloseButton onClick={onClose} />
      <div style={{ background: `linear-gradient(to right, ${departmentColor}05, transparent)`, padding: '2rem', marginBottom: '2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}><div style={{ width: '70px', height: '70px', backgroundColor: `${departmentColor}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div><div style={{ flex: 1 }}><h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A' }}>{activityName}</h2></div></div>
      <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Nombre de comptes *</label>
            <input type="number" value={formData.NombreCompte === 0 ? '' : formData.NombreCompte} onChange={(e) => setFormData({ ...formData, NombreCompte: parseInt(e.target.value) || 0 })} required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Date de dépassement *</label>
            <input type="date" value={formData.DateDepassement} onChange={(e) => setFormData({ ...formData, DateDepassement: e.target.value })} required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Durée (jours) *</label>
            <input type="number" value={formData.DureeDepassementJours === 0 ? '' : formData.DureeDepassementJours} onChange={(e) => setFormData({ ...formData, DureeDepassementJours: parseInt(e.target.value) || 0 })} required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Volume dépassement (FCFA) *</label>
            <input type="number" value={formData.VolumeDepassement === 0 ? '' : formData.VolumeDepassement} onChange={(e) => setFormData({ ...formData, VolumeDepassement: parseFloat(e.target.value) || 0 })} required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Agence *</label>
            {loadingAgences ? (
              <div style={{ padding: '0.875rem', color: '#666', fontSize: '0.9rem' }}>Chargement des agences...</div>
            ) : agences.length > 0 ? (
              <select value={formData.Agence} onChange={(e) => setFormData({ ...formData, Agence: e.target.value })} required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                <option value="">-- Sélectionner une agence --</option>
                {agences.map((agence, index) => (
                  <option key={index} value={agence}>{agence}</option>
                ))}
              </select>
            ) : (
              <input type="text" value={formData.Agence} onChange={(e) => setFormData({ ...formData, Agence: e.target.value })} placeholder="Nom de l'agence" required style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ minWidth: '140px', padding: '1rem 2.5rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', backgroundColor: '#FFFFFF', color: '#374151' }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ minWidth: '160px', padding: '1rem 2.5rem', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: departmentColor, color: '#FFFFFF', opacity: loading ? 0.7 : 1 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};

export default FormSuiviDepassements;
