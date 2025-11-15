import React, { useState, useEffect } from 'react';
import { SuiviAnomaliesService } from '../../services/SuiviAnomaliesService';
import { AgenceResauService } from '../../services/AgenceResauService';
import CloseButton from '../CloseButton';

interface FormSuiviAnomaliesProps {
  activityName: string;
  specificType: 'anomalies-tresorerie' | 'anomalies-leasing';
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormSuiviAnomalies: React.FC<FormSuiviAnomaliesProps> = ({ 
  activityName,
  specificType,
  departmentColor = '#990000',
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    NombreClient: 0,
    VolumeGlobalEngagements: 0,
    VolumeAnomalies: 0,
    OrigineAnomalie: '',
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
      const record = {
        Title: activityName,
        TypeAnomalie: specificType,
        NombreClient: formData.NombreClient,
        VolumeGlobalEngagements: formData.VolumeGlobalEngagements,
        VolumeAnomalies: formData.VolumeAnomalies,
        OrigineAnomalie: formData.OrigineAnomalie,
        Agence: formData.Agence,
      };

      await SuiviAnomaliesService.create(record);
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

  const getTypeLabel = () => {
    return specificType === 'anomalies-leasing' 
      ? 'Suivi des anomalies leasing' 
      : 'Suivi des anomalies engagements par trésorerie';
  };

  if (showSuccess) {
    return (
      <div style={{ 
        padding: '3rem 2rem', 
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        border: `3px solid ${departmentColor}`,
        animation: 'bounce 0.6s ease-out'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: `${departmentColor}15`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1A1A1A' }}>
          Enregistrement réussi
        </h3>
        <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
          Les données ont été synchronisées
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <CloseButton onClick={onClose} />

      <div style={{
        background: `linear-gradient(to right, ${departmentColor}05, transparent)`,
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: `${departmentColor}15`,
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={departmentColor} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A' }}>
            {activityName}
          </h2>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: `${departmentColor}20`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: departmentColor,
            fontWeight: 600
          }}>
            {getTypeLabel()}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 2rem 2rem' }}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          
          {/* Nombre de clients */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
              Nombre de clients *
            </label>
            <input
              type="number"
              value={formData.NombreClient === 0 ? '' : formData.NombreClient}
              onChange={(e) => setFormData({ ...formData, NombreClient: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => {
                e.currentTarget.select();
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.95rem',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Volume global des engagements */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
              Volume global des engagements (FCFA) *
            </label>
            <input
              type="number"
              value={formData.VolumeGlobalEngagements === 0 ? '' : formData.VolumeGlobalEngagements}
              onChange={(e) => setFormData({ ...formData, VolumeGlobalEngagements: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => {
                e.currentTarget.select();
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.95rem',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Volume des anomalies */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
              Volume des anomalies (impayé + agios) *
            </label>
            <input
              type="number"
              value={formData.VolumeAnomalies === 0 ? '' : formData.VolumeAnomalies}
              onChange={(e) => setFormData({ ...formData, VolumeAnomalies: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              required
              onFocus={(e) => {
                e.currentTarget.select();
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.95rem',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Origine de l'anomalie */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
              Origine de l'anomalie *
            </label>
            <textarea
              value={formData.OrigineAnomalie}
              onChange={(e) => setFormData({ ...formData, OrigineAnomalie: e.target.value })}
              placeholder="Renseigner l'origine des anomalies de chaque client en anomalie"
              required
              rows={3}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.95rem',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Agence */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
              Agence *
            </label>
            {loadingAgences ? (
              <div style={{ padding: '0.875rem', color: '#666', fontSize: '0.9rem' }}>
                Chargement des agences...
              </div>
            ) : agences.length > 0 ? (
              <select
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  backgroundColor: '#FAFAFA',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = departmentColor;
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="">-- Sélectionner une agence --</option>
                {agences.map((agence, index) => (
                  <option key={index} value={agence}>
                    {agence}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.Agence}
                onChange={(e) => setFormData({ ...formData, Agence: e.target.value })}
                placeholder="Nom de l'agence"
                required
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  backgroundColor: '#FAFAFA',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = departmentColor;
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.backgroundColor = '#FAFAFA';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            )}
          </div>

        </div>

        {/* Boutons d'action */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              minWidth: '140px',
              padding: '1rem 2.5rem',
              border: '2px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: '#FFFFFF',
              color: '#374151',
              transition: 'all 0.2s ease'
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              minWidth: '160px',
              padding: '1rem 2.5rem',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: departmentColor,
              color: '#FFFFFF',
              boxShadow: `0 4px 12px ${departmentColor}30`,
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSuiviAnomalies;
