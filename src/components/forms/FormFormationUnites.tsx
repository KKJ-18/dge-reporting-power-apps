import React, { useState } from 'react';
import { FormationUnitesService } from '../../services/FormationUnitesService';
import CloseButton from '../CloseButton';

interface FormFormationUnitesProps {
  activityName: string;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormFormationUnites: React.FC<FormFormationUnitesProps> = ({ 
  activityName,
  departmentColor = '#990000',
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NombreAgence: 0,
    SujetFormation: '',
    NombrePersonnesFormees: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        NombreAgence: formData.NombreAgence,
        SujetFormation: formData.SujetFormation,
        NombrePersonnesFormees: formData.NombrePersonnesFormees,
      };

      await FormationUnitesService.create(record);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: `3px solid ${departmentColor}`, animation: 'bounce 0.6s ease-out' }}>
        <div style={{ width: '80px', height: '80px', backgroundColor: `${departmentColor}15`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1A1A1A' }}>Enregistrement réussi</h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Formation enregistrée avec succès</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <CloseButton onClick={onClose} />
      <div style={{ background: `linear-gradient(to right, ${departmentColor}05, transparent)`, padding: '2rem', marginBottom: '2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '70px', height: '70px', backgroundColor: `${departmentColor}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A' }}>{activityName}</h2>
          <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', backgroundColor: `${departmentColor}20`, borderRadius: '6px', fontSize: '0.875rem', color: departmentColor, fontWeight: 600 }}>Formation des unités</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Nombre d'agences *</label>
            <input type="number" value={formData.NombreAgence === 0 ? '' : formData.NombreAgence} onChange={(e) => setFormData({ ...formData, NombreAgence: parseInt(e.target.value) || 0 })} placeholder="0" required onFocus={(e) => { e.currentTarget.select(); e.currentTarget.style.borderColor = departmentColor; e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }} style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Sujet de formation *</label>
            <textarea value={formData.SujetFormation} onChange={(e) => setFormData({ ...formData, SujetFormation: e.target.value })} placeholder="Description du sujet de formation" required rows={3} style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease', fontFamily: 'inherit', resize: 'vertical' }} onFocus={(e) => { e.currentTarget.style.borderColor = departmentColor; e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>Nombre de personnes formées *</label>
            <input type="number" value={formData.NombrePersonnesFormees === 0 ? '' : formData.NombrePersonnesFormees} onChange={(e) => setFormData({ ...formData, NombrePersonnesFormees: parseInt(e.target.value) || 0 })} placeholder="0" required onFocus={(e) => { e.currentTarget.select(); e.currentTarget.style.borderColor = departmentColor; e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`; }} onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }} style={{ width: '100%', padding: '0.875rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', backgroundColor: '#FAFAFA', transition: 'all 0.2s ease' }} />
          </div>

        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} disabled={loading} style={{ minWidth: '140px', padding: '1rem 2.5rem', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', backgroundColor: '#FFFFFF', color: '#374151', transition: 'all 0.2s ease' }}>Annuler</button>
          <button type="submit" disabled={loading} style={{ minWidth: '160px', padding: '1rem 2.5rem', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: departmentColor, color: '#FFFFFF', boxShadow: `0 4px 12px ${departmentColor}30`, transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1 }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
};

export default FormFormationUnites;
