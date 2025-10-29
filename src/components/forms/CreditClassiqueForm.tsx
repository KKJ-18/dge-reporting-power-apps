import React, { useState, useEffect } from 'react';

interface CreditClassiqueData {
  // Dossiers reçus
  dossiersRecusNombre: number;
  dossiersRecusMontant: number;
  dossiersRecusDate: string;
  
  // Dossiers présentés comités
  comiteType: string;
  comiteNombre: number;
  comiteMontant: number;
  
  // FAR
  farNombre: number;
  farMontant: number;
  
  // Notes de circulation
  notesNombre: number;
  notesMontant: number;
  
  // Dossiers en cours d'analyse
  analyseNombre: number;
  analyseMontant: number;
  
  // Dossiers en attente avis risque
  risqueNombre: number;
  risqueMontant: number;
  
  // Dossiers en attente conformité
  conformiteNombre: number;
  conformiteMontant: number;
  
  // Suivi régularisation
  regularisationAgence: string;
  regularisationNombre: number;
  regularisationMontant: number;
}

interface CreditClassiqueFormProps {
  onSave: (data: CreditClassiqueData, isDraft: boolean) => void;
  initialData?: Partial<CreditClassiqueData>;
  readOnly?: boolean;
}

const CreditClassiqueForm: React.FC<CreditClassiqueFormProps> = ({ 
  onSave, 
  initialData, 
  readOnly = false 
}) => {
  const [formData, setFormData] = useState<CreditClassiqueData>({
    dossiersRecusNombre: 0,
    dossiersRecusMontant: 0,
    dossiersRecusDate: new Date().toISOString().split('T')[0],
    comiteType: '',
    comiteNombre: 0,
    comiteMontant: 0,
    farNombre: 0,
    farMontant: 0,
    notesNombre: 0,
    notesMontant: 0,
    analyseNombre: 0,
    analyseMontant: 0,
    risqueNombre: 0,
    risqueMontant: 0,
    conformiteNombre: 0,
    conformiteMontant: 0,
    regularisationAgence: '',
    regularisationNombre: 0,
    regularisationMontant: 0,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!readOnly) {
      const interval = setInterval(() => {
        setAutoSaveStatus('saving');
        onSave(formData, true);
        setTimeout(() => setAutoSaveStatus('saved'), 500);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [formData, onSave, readOnly]);

  const handleChange = (field: keyof CreditClassiqueData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setAutoSaveStatus('unsaved');
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validation: Si montant > 0, nombre doit être > 0
    if (formData.dossiersRecusMontant > 0 && formData.dossiersRecusNombre === 0) {
      newErrors.dossiersRecusNombre = 'Nombre de dossiers requis si montant > 0';
    }
    
    if (formData.comiteMontant > 0 && formData.comiteNombre === 0) {
      newErrors.comiteNombre = 'Nombre de dossiers requis si montant > 0';
    }
    
    if (formData.comiteNombre > 0 && !formData.comiteType) {
      newErrors.comiteType = 'Type de comité requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData, false);
    }
  };

  const handleSaveDraft = () => {
    onSave(formData, true);
    setAutoSaveStatus('saved');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateDelais = () => {
    // Simulation de calcul de délais
    // En production, ces données viendraient de SharePoint/BI
    return {
      delaiMoyenDCE: 5,
      delaiMoyenTotal: 8
    };
  };

  const delais = calculateDelais();

  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">💰 Crédit Classique</h1>
            <p className="page-subtitle">
              Saisie des dossiers, comités, FAR et notes de circulation
            </p>
          </div>
          
          <div className="page-actions">
            <div style={{
              padding: '0.5rem 1rem',
              background: autoSaveStatus === 'saved' ? '#E8F5E9' : 
                          autoSaveStatus === 'saving' ? '#FFF3E0' : '#FFEBEE',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: autoSaveStatus === 'saved' ? '#00C853' : 
                     autoSaveStatus === 'saving' ? '#FF6F00' : '#D32F2F'
            }}>
              {autoSaveStatus === 'saved' ? '✅ Sauvegardé' : 
               autoSaveStatus === 'saving' ? '⏳ Sauvegarde...' : '⚠️ Non sauvegardé'}
            </div>
          </div>
        </div>

        {/* Indicateurs calculés */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1) 0%, rgba(204, 0, 0, 0.05) 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #CC0000'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Délai Moyen DCE
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#CC0000' }}>
              {delais.delaiMoyenDCE} jours
            </div>
          </div>

          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1) 0%, rgba(204, 0, 0, 0.05) 100%)',
            borderRadius: '12px',
            borderLeft: '4px solid #CC0000'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
              Délai Moyen Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#CC0000' }}>
              {delais.delaiMoyenTotal} jours
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Dossiers reçus */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-title">
              <div className="form-section-icon">📥</div>
              Dossiers Reçus
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.dossiersRecusNombre}
                onChange={(e) => handleChange('dossiersRecusNombre', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              {errors.dossiersRecusNombre && (
                <div className="form-error">⚠️ {errors.dossiersRecusNombre}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Montant total (FCFA)</label>
              <input
                type="number"
                className="form-input"
                value={formData.dossiersRecusMontant}
                onChange={(e) => handleChange('dossiersRecusMontant', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              <div className="form-helper">
                {formatCurrency(formData.dossiersRecusMontant)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date de réception</label>
              <input
                type="date"
                className="form-input"
                value={formData.dossiersRecusDate}
                onChange={(e) => handleChange('dossiersRecusDate', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dossiers présentés comités */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-title">
              <div className="form-section-icon">🏛️</div>
              Dossiers Présentés en Comité
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Type de comité</label>
              <select
                className="form-select"
                value={formData.comiteType}
                onChange={(e) => handleChange('comiteType', e.target.value)}
                disabled={readOnly}
              >
                <option value="">Sélectionnez...</option>
                <option value="CC1">CC1</option>
                <option value="CC2">CC2</option>
                <option value="CC3">CC3</option>
                <option value="CC4">CC4</option>
                <option value="CCCA">CCCA</option>
              </select>
              {errors.comiteType && (
                <div className="form-error">⚠️ {errors.comiteType}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.comiteNombre}
                onChange={(e) => handleChange('comiteNombre', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              {errors.comiteNombre && (
                <div className="form-error">⚠️ {errors.comiteNombre}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (FCFA)</label>
              <input
                type="number"
                className="form-input"
                value={formData.comiteMontant}
                onChange={(e) => handleChange('comiteMontant', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              <div className="form-helper">
                {formatCurrency(formData.comiteMontant)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: FAR */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-title">
              <div className="form-section-icon">📄</div>
              FAR (Fiche d'Analyse de Risque)
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.farNombre}
                onChange={(e) => handleChange('farNombre', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (FCFA)</label>
              <input
                type="number"
                className="form-input"
                value={formData.farMontant}
                onChange={(e) => handleChange('farMontant', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              <div className="form-helper">
                {formatCurrency(formData.farMontant)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes de circulation */}
        <div className="form-section">
          <div className="form-section-header">
            <div className="form-section-title">
              <div className="form-section-icon">📝</div>
              Notes de Circulation
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre de notes</label>
              <input
                type="number"
                className="form-input"
                value={formData.notesNombre}
                onChange={(e) => handleChange('notesNombre', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (FCFA)</label>
              <input
                type="number"
                className="form-input"
                value={formData.notesMontant}
                onChange={(e) => handleChange('notesMontant', parseInt(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
              />
              <div className="form-helper">
                {formatCurrency(formData.notesMontant)}
              </div>
            </div>
          </div>
        </div>

        {/* Sections restantes dans le même format... */}
        
        {/* Boutons d'action */}
        {!readOnly && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={handleSaveDraft}
            >
              💾 Sauvegarder Brouillon
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
            >
              ✅ Soumettre le Rapport
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreditClassiqueForm;