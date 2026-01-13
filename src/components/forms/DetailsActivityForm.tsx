import React, { useState } from 'react';
import { AnalyseDossiersComitesService } from '../../services/AnalyseDossiersComitesService';
import { SituationMEPService } from '../../services/SituationMEPService';
import { AccordsService } from '../../services/AccordsService';
import { ContratsService } from '../../services/ContratsService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import DossiersDetailsInput, { DossierDetail } from './DossiersDetailsInput';
import '../../styles/forms.css';

interface DetailsActivityFormProps {
  activityName: string;
  activityType: 'comite' | 'note' | 'analyse' | 'risque' | 'renvoye' | 'conformite' | 'attente_comite' | 'scrg' | 'recus' | 'transmission' | 'regularisation' | 'admin_engagement' | 'suivi_mep' | 'situation_mep_dse' | 'accords_dse' | 'contrats_dse';
  icon?: string;
  subtitle?: string;
  hasTypeComite?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  dateReception: string;
  nombreDossiers: number;
  typeComite?: string;
  details: DossierDetail[];
  montantTotal: number;
}

/**
 * Formulaire avec détails pour les activités utilisant:
 * - analyse_dossiers_comites (table principale)
 * - analyse_details_dossiers (détails des dossiers)
 * 
 * Utilisé par: Comités, Notes circulation, En cours analyse, Attente risque,
 * Renvoyés, Attente conformité, Attente comité
 */
const DetailsActivityForm: React.FC<DetailsActivityFormProps> = ({
  activityName,
  activityType,
  icon = '📄',
  subtitle = 'Saisie du nombre et détails des dossiers',
  hasTypeComite = false,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    dateReception: new Date().toISOString().split('T')[0],
    nombreDossiers: 0,
    typeComite: hasTypeComite ? 'CC1' : undefined,
    details: [],
    montantTotal: 0
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDetailsChange = (details: DossierDetail[], montantTotal: number) => {
    setFormData(prev => ({
      ...prev,
      details,
      montantTotal
    }));
  };

  const generateReference = (): string => {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${activityType.toUpperCase()}-${date}-${time}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      // Générer une référence unique pour lier les 2 tables
      const reference = generateReference();

      // 1. Déterminer le service à utiliser selon le type d'activité
      let mainResult: any;
      
      if (activityType === 'situation_mep_dse') {
        // DSE - Situation MEP (a maintenant Reference)
        const mainData = {
          Title: activityName,
          Nombre: formData.nombreDossiers,
          Montant: formData.montantTotal,
          DateMep: formData.dateReception,
          Pourcentage: 0,
          Reference: reference
        };
        mainResult = await SituationMEPService.create(mainData);
        
      } else if (activityType === 'accords_dse') {
        // DSE - Accords (a déjà Reference)
        const mainData = {
          Title: activityName,
          Matricule: '', // Sera rempli par les détails individuels
          Statut: { Value: 'En cours' },
          MontanPret: formData.montantTotal,
          MontantDemande: formData.montantTotal,
          MontantAccorde: 0,
          Reference: reference
        };
        mainResult = await AccordsService.create(mainData);
        
      } else if (activityType === 'contrats_dse') {
        // DSE - Contrats (a maintenant Reference)
        const mainData = {
          Title: activityName,
          Montant: formData.montantTotal,
          DateVersement: formData.dateReception,
          Duree: 0,
          Reference: reference
        };
        mainResult = await ContratsService.create(mainData);
        
      } else {
        // DA - Toutes les autres activités
        const mainData: any = {
          Title: activityName,
          Nombre: formData.nombreDossiers,
          Montant: formData.montantTotal,
          DateReception: formData.dateReception,
          Reference: reference
        };

        if (hasTypeComite && formData.typeComite) {
          mainData.TypeComite = formData.typeComite;
        }

        mainResult = await AnalyseDossiersComitesService.create(mainData);
      }

      // Vérifier si la sauvegarde a réussi (gère différents formats de réponse)
      if (mainResult && typeof mainResult === 'object' && 'succeeded' in mainResult && !mainResult.succeeded) {
        throw new Error('Échec de sauvegarde principale');
      }
      if (mainResult && typeof mainResult === 'object' && 'success' in mainResult && !mainResult.success) {
        throw new Error('Échec de sauvegarde principale');
      }

      // 2. Sauvegarder les détails dans analyse_details_dossiers
      if (formData.details && formData.details.length > 0) {
        for (const detail of formData.details) {
          await DetailsDossiersService.create({
            Title: activityName,
            NomClient: detail.nomClient,
            Matricule: detail.matricule,
            MontantSollicite: detail.montantSollicite,
            Decision: detail.Decision || '',
            DetailDecision: detail.detailDecision || '',
            ObjetCommentaire: detail.objetCommentaire || '',
            Commentaire: detail.commentaire || '',
            Comite: detail.comite || '',
            Reference: reference,
            Date: formData.dateReception
          });
        }
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">{icon} {activityName}</h2>
        <p className="form-subtitle">{subtitle}</p>
        {formData.montantTotal > 0 && (
          <div className="montant-total-badge">
            Montant Total: {formData.montantTotal.toLocaleString('fr-FR')} FCFA
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Informations générales */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">ℹ️ Informations générales</h3>
          </div>
          <div className="card-content">
            <div className="field-row">
              <div className="field-group">
                <label>Date de réception *</label>
                <input
                  type="date"
                  value={formData.dateReception}
                  onChange={(e) => handleChange('dateReception', e.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label>Nombre de dossiers *</label>
                <input
                  type="number"
                  value={formData.nombreDossiers || ''}
                  onChange={(e) => handleChange('nombreDossiers', parseInt(e.target.value) || 0)}
                  placeholder="Nombre"
                  min="0"
                  required
                />
              </div>

              <div className="field-group">
                <label>Montant total (CFA) {formData.details?.length > 0 && '(calculé auto)'}</label>
                <input
                  type="number"
                  value={formData.montantTotal || ''}
                  onChange={(e) => handleChange('montantTotal', parseFloat(e.target.value) || 0)}
                  placeholder="Entrez le montant"
                  min="0"
                  disabled={formData.details?.length > 0}
                  style={formData.details?.length > 0 ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                />
              </div>

              {hasTypeComite && (
                <div className="field-group">
                  <label>Type de comité *</label>
                  <select
                    value={formData.typeComite}
                    onChange={(e) => handleChange('typeComite', e.target.value)}
                    required
                  >
                    <option value="CC1">CC1</option>
                    <option value="CC2">CC2</option>
                    <option value="CC3">CC3</option>
                    <option value="CC4">CC4</option>
                    <option value="CCCA">CCCA</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Détails des dossiers (optionnel) */}
        {formData.nombreDossiers > 0 && (
          <details style={{ marginBottom: '20px' }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 600, 
              color: '#2563eb',
              padding: '12px 16px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              📝 Saisir les détails de chaque dossier (optionnel)
            </summary>
            <div style={{ marginTop: '12px' }}>
              <DossiersDetailsInput
                nombreDossiers={formData.nombreDossiers}
                activityType={activityType}
                initialDetails={formData.details}
                onDetailsChange={handleDetailsChange}
              />
            </div>
          </details>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Envoi...' : '✓ Soumettre'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h3>Succès !</h3>
            <p>Les données ont été enregistrées</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsActivityForm;
