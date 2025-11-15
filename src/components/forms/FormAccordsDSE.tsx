import React, { useState } from 'react';
import { AccordsService } from '../../services/AccordsService';
import CloseButton from '../CloseButton';

interface FormAccordsDSEProps {
  activityName: string;
  accordType: 'autorisation-mobilisation' | 'accords-classement' | 'accords-liste';
  onSave: () => void;
  onCancel: () => void;
  departmentColor?: string;  // ✅ Couleur du département
}

const FormAccordsDSE: React.FC<FormAccordsDSEProps> = ({ 
  activityName, 
  accordType,
  onSave, 
  onCancel,
  departmentColor = '#CC0000'  // ✅ Défaut rouge DGE
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Matricule: '',
    Statut: 'Representer',  // Valeur par défaut SharePoint
    MontanPret: 0,
    MontantDemande: 0,
    MontantAccorde: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Conversion du statut - utiliser les valeurs exactes de SharePoint
      const record = {
        Title: activityName,  // ✅ Seulement le nom de l'activité
        Matricule: formData.Matricule,
        Statut: { Value: formData.Statut },  // ✅ Format Choice SharePoint
        MontanPret: formData.MontanPret,
        MontantDemande: formData.MontantDemande,
        MontantAccorde: formData.MontantAccorde,
      };

      console.log('📤 Envoi de la requête Accords:', {
        record,
        activityName,
        accordType
      });

      const result = await AccordsService.create(record);
      
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

  const getAccordIcon = () => {
    switch (accordType) {
      case 'autorisation-mobilisation': return '📝';
      case 'accords-classement': return '📊';
      case 'accords-liste': return '📋';
      default: return '📄';
    }
  };

  const getAccordLabel = () => {
    switch (accordType) {
      case 'autorisation-mobilisation': return 'Autorisation Individuelle de Mobilisation';
      case 'accords-classement': return 'Accords de Classement';
      case 'accords-liste': return 'Accords sur Liste';
      default: return accordType;
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
          {getAccordIcon()}
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
              {getAccordLabel()}
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
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Matricule Client <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.Matricule}
              onChange={(e) => setFormData({ ...formData, Matricule: e.target.value })}
              required
              placeholder="Exemple: CLI-12345"
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
          </div>

          {/* Statut */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Statut <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={formData.Statut}
              onChange={(e) => setFormData({ ...formData, Statut: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '2px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '1rem',
                backgroundColor: '#FAFAFA',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
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
              <option value="Approuver">Approuver</option>
              <option value="Rejeter">Rejeter</option>
              <option value="Representer">Representer</option>
            </select>
          </div>

          {/* Montant Prêt */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Montant du Prêt (FCFA) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.MontanPret === 0 ? '' : formData.MontanPret}
              onChange={(e) => setFormData({ ...formData, MontanPret: parseFloat(e.target.value) || 0 })}
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

          {/* Montant Demandé */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Montant Demandé (millions FCFA) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.MontantDemande === 0 ? '' : formData.MontantDemande}
              onChange={(e) => setFormData({ ...formData, MontantDemande: parseFloat(e.target.value) || 0 })}
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

          {/* Montant Accordé */}
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              marginBottom: '0.75rem', 
              color: '#111827',
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
            }}>
              Montant Accordé (millions FCFA) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.MontantAccorde === 0 ? '' : formData.MontantAccorde}
              onChange={(e) => setFormData({ ...formData, MontantAccorde: parseFloat(e.target.value) || 0 })}
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
            📊 Résumé
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '1rem',
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Demandé</p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: '#1A1A1A' }}>
                {formData.MontantDemande.toLocaleString()} M
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Accordé</p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: '#10B981' }}>
                {formData.MontantAccorde.toLocaleString()} M
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>Taux d'accord</p>
              <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: departmentColor }}>
                {formData.MontantDemande > 0 
                  ? ((formData.MontantAccorde / formData.MontantDemande) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Actions ultra modernes */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row',
          gap: '1rem',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: `3px solid ${departmentColor}20`,
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
              opacity: loading ? 0.5 : 1,
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
              opacity: loading ? 0.7 : 1,
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
              L'accord a été enregistré avec succès.
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

export default FormAccordsDSE;
