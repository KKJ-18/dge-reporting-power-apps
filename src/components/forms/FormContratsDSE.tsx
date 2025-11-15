import React, { useState } from 'react';
import { ContratsService } from '../../services/ContratsService';
import { format } from 'date-fns';
import CloseButton from '../CloseButton';

interface FormContratsDSEProps {
  activityName: string;
  contratType: 'avance-facture' | 'prefinancement' | 'cautions' | 'pv-comite';  // ✅ Ajout PV comité
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;  // ✅ Couleur du département
}

const FormContratsDSE: React.FC<FormContratsDSEProps> = ({ 
  activityName, 
  contratType,
  onSave, 
  onCancel,
  departmentColor = '#CC0000'  // ✅ Défaut rouge DGE
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    MatriculeClient: '',
    Montant: 0,
    DateVersement: format(new Date(), 'yyyy-MM-dd'),
    Duree: 0,
    Observation: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,  // ✅ Seulement le nom de l'activité
        MatriculeClient: formData.MatriculeClient,
        Montant: formData.Montant,
        DateVersement: formData.DateVersement,
        Duree: formData.Duree,
        Observation: formData.Observation || undefined,
      };

      console.log('📤 Envoi de la requête Contrats:', {
        record,
        activityName,
        contratType
      });

      const result = await ContratsService.create(record);
      
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

  const getContratIcon = () => {
    switch (contratType) {
      case 'avance-facture': return '📄';
      case 'prefinancement': return '💰';
      case 'cautions': return '🛡️';
      case 'pv-comite': return '🚀';  // ✅ PV du comité de crédit (Projets)
      default: return '📋';
    }
  };

  const getContratLabel = () => {
    switch (contratType) {
      case 'avance-facture': return 'Avance sur Facture';
      case 'prefinancement': return 'Préfinancement';
      case 'cautions': return 'Cautions';
      case 'pv-comite': return 'PV du comité de crédit';  // ✅ Projets
      default: return contratType;
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
          {getContratIcon()}
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
              {getContratLabel()}
            </span>
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
          {/* Matricule Client */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontSize: '0.95rem',
            }}>
              Matricule Client <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.MatriculeClient}
              onChange={(e) => setFormData({ ...formData, MatriculeClient: e.target.value })}
              required
              placeholder="Exemple: CLI-12345"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = departmentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Montant */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontSize: '0.95rem',
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
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                if (e.currentTarget.value === '0') e.currentTarget.select();
              }}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Date Versement - avec calendrier */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontSize: '0.95rem',
            }}>
              Date de Versement <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={formData.DateVersement}
              onChange={(e) => setFormData({ ...formData, DateVersement: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = departmentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Durée */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontSize: '0.95rem',
            }}>
              Durée (mois) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.Duree === 0 ? '' : formData.Duree}
              onChange={(e) => setFormData({ ...formData, Duree: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="1"
              placeholder="0"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = departmentColor;
                if (e.currentTarget.value === '0') e.currentTarget.select();
              }}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          {/* Observations */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.5rem', 
              color: '#374151',
              fontSize: '0.95rem',
            }}>
              Observation (optionnel)
            </label>
            <textarea
              value={formData.Observation}
              onChange={(e) => setFormData({ ...formData, Observation: e.target.value })}
              rows={3}
              placeholder="Notes ou commentaires supplémentaires..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
                outline: 'none',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = departmentColor}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>
        </div>

        {/* Résumé responsive */}
        <div style={{
          marginTop: '2rem',
          padding: '1.25rem',
          backgroundColor: `${departmentColor}10`,
          borderRadius: '12px',
          border: `2px solid ${departmentColor}30`,
        }}>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem', fontWeight: '600' }}>
            📊 Résumé du Contrat
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '1rem',
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Matricule</p>
              <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: '600', color: '#1A1A1A', wordBreak: 'break-all' }}>
                {formData.MatriculeClient || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Montant</p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: '#10B981' }}>
                {formData.Montant.toLocaleString()} M
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Durée</p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: departmentColor }}>
                {formData.Duree} mois
              </p>
            </div>
          </div>
        </div>

        {/* Actions responsive */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row',
          gap: '1rem',
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid #E5E7EB',
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '0.875rem 2rem',
              border: '2px solid #E5E7EB',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.borderColor = '#9CA3AF';
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
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: departmentColor,
              color: '#FFFFFF',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1,
              boxShadow: loading ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </form>

      {/* Modal de succès responsive */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'slideIn 0.3s ease-out',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: '700', color: '#059669', marginBottom: '0.5rem' }}>
              Opération Réussie !
            </h3>
            <p style={{ color: '#6B7280', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
              Le contrat a été enregistré avec succès.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormContratsDSE;
