import React, { useState } from 'react';
import { AnalyseDelaisCreditService } from '../../services/AnalyseDelaisCreditService';
import '../../styles/forms.css';

interface FormDelaisCreditClassiqueProps {
  activityName: string;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  delaiMoyenDceJour: number;
  delaiMoyenUniteJour: number;
  delaiMoyenDrisqueJour: number;
  delaiMoyenDconfJour: number;
  delaiMoyenChaineJour: number;
}

/**
 * Formulaire pour "Évaluation délai moyen crédit classique"
 * Champs : Délai moyen DCE, Unité, D.Risque, D.Conf, Chaîne (tous en jours)
 */
const FormDelaisCreditClassique: React.FC<FormDelaisCreditClassiqueProps> = ({
  activityName,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<FormData>({
    delaiMoyenDceJour: 0,
    delaiMoyenUniteJour: 0,
    delaiMoyenDrisqueJour: 0,
    delaiMoyenDconfJour: 0,
    delaiMoyenChaineJour: 0
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculer le délai moyen sur la chaîne automatiquement
  const calculerDelaiChaine = () => {
    return (
      formData.delaiMoyenDceJour +
      formData.delaiMoyenUniteJour +
      formData.delaiMoyenDrisqueJour +
      formData.delaiMoyenDconfJour
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await AnalyseDelaisCreditService.create({
        Title: activityName,
        DelaiMoyenDceJour: formData.delaiMoyenDceJour,
        DelaiMoyenUniteJour: formData.delaiMoyenUniteJour,
        DelaiMoyenDrisqueJour: formData.delaiMoyenDrisqueJour,
        DelaiMoyenDconfJour: formData.delaiMoyenDconfJour,
        DelaiMoyenChaineJour: calculerDelaiChaine()
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">⏱️ {activityName}</h2>
        <p className="form-subtitle">Évaluation des délais moyens (en jours)</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Délais moyens par service</h3>
          </div>
          <div className="card-content">
            <div className="field-group">
              <label>Délai moyen analyste DCE (en jours)</label>
              <input
                type="number"
                value={formData.delaiMoyenDceJour || ''}
                onChange={(e) => handleChange('delaiMoyenDceJour', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 3"
                min="0"
                step="0.1"
              />
              <small className="field-hint">
                Temps moyen de traitement par les analystes DCE
              </small>
            </div>

            <div className="field-group">
              <label>Délai moyen de traitement unité (en jours)</label>
              <input
                type="number"
                value={formData.delaiMoyenUniteJour || ''}
                onChange={(e) => handleChange('delaiMoyenUniteJour', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 2"
                min="0"
                step="0.1"
              />
              <small className="field-hint">
                Temps moyen de traitement par l'unité
              </small>
            </div>

            <div className="field-group">
              <label>Délai moyen traitement D.Risque (en jours)</label>
              <input
                type="number"
                value={formData.delaiMoyenDrisqueJour || ''}
                onChange={(e) => handleChange('delaiMoyenDrisqueJour', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 1.5"
                min="0"
                step="0.1"
              />
              <small className="field-hint">
                Temps moyen de traitement par la Direction des Risques
              </small>
            </div>

            <div className="field-group">
              <label>Délai moyen de traitement D.Conf (en jours)</label>
              <input
                type="number"
                value={formData.delaiMoyenDconfJour || ''}
                onChange={(e) => handleChange('delaiMoyenDconfJour', parseFloat(e.target.value) || 0)}
                placeholder="Ex: 1"
                min="0"
                step="0.1"
              />
              <small className="field-hint">
                Temps moyen de traitement par la Conformité
              </small>
            </div>

            <div className="field-group" style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '6px' }}>
              <label style={{ color: '#0078d4', fontSize: '15px', fontWeight: '600' }}>
                Délai de traitement moyen sur la chaîne (calculé automatiquement)
              </label>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0078d4', marginTop: '10px' }}>
                {calculerDelaiChaine().toFixed(1)} jours
              </div>
              <small className="field-hint">
                Somme de tous les délais moyens ci-dessus
              </small>
            </div>
          </div>
        </div>

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

export default FormDelaisCreditClassique;
