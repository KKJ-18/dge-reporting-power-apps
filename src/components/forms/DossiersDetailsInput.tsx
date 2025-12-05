import React, { useState, useEffect } from 'react';

export interface DossierDetail {
  nomClient: string;
  matricule: string;
  montantSollicite: number;
  Decision?: string; // Correspond au champ SharePoint (capital D)
  detailDecision?: string;
  objetCommentaire?: string;
  commentaire?: string;
  comite?: string; // Pour SCRG
}

interface DossiersDetailsInputProps {
  nombreDossiers: number;
  onDetailsChange: (details: DossierDetail[], montantTotal: number) => void;
  activityType: 'comite' | 'note' | 'analyse' | 'risque' | 'renvoye' | 'conformite' | 'attente_comite' | 'scrg';
  initialDetails?: DossierDetail[];
}

const DossiersDetailsInput: React.FC<DossiersDetailsInputProps> = ({
  nombreDossiers,
  onDetailsChange,
  activityType,
  initialDetails = []
}) => {
  const [dossiers, setDossiers] = useState<DossierDetail[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialiser ou ajuster le nombre de dossiers
  useEffect(() => {
    // Initialisation unique avec initialDetails
    if (!initialized && initialDetails.length > 0) {
      setDossiers(initialDetails);
      setInitialized(true);
      return;
    }

    // Ajuster le nombre de dossiers selon nombreDossiers
    setDossiers(prevDossiers => {
      if (prevDossiers.length === nombreDossiers) {
        return prevDossiers; // Pas de changement
      }

      const newDossiers: DossierDetail[] = [];
      for (let i = 0; i < nombreDossiers; i++) {
        // Conserver les données existantes si disponibles
        if (i < prevDossiers.length) {
          newDossiers.push(prevDossiers[i]);
        } else {
          // Créer un nouveau dossier vide
          newDossiers.push({
            nomClient: '',
            matricule: '',
            montantSollicite: 0,
            Decision: '',
            detailDecision: '',
            objetCommentaire: '',
            commentaire: '',
            comite: ''
          });
        }
      }
      return newDossiers;
    });
  }, [nombreDossiers, initialDetails, initialized]);

  // Calculer le montant total et notifier le parent
  useEffect(() => {
    const montantTotal = dossiers.reduce((sum, d) => sum + (d.montantSollicite || 0), 0);
    onDetailsChange(dossiers, montantTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossiers]);

  const updateDossier = (index: number, field: keyof DossierDetail, value: string | number) => {
    const updated = [...dossiers];
    updated[index] = { ...updated[index], [field]: value };
    setDossiers(updated);
  };

  const getDecisionOptions = () => {
    switch (activityType) {
      case 'comite':
      case 'renvoye':
      case 'conformite':
      case 'attente_comite':
        return ['Accord', 'Avis favorable', 'A représenter', 'Stand by', 'Rejet'];
      case 'note':
        return ['Accord', 'Rejeter'];
      case 'scrg':
        return ['Accord', 'Avis favorable', 'A représenter', 'Stand by', 'Rejet'];
      default:
        return [];
    }
  };

  const getComiteOptions = () => {
    return ['CC1', 'CC2', 'CC3', 'CC4', 'CCCA', 'SCRG'];
  };

  const showDecision = ['comite', 'note', 'scrg'].includes(activityType);
  const showComite = ['scrg'].includes(activityType);

  if (nombreDossiers === 0) {
    return (
      <div className="no-dossiers">
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
          Aucun dossier à saisir
        </div>
        <div style={{ fontSize: '13px', color: '#6c757d' }}>
          Veuillez d'abord saisir le nombre de dossiers ci-dessus
        </div>
      </div>
    );
  }

  // Calculer le montant total en temps réel
  const montantTotal = dossiers.reduce((sum, d) => sum + (d.montantSollicite || 0), 0);

  return (
    <div className="dossiers-details-container">
      <div className="dossiers-header-with-total">
        <h4>📋 Détails des {nombreDossiers} dossier(s)</h4>
        <div className="montant-total-header">
          <span className="montant-label">Montant Total:</span>
          <span className="montant-value-header">
            {montantTotal.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>
      
      <div className="dossiers-list">
        {dossiers.map((dossier, index) => (
          <div key={index} className="dossier-card">
            <div className="dossier-header">
              <h5>Dossier {index + 1}</h5>
            </div>
            
            <div className="dossier-fields">
              <div className="field-row">
                <div className="field-group">
                  <label>Nom client *</label>
                  <input
                    type="text"
                    value={dossier.nomClient}
                    onChange={(e) => updateDossier(index, 'nomClient', e.target.value)}
                    placeholder="Ex: SARL EXAMPLE"
                    required
                  />
                </div>

                <div className="field-group">
                  <label>Matricule (7 chiffres) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dossier.matricule}
                    onChange={(e) => {
                      // Garder seulement les chiffres et limiter à 7 caractères
                      const value = e.target.value.replace(/\D/g, '').slice(0, 7);
                      updateDossier(index, 'matricule', value);
                    }}
                    placeholder="Ex: 0123456"
                    maxLength={7}
                    pattern="[0-9]{7}"
                    required
                  />
                  <small style={{ color: '#6c757d', fontSize: '11px' }}>
                    {dossier.matricule.length}/7 chiffres
                  </small>
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Montant sollicité (XAF) *</label>
                  <input
                    type="number"
                    value={dossier.montantSollicite || ''}
                    onChange={(e) => updateDossier(index, 'montantSollicite', parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 50000000"
                    min="0"
                    required
                  />
                </div>

                {showComite && (
                  <div className="field-group">
                    <label>Comité *</label>
                    <select
                      value={dossier.comite || ''}
                      onChange={(e) => updateDossier(index, 'comite', e.target.value)}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {getComiteOptions().map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {showDecision && (
                <div className="field-row">
                  <div className="field-group">
                    <label>Décision comité *</label>
                    <select
                      value={dossier.Decision || ''}
                      onChange={(e) => updateDossier(index, 'Decision', e.target.value)}
                      required
                    >
                      <option value="">-- Sélectionner --</option>
                      {getDecisionOptions().map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Détail décision</label>
                    <input
                      type="text"
                      value={dossier.detailDecision || ''}
                      onChange={(e) => updateDossier(index, 'detailDecision', e.target.value)}
                      placeholder="Précisions sur la décision"
                    />
                  </div>
                </div>
              )}

              <div className="field-group full-width">
                <label>Commentaire</label>
                <textarea
                  value={dossier.commentaire || ''}
                  onChange={(e) => updateDossier(index, 'commentaire', e.target.value)}
                  placeholder="Observations ou commentaires..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DossiersDetailsInput;
