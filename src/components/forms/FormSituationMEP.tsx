import React, { useState } from 'react';
import { SituationMEPService } from '../../services/SituationMEPService';
import { format } from 'date-fns';
import CloseButton from '../CloseButton';

interface FormSituationMEPProps {
  activityName: string;
  mepType: 'amortissables' | 'restructuration' | 'caution' | 'credoc' | 'leasing' | 'ligne-decouvert' | 'lignes-autres' | 'finance-islamique';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;  // ✅ Couleur du département
}

const FormSituationMEP: React.FC<FormSituationMEPProps> = ({ 
  activityName, 
  mepType,
  onSave, 
  onCancel,
  departmentColor = '#CC0000'  // ✅ Défaut rouge DGE
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Nombre: 0,
    Montant: 0,
    DateMep: format(new Date(), 'yyyy-MM-dd'),
    Pourcentage: 0,
    IdDetailClient: '', // Référence client (optionnel)
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,  // ✅ Seulement le nom de l'activité
        Nombre: formData.Nombre,
        Montant: formData.Montant,
        DateMep: formData.DateMep,
        Pourcentage: formData.Pourcentage,
        IdDetailClient: formData.IdDetailClient || undefined,
      };

      console.log('📤 Envoi de la requête SituationMEP:', {
        record,
        activityName,
        mepType
      });

      const result = await SituationMEPService.create(record);
      
      console.log('📥 Réponse du serveur:', {
        success: result.success,
        error: result.error,
        fullResult: result
      });
      
      if (result.success) {
        console.log('✅ Enregistrement réussi!');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSave();
        }, 2000);
      } else {
        const errorMsg = result.error || 'Erreur inconnue lors de la sauvegarde';
        console.error('❌ Échec de l\'enregistrement:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Exception capturée:', error);
      console.error('Stack trace:', (error as Error).stack);
      alert('❌ Erreur lors de la sauvegarde:\n\n' + (error as Error).message + '\n\nVoir la console (F12) pour plus de détails.');
    } finally {
      setLoading(false);
    }
  };

  const getMEPIcon = () => {
    switch (mepType) {
      case 'amortissables': return '💰';
      case 'restructuration': return '🔄';
      case 'caution': return '🛡️';
      case 'credoc': return '📄';
      case 'leasing': return '🚗';
      case 'ligne-decouvert': return '📊';
      case 'lignes-autres': return '📈';
      case 'finance-islamique': return '🕌';
      default: return '📋';
    }
  };

  const getMEPLabel = () => {
    switch (mepType) {
      case 'amortissables': return 'Amortissables';
      case 'restructuration': return 'Restructuration';
      case 'caution': return 'Caution';
      case 'credoc': return 'CréDoc';
      case 'leasing': return 'Leasing';
      case 'ligne-decouvert': return 'Ligne de Découvert';
      case 'lignes-autres': return 'Lignes autres que les découverts';
      case 'finance-islamique': return 'Finance Islamique';
      default: return mepType;
    }
  };

  return (
    <div style={{ 
      padding: 'clamp(1.5rem, 4vw, 2.5rem)',
      maxWidth: '100%',
      position: 'relative',
    }}>
      {/* Bouton de fermeture moderne */}
      <CloseButton onClick={onCancel} />

      {/* Header ultra moderne */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: `3px solid ${departmentColor}20`,
        paddingRight: '3.5rem',
        background: `linear-gradient(to right, ${departmentColor}05, transparent)`,
        padding: '1.5rem',
        borderRadius: '12px',
        marginTop: '1rem',
      }}>
        <div style={{ 
          fontSize: '3rem',
          background: `${departmentColor}15`,
          borderRadius: '16px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '70px',
          height: '70px',
        }}>
          {getMEPIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)', 
            fontWeight: '700', 
            color: '#111827', 
            marginBottom: '0.5rem',
            wordBreak: 'break-word',
            letterSpacing: '-0.02em',
          }}>
            {activityName}
          </h2>
          <p style={{ 
            color: '#6B7280', 
            fontSize: 'clamp(0.9rem, 2vw, 1rem)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}>
            <span style={{ 
              backgroundColor: `${departmentColor}20`,
              color: departmentColor,
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.875rem',
            }}>
              {getMEPLabel()}
            </span>
            <span>•</span>
            <span>Situation Mise en Place</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Grille responsive */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Nombre */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Nombre de dossiers <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.Nombre === 0 ? '' : formData.Nombre}
              onChange={(e) => setFormData({ ...formData, Nombre: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#FAFAFA',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
                if (e.currentTarget.value === '0') e.currentTarget.select();
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Montant */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Montant (millions FCFA) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.Montant === 0 ? '' : formData.Montant}
              onChange={(e) => setFormData({ ...formData, Montant: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.01"
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#FAFAFA',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
                if (e.currentTarget.value === '0') e.currentTarget.select();
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Date MEP */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Date de Mise en Place <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={formData.DateMep}
              onChange={(e) => setFormData({ ...formData, DateMep: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#FAFAFA',
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

          {/* Pourcentage */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Pourcentage (%) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.Pourcentage === 0 ? '' : formData.Pourcentage}
              onChange={(e) => setFormData({ ...formData, Pourcentage: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#FAFAFA',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${departmentColor}15`;
                if (e.currentTarget.value === '0') e.currentTarget.select();
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* ID Détail Client (optionnel) */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Référence Client (optionnel)
            </label>
            <input
              type="text"
              value={formData.IdDetailClient}
              onChange={(e) => setFormData({ ...formData, IdDetailClient: e.target.value })}
              placeholder="Exemple: CLI-2025-001"
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                outline: 'none',
                backgroundColor: '#FAFAFA',
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
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.625rem', fontStyle: 'italic' }}>
              Identifiant du client pour la traçabilité (facultatif)
            </p>
          </div>
        </div>

        {/* Actions ultra modernes */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 768 ? 'column-reverse' : 'row',
          gap: '1rem',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: `3px solid ${departmentColor}20`
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '1rem 2.5rem',
              border: '2px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              transition: 'all 0.2s ease',
              minWidth: window.innerWidth <= 768 ? '100%' : '140px',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem 2.5rem',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: departmentColor,
              color: '#FFFFFF',
              transition: 'all 0.2s ease',
              boxShadow: `0 4px 12px ${departmentColor}40`,
              minWidth: window.innerWidth <= 768 ? '100%' : '160px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${departmentColor}50`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 12px ${departmentColor}40`;
            }}
          >
            {loading ? (
              <>
                <span>⏳</span>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de succès ultra moderne */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'slideIn 0.3s ease-out',
            border: `3px solid ${departmentColor}30`,
          }}>
            <div style={{ 
              fontSize: 'clamp(3.5rem, 10vw, 5rem)', 
              marginBottom: '1.5rem',
              animation: 'bounce 0.6s ease-in-out',
            }}>✅</div>
            <h3 style={{ 
              fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
              fontWeight: '700', 
              color: departmentColor,
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Opération Réussie !
            </h3>
            <p style={{ 
              color: '#6B7280', 
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              lineHeight: '1.6',
              marginBottom: '0.5rem',
            }}>
              La situation MEP a été enregistrée avec succès.
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: `${departmentColor}10`,
              borderRadius: '12px',
              display: 'inline-block',
            }}>
              <p style={{ 
                color: departmentColor, 
                fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                fontWeight: '600',
                margin: 0,
              }}>
                🎉 Données synchronisées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSituationMEP;
