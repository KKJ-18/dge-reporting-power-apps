import React, { useState } from 'react';
import { ACTIVITY_NAMES } from '../../config/activityNames';
import { useObjectifValidation } from '../../hooks/useObjectifValidation';
import DossiersDetailsInput, { type DossierDetail } from './DossiersDetailsInput';
import './CreditClassiqueFormNew.css';

interface CreditClassiqueData {
  // Métadonnées
  dateRapport: string;
  
  // Dossiers présentés aux comités
  comitesNombre: number;
  comitesMontant: number;
  comitesDetails: DossierDetail[];
  
  // Notes de circulation
  notesNombre: number;
  notesMontant: number;
  notesDetails: DossierDetail[];
  
  // Dossiers en cours d'analyse
  analyseNombre: number;
  analyseMontant: number;
  analyseDetails: DossierDetail[];
  
  // Dossiers en attente avis risque
  risqueNombre: number;
  risqueMontant: number;
  risqueDetails: DossierDetail[];
  
  // Dossiers renvoyés
  renvoyesNombre: number;
  renvoyesMontant: number;
  renvoyesDetails: DossierDetail[];
  
  // Dossiers en attente conformité
  conformiteNombre: number;
  conformiteMontant: number;
  conformiteDetails: DossierDetail[];
  
  // Dossiers en attente comité crédit
  attenteComiteNombre: number;
  attenteComiteMontant: number;
  attenteComiteDetails: DossierDetail[];
  
