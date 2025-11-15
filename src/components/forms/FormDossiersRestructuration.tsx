import React, { useState, useEffect } from 'react';
import { SuiviDossiersRestructurationService } from '../../services/SuiviDossiersRestructurationService';
import { AgenceResauService } from '../../services/AgenceResauService';
import { format } from 'date-fns';
import CloseButton from '../CloseButton';

interface FormDossiersRestructurationProps {
  activityName: string;
  specificType: 'dossiers-recus' | 'dossiers-complements' | 'dossier-analyse' | 'dossier-attente-comite' 
    | 'dossier-attente-decision' | 'dossier-accord' | 'dossier-renvoye' | 'dossier-avis-conformite' 
    | 'attente-comite-credit' | 'remboursement-echeance';
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

const FormDossiersRestructuration: React.FC<FormDossiersRestructurationProps> = ({ 
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
    DateEntree: format(new Date(), 'yyyy-MM-dd'),
    DateEnvois: format(new Date(), 'yyyy-MM-dd'),
    VolumeGlobalEngagements: 0,
    VolumeAnomalies: 0,
    MontantSollicite: 0,
    Agence: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Charger les agences au montage du composant
  useEffect(() => {
    loadAgences();
  }, []);

  const loadAgences = async () => {
    setLoadingAgences(true);
    try {
      console.log('🏢 Chargement des agences...');
      const result = await AgenceResauService.getAll();
      const data = result?.data || result?.value || [];
      
      if (!data || data.length === 0) {
        console.warn('⚠️ Aucune agence trouvée');
        setAgences([]);
        return;
      }
      
      // Extraire les agences uniques
      const uniqueAgences = Array.from(
        new Set(data.map((item: any) => item.Title).filter(Boolean))
      ).sort() as string[];
      
      console.log(`✅ ${uniqueAgences.length} agences chargées`);
      setAgences(uniqueAgences);
    } catch (err) {
      console.error('❌ Erreur chargement agences:', err);
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
        TypeDossier: specificType,
        DateEntree: formData.DateEntree,
        DateEnvois: specificType === 'dossiers-complements' ? formData.DateEnvois : undefined,
        VolumeGlobalEngagements: formData.VolumeGlobalEngagements,
        VolumeAnomalies: formData.VolumeAnomalies,
        MontantSollicite: needsMontantSollicite() ? formData.MontantSollicite : undefined,
        Agence: formData.Agence,
      };

      await SuiviDossiersRestructurationService.create(record);
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

  // Détermine si le champ "Montant Sollicité" est nécessaire
  const needsMontantSollicite = () => {
    return ['dossier-attente-comite', 'dossier-attente-decision', 'dossier-accord', 
            'dossier-renvoye', 'dossier-avis-conformite', 'attente-comite-credit', 
            'remboursement-echeance'].includes(specificType);
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      'dossiers-recus': 'Dossiers reçus des unités',
      'dossiers-complements': 'Dossiers envoyés pour compléments',
      'dossier-analyse': 'Dossier en cours d\'analyse',
      'dossier-attente-comite': 'Dossier en attente de comité',
      'dossier-attente-decision': 'Dossiers en attente de décision',
      'dossier-accord': 'Dossier avec accord',
      'dossier-renvoye': 'Dossier renvoyé',
      'dossier-avis-conformite': 'Dossiers en attente avis conformité',
      'attente-comite-credit': 'En attente du comité de crédit',
      'remboursement-echeance': 'Remboursement d\'échéance'
    };
    return labels[specificType] || specificType;
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
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.5rem',
          color: '#1A1A1A'
        }}>
          Enregistrement réussi
        </h3>
        <p style={{ 
          margin: 0, 
          color: '#666',
          fontSize: '0.95rem'
        }}>
          Les données ont été synchronisées avec SharePoint
        </p>
        <div style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: `${departmentColor}10`,
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: departmentColor,
          fontWeight: 600
        }}>
          ✓ Données synchronisées
        </div>
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M12 18v-6" />
            <path d="M9 15h6" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1A1A1A'
          }}>
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
          
          {/* Date d'entrée */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em'
            }}>
              Date d'entrée *
            </label>
            <input
              type="date"
              value={formData.DateEntree}
              onChange={(e) => setFormData({ ...formData, DateEntree: e.target.value })}
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
            />
          </div>

          {/* Date d'envois (seulement pour dossiers-complements) */}
          {specificType === 'dossiers-complements' && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem',
                fontWeight: 600,
                color: '#111827',
                fontSize: '0.95rem',
                letterSpacing: '-0.01em'
              }}>
                Date d'envois *
              </label>
              <input
                type="date"
                value={formData.DateEnvois}
                onChange={(e) => setFormData({ ...formData, DateEnvois: e.target.value })}
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
              />
            </div>
          )}

          {/* Volume global des engagements */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em'
            }}>
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
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em'
            }}>
              Volume des anomalies (agios et impayés) *
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

          {/* Montant Sollicité (conditionnel) */}
          {needsMontantSollicite() && (
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem',
                fontWeight: 600,
                color: '#111827',
                fontSize: '0.95rem',
                letterSpacing: '-0.01em'
              }}>
                Montant sollicité (FCFA) *
              </label>
              <input
                type="number"
                value={formData.MontantSollicite === 0 ? '' : formData.MontantSollicite}
                onChange={(e) => setFormData({ ...formData, MontantSollicite: parseFloat(e.target.value) || 0 })}
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
          )}

          {/* Agence */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em'
            }}>
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

        {/* Résumé */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          backgroundColor: `${departmentColor}08`,
          borderRadius: '10px',
          borderLeft: `4px solid ${departmentColor}`
        }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#666' }}>
            RÉSUMÉ DES DONNÉES
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: '#666' }}>Volume Engagements:</span>
              <strong style={{ marginLeft: '0.5rem', color: '#1A1A1A' }}>
                {formData.VolumeGlobalEngagements.toLocaleString()} FCFA
              </strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>Volume Anomalies:</span>
              <strong style={{ marginLeft: '0.5rem', color: '#1A1A1A' }}>
                {formData.VolumeAnomalies.toLocaleString()} FCFA
              </strong>
            </div>
            {needsMontantSollicite() && (
              <div>
                <span style={{ color: '#666' }}>Montant Sollicité:</span>
                <strong style={{ marginLeft: '0.5rem', color: '#1A1A1A' }}>
                  {formData.MontantSollicite.toLocaleString()} FCFA
                </strong>
              </div>
            )}
            <div>
              <span style={{ color: '#666' }}>Agence:</span>
              <strong style={{ marginLeft: '0.5rem', color: '#1A1A1A' }}>
                {formData.Agence || '-'}
              </strong>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          justifyContent: 'flex-end'
        }}>
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
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
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${departmentColor}40`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${departmentColor}30`;
            }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormDossiersRestructuration;
