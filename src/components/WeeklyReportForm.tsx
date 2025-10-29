import React, { useState } from 'react';

interface WeeklyReportFormProps {
  onSubmit: (data: WeeklyReportData) => void;
}

export interface WeeklyReportData {
  week: string;
  creditsClassiques: string;
  comitesCredit: string;
  creditsProgrammes: string;
  autresCredits: string;
  mepClassements: string;
  activiteNonPerformants: string;
  projetsInternes: string;
  observations: string;
}

const WeeklyReportForm: React.FC<WeeklyReportFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<WeeklyReportData>({
    week: new Date().toISOString().split('T')[0],
    creditsClassiques: '',
    comitesCredit: '',
    creditsProgrammes: '',
    autresCredits: '',
    mepClassements: '',
    activiteNonPerformants: '',
    projetsInternes: '',
    observations: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof WeeklyReportData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="content-section">
      <div className="card-header">
        <h2 className="card-title">🗓️ Saisie du Rapport Hebdomadaire</h2>
        <p style={{ color: 'var(--dge-dark-gray)', marginTop: '0.5rem' }}>
          Renseignez vos activités pour la semaine sélectionnée
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">📅 Semaine de reporting</label>
          <input
            type="week"
            className="form-input"
            value={formData.week}
            onChange={(e) => handleChange('week', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💰 Crédits Classiques</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Activités et réalisations</label>
              <textarea
                className="form-textarea"
                placeholder="Décrivez vos activités liées aux crédits classiques..."
                value={formData.creditsClassiques}
                onChange={(e) => handleChange('creditsClassiques', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🏛️ Comités de Crédit</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Participations et décisions</label>
              <textarea
                className="form-textarea"
                placeholder="Détaillez votre participation aux comités de crédit..."
                value={formData.comitesCredit}
                onChange={(e) => handleChange('comitesCredit', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎯 Crédits Programmes</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Gestion des programmes spéciaux</label>
              <textarea
                className="form-textarea"
                placeholder="Renseignez vos activités sur les crédits programmes..."
                value={formData.creditsProgrammes}
                onChange={(e) => handleChange('creditsProgrammes', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📋 Autres Crédits</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Autres types de crédit</label>
              <textarea
                className="form-textarea"
                placeholder="Décrivez les autres activités crédit..."
                value={formData.autresCredits}
                onChange={(e) => handleChange('autresCredits', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⭐ MEP et Classements</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Mise en place et classements</label>
              <textarea
                className="form-textarea"
                placeholder="Détaillez vos activités MEP et classements..."
                value={formData.mepClassements}
                onChange={(e) => handleChange('mepClassements', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚠️ Prêts Non Performants</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Activité de recouvrement</label>
              <textarea
                className="form-textarea"
                placeholder="Renseignez vos activités sur les prêts non performants..."
                value={formData.activiteNonPerformants}
                onChange={(e) => handleChange('activiteNonPerformants', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">🏢 Projets et Activités Internes</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Projets, résolutions et autres activités</label>
            <textarea
              className="form-textarea"
              placeholder="Décrivez vos projets internes, résolutions, et autres activités..."
              value={formData.projetsInternes}
              onChange={(e) => handleChange('projetsInternes', e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">💭 Observations et Commentaires</h3>
          </div>
          <div className="form-group">
            <label className="form-label">Remarques particulières</label>
            <textarea
              className="form-textarea"
              placeholder="Ajoutez vos observations, difficultés rencontrées, suggestions..."
              value={formData.observations}
              onChange={(e) => handleChange('observations', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button type="button" className="btn btn-outline">
            💾 Sauvegarder Brouillon
          </button>
          <button type="submit" className="btn btn-primary">
            ✅ Valider et Soumettre
          </button>
        </div>
      </form>
    </div>
  );
};

export default WeeklyReportForm;