  // Dossiers CONSEIL SCRG
  scrgNombre: number;
  scrgMontant: number;
  scrgDetails: DossierDetail[];
  scrgDateCC3?: string;
  scrgDateTransmission?: string;
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
    dateRapport: new Date().toISOString().split('T')[0],
    comitesNombre: 0,
    comitesMontant: 0,
    comitesDetails: [],
    notesNombre: 0,
    notesMontant: 0,
    notesDetails: [],
    analyseNombre: 0,
    analyseMontant: 0,
    analyseDetails: [],
    risqueNombre: 0,
    risqueMontant: 0,
    risqueDetails: [],
    renvoyesNombre: 0,
    renvoyesMontant: 0,
    renvoyesDetails: [],
    conformiteNombre: 0,
    conformiteMontant: 0,
    conformiteDetails: [],
    attenteComiteNombre: 0,
    attenteComiteMontant: 0,
    attenteComiteDetails: [],
    scrgNombre: 0,
    scrgMontant: 0,
    scrgDetails: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isValidating: isValidatingObjectif, validateBeforeSubmit } = useObjectifValidation();

  const handleChange = (field: keyof CreditClassiqueData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateRapport) {
      newErrors.dateRapport = 'La date du rapport est obligatoire';
    }

    // Validation des dossiers avec détails
    if (formData.comitesNombre > 0 && formData.comitesDetails.length !== formData.comitesNombre) {
      newErrors.comitesDetails = 'Veuillez remplir tous les détails des dossiers';
    }
    
    if (formData.notesNombre > 0 && formData.notesDetails.length !== formData.notesNombre) {
      newErrors.notesDetails = 'Veuillez remplir tous les détails des notes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const isValid = await validateBeforeSubmit(
      ACTIVITY_NAMES.CREDIT_CLASSIQUE,
      new Date(formData.dateRapport)
    );

    if (!isValid) return;
    onSave(formData, false);
  };

  const handleSaveDraft = () => {
    onSave(formData, true);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        {/* En-tête */}
        <div className="form-header">
          <h2>📊 Crédit Classique</h2>
          <div className="form-actions-header">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSaveDraft}
              disabled={readOnly}
            >
              💾 Brouillon
            </button>
          </div>
        </div>

        {/* Date du rapport */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📅 Informations générales</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Date du rapport *</label>
              <input
                type="date"
                value={formData.dateRapport}
                onChange={(e) => handleChange('dateRapport', e.target.value)}
                disabled={readOnly}
                required
              />
              {errors.dateRapport && <span className="error">{errors.dateRapport}</span>}
            </div>
          </div>
        </div>

        {/* Section 1: Dossiers présentés aux comités */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Dossiers présentés aux différents comités de crédit</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.comitesNombre || ''}
                onChange={(e) => handleChange('comitesNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 5"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.comitesNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.comitesNombre}
                activityType="comite"
                initialDetails={formData.comitesDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('comitesDetails', details);
                  handleChange('comitesMontant', montantTotal);
                }}
              />
            )}
            {errors.comitesDetails && <span className="error">{errors.comitesDetails}</span>}
          </div>
        </div>

        {/* Section 2: Notes de circulation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📝 Notes de circulation</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de notes</label>
              <input
                type="number"
                value={formData.notesNombre || ''}
                onChange={(e) => handleChange('notesNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 3"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.notesNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.notesNombre}
                activityType="note"
                initialDetails={formData.notesDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('notesDetails', details);
                  handleChange('notesMontant', montantTotal);
                }}
              />
            )}
            {errors.notesDetails && <span className="error">{errors.notesDetails}</span>}
          </div>
        </div>

        {/* Section 3: Dossiers en cours d'analyse */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔍 Dossiers en cours d'analyse</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.analyseNombre || ''}
                onChange={(e) => handleChange('analyseNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 2"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.analyseNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.analyseNombre}
                activityType="analyse"
                initialDetails={formData.analyseDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('analyseDetails', details);
                  handleChange('analyseMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Section 4: Dossiers en attente avis risque */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚠️ Dossiers en attente de l'avis de risque</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.risqueNombre || ''}
                onChange={(e) => handleChange('risqueNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 1"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.risqueNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.risqueNombre}
                activityType="risque"
                initialDetails={formData.risqueDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('risqueDetails', details);
                  handleChange('risqueMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Section 5: Dossiers renvoyés */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">↩️ Dossiers renvoyés</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.renvoyesNombre || ''}
                onChange={(e) => handleChange('renvoyesNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 2"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.renvoyesNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.renvoyesNombre}
                activityType="renvoye"
                initialDetails={formData.renvoyesDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('renvoyesDetails', details);
                  handleChange('renvoyesMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Section 6: Dossiers en attente conformité */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Dossiers en attente de l'avis de la conformité</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.conformiteNombre || ''}
                onChange={(e) => handleChange('conformiteNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 1"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.conformiteNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.conformiteNombre}
                activityType="conformite"
                initialDetails={formData.conformiteDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('conformiteDetails', details);
                  handleChange('conformiteMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Section 7: Dossiers en attente du comité de crédit */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏳ Dossiers en attente du comité de crédit</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Nombre de dossiers</label>
              <input
                type="number"
                value={formData.attenteComiteNombre || ''}
                onChange={(e) => handleChange('attenteComiteNombre', parseInt(e.target.value) || 0)}
                placeholder="Ex: 3"
                min="0"
                disabled={readOnly}
              />
            </div>

            {formData.attenteComiteNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.attenteComiteNombre}
                activityType="attente_comite"
                initialDetails={formData.attenteComiteDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('attenteComiteDetails', details);
                  handleChange('attenteComiteMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Section 8: Dossiers CONSEIL SCRG */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏛️ Dossiers CONSEIL en attente avis du SCRG</h3>
          </div>
          <div className="card-content">
            <div className="field-row">
              <div className="field-group">
                <label>Nombre de dossiers</label>
                <input
                  type="number"
                  value={formData.scrgNombre || ''}
                  onChange={(e) => handleChange('scrgNombre', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 1"
                  min="0"
                  disabled={readOnly}
                />
              </div>

              <div className="field-group">
                <label>Date du CC3</label>
                <input
                  type="date"
                  value={formData.scrgDateCC3 || ''}
                  onChange={(e) => handleChange('scrgDateCC3', e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="field-group">
                <label>Date de transmission au SCRG</label>
                <input
                  type="date"
                  value={formData.scrgDateTransmission || ''}
                  onChange={(e) => handleChange('scrgDateTransmission', e.target.value)}
                  disabled={readOnly}
                />
              </div>
            </div>

            {formData.scrgNombre > 0 && (
              <DossiersDetailsInput
                nombreDossiers={formData.scrgNombre}
                activityType="scrg"
                initialDetails={formData.scrgDetails}
                onDetailsChange={(details, montantTotal) => {
                  handleChange('scrgDetails', details);
                  handleChange('scrgMontant', montantTotal);
                }}
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSaveDraft}
            disabled={readOnly}
          >
            💾 Sauvegarder comme brouillon
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={readOnly || isValidatingObjectif}
          >
            {isValidatingObjectif ? '⏳ Vérification objectif...' : '✅ Soumettre le Rapport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreditClassiqueForm;
