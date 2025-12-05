import React, { useState } from 'react';
import { RechercherClientAnomalieService } from '../../services/RechercherClientAnomalieService';
import { 
  CommonFormLayout, 
  FormSection, 
  FormField, 
  FormSummary,
  SuccessModal,
  ActivityIcons 
} from './CommonFormLayout';


interface Props { 
  activityName: string; 
  specificType: string; 
  departmentColor?: string; 
  onClose: () => void; 
  onSave: () => void; 
}

const FormRechercherClientAnomalieModern: React.FC<Props> = ({ 
  activityName, 
  specificType,
  departmentColor = '#990000', 
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    NbreClientAnomalie: 0,
    NbreClientRetrouve: 0,
    NbreClientContacte: 0,
    NbreClientAyantRepondu: 0,
    NbreClientCooperatif: 0,
    DateVersement: '',
    MontantVersement: 0,
    NbreClientAyantDemandeRestructur: 0,
    MontantGlobalEngagement: 0,
    VolumeAnomalie: 0,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const record = {
        Title: activityName,
        NbreClientAnomalie: formData.NbreClientAnomalie,
        NbreClientRetrouve: formData.NbreClientRetrouve,
        NbreClientContacte: formData.NbreClientContacte,
        NbreClientAyantRepondu: formData.NbreClientAyantRepondu,
        NbreClientCooperatif: formData.NbreClientCooperatif,
        DateVersement: formData.DateVersement || undefined,
        MontantVersement: formData.MontantVersement,
        NbreClientAyantDemandeRestructur: formData.NbreClientAyantDemandeRestructur,
        MontantGlobalEngagement: formData.MontantGlobalEngagement,
        VolumeAnomalie: formData.VolumeAnomalie,
      };

      console.log('📤 Envoi RechercherClientAnomalie vers SharePoint:', record);

      await RechercherClientAnomalieService.create(record);
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
      <SuccessModal
        title="Enregistrement réussi"
        message="Recherche client anomalie enregistrée"
        departmentColor={departmentColor}
      />
    );
  }

  return (
    <CommonFormLayout
      icon={ActivityIcons.recherche}
      title={activityName}
      badge={specificType}
      departmentColor={departmentColor}
      onCancel={onClose}
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      {/* Section: Statistiques clients */}
      <FormSection icon="👥" title="Statistiques clients">
        <div className="common-form-grid-2">
          <FormField label="Nombre de clients en anomalies" required>
            <input
              type="number"
              value={formData.NbreClientAnomalie === 0 ? '' : formData.NbreClientAnomalie}
              onChange={(e) => setFormData({ ...formData, NbreClientAnomalie: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Nombre de clients retrouvés" required>
            <input
              type="number"
              value={formData.NbreClientRetrouve === 0 ? '' : formData.NbreClientRetrouve}
              onChange={(e) => setFormData({ ...formData, NbreClientRetrouve: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Nombre de clients contactés" required>
            <input
              type="number"
              value={formData.NbreClientContacte === 0 ? '' : formData.NbreClientContacte}
              onChange={(e) => setFormData({ ...formData, NbreClientContacte: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Nombre de clients ayant répondu" required>
            <input
              type="number"
              value={formData.NbreClientAyantRepondu === 0 ? '' : formData.NbreClientAyantRepondu}
              onChange={(e) => setFormData({ ...formData, NbreClientAyantRepondu: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField 
            label="Nombre de clients coopératifs" 
            required
            hint="Lettre d'engagement signée"
          >
            <input
              type="number"
              value={formData.NbreClientCooperatif === 0 ? '' : formData.NbreClientCooperatif}
              onChange={(e) => setFormData({ ...formData, NbreClientCooperatif: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Demandes de restructuration" required>
            <input
              type="number"
              value={formData.NbreClientAyantDemandeRestructur === 0 ? '' : formData.NbreClientAyantDemandeRestructur}
              onChange={(e) => setFormData({ ...formData, NbreClientAyantDemandeRestructur: parseInt(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>
        </div>
      </FormSection>

      {/* Section: Informations financières */}
      <FormSection icon="💰" title="Informations financières">
        <div className="common-form-grid-2">
          <FormField label="Date de versement">
            <input
              type="date"
              value={formData.DateVersement}
              onChange={(e) => setFormData({ ...formData, DateVersement: e.target.value })}
              className="common-form-input"
            />
          </FormField>

          <FormField label="Montant versement (FCFA)" required>
            <input
              type="number"
              value={formData.MontantVersement === 0 ? '' : formData.MontantVersement}
              onChange={(e) => setFormData({ ...formData, MontantVersement: parseFloat(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Montant global des engagements (FCFA)" required>
            <input
              type="number"
              value={formData.MontantGlobalEngagement === 0 ? '' : formData.MontantGlobalEngagement}
              onChange={(e) => setFormData({ ...formData, MontantGlobalEngagement: parseFloat(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField 
            label="Volume des anomalies (FCFA)" 
            required
            hint="Agios + impayés"
          >
            <input
              type="number"
              value={formData.VolumeAnomalie === 0 ? '' : formData.VolumeAnomalie}
              onChange={(e) => setFormData({ ...formData, VolumeAnomalie: parseFloat(e.target.value) || 0 })}
              className="common-form-input"
              required
            />
          </FormField>
        </div>
      </FormSection>

      {/* Résumé */}
      <FormSummary
        items={[
          { label: 'Clients anomalies', value: formData.NbreClientAnomalie },
          { label: 'Retrouvés', value: formData.NbreClientRetrouve },
          { label: 'Contactés', value: formData.NbreClientContacte },
          { label: 'Ont répondu', value: formData.NbreClientAyantRepondu },
          { label: 'Coopératifs', value: formData.NbreClientCooperatif },
          { label: 'Restructurations', value: formData.NbreClientAyantDemandeRestructur },
          { label: 'Versement', value: `${formData.MontantVersement.toLocaleString()} FCFA` },
          { label: 'Engagements', value: `${formData.MontantGlobalEngagement.toLocaleString()} FCFA` },
          { label: 'Volume anomalies', value: `${formData.VolumeAnomalie.toLocaleString()} FCFA` },
        ]}
      />
    </CommonFormLayout>
  );
};

export default FormRechercherClientAnomalieModern;
