import React, { useState } from 'react';
import { AnalyseDossiersComitesService } from '../../services/AnalyseDossiersComitesService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import './CreditClassiqueFormNew.css';

interface DossierDetail {
  nomClient: string;
  matricule: string;
  montantSollicite: number;
  decision: string;
  detailDecision: string;
  commentaire: string;
}

interface CreditClassiqueFormData {
  // Champs communs
  nomActivity: string;
  nombre: number;
  montant: number;
  dateReception: string;
  typeComite?: string; // Pour certaines activités
  
  // Détails des dossiers
  dossiers: DossierDetail[];
}

interface CreditClassiqueFormNewProps {
  activityName: string;
  requiresComite?: boolean;
  requiresDetails?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const CreditClassiqueFormNew: React.FC<CreditClassiqueFormNewProps> = ({
  activityName,
  requiresComite = false,
  requiresDetails = false,
  onSave,
  onCancel
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  
  const [formData, setFormData] = useState<CreditClassiqueFormData>({
    nomActivity: activityName,
    nombre: 0,
    montant: 0,
    dateReception: new Date().toISOString().split('T')[0],
    typeComite: '',
    dossiers: []
  });

  const [loading, setLoading] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [currentDossier, setCurrentDossier] = useState<DossierDetail>({
    nomClient: '',
    matricule: '',
    montantSollicite: 0,
    decision: '',
    detailDecision: '',
    commentaire: ''
  });

  const comiteTypes = ['CC1', 'CC2', 'CC3', 'CC4', 'CCCA'];
  const decisionTypes = ['Accord', 'Avis favorable', 'À représenter', 'Stand by', 'Rejet'];

  const handleAddDossier = () => {
    setCurrentDossier({
      nomClient: '',
      matricule: '',
      montantSollicite: 0,
      decision: '',
      detailDecision: '',
      commentaire: ''
    });
    setShowDossierModal(true);
  };

  const handleSaveDossier = () => {
    if (!currentDossier.nomClient || !currentDossier.matricule) {
      alert('Nom client et matricule sont obligatoires');
      return;
    }

    setFormData(prev => ({
      ...prev,
      dossiers: [...prev.dossiers, currentDossier]
    }));
    setShowDossierModal(false);
  };

  const handleRemoveDossier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dossiers: prev.dossiers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nombre <= 0) {
      showError('Validation', 'Le nombre de dossiers doit être supérieur à 0');
      return;
    }

    if (requiresComite && !formData.typeComite) {
      showError('Validation', 'Le type de comité est obligatoire pour cette activité');
      return;
    }

    try {
      setLoading(true);

      // 1. Enregistrer dans analyse_dossiers_comites
      const dossierData = {
        Title: formData.nomActivity,
        Nombre: formData.nombre,
        Montant: formData.montant,
        DateReception: formData.dateReception,
        ...(requiresComite && { TypeComite: formData.typeComite })
      };

      console.log('💾 Enregistrement dossier comité:', dossierData);
      const result = await AnalyseDossiersComitesService.create(dossierData as any);
      console.log('✅ Résultat sauvegarde:', result);

      if (!result.success) {
        throw new Error(result.error?.message || 'Échec de la sauvegarde');
      }

      // 2. Enregistrer les détails si fournis
      if (requiresDetails && formData.dossiers.length > 0) {
        for (const dossier of formData.dossiers) {
          const detailData = {
            Title: formData.nomActivity,
            NomClient: dossier.nomClient,
            Matricule: dossier.matricule,
            MontantSollicite: dossier.montantSollicite,
            Decision: dossier.decision,
            DetailDecision: dossier.detailDecision,
            Commentaire: dossier.commentaire,
            ...(requiresComite && { Comite: formData.typeComite })
          };

          console.log('💾 Enregistrement détail dossier:', detailData);
          const detailResult = await DetailsDossiersService.create(detailData as any);
          console.log('✅ Résultat détail:', detailResult);
          
          if (!detailResult.success) {
            console.warn('⚠️ Erreur détail:', detailResult.error);
          }
        }
      }

      showSuccess(
        'Enregistrement réussi', 
        `Activité "${activityName}" enregistrée avec succès.\n${formData.nombre} dossier(s) pour un montant de ${formData.montant.toLocaleString()} FCFA.`
      );
      
      // Attendre que l'utilisateur ferme la notification avant de fermer le formulaire
      setTimeout(() => onSave(), 500);
    } catch (error) {
      console.error('❌ Erreur enregistrement:', error);
      showError(
        'Erreur d\'enregistrement',
        error instanceof Error ? error.message : 'Une erreur inconnue est survenue lors de l\'enregistrement'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="credit-classique-form-container">
      <div className="form-header">
        <h2>📊 {activityName}</h2>
        <button className="close-btn" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="credit-form">
        {/* Informations générales */}
        <div className="form-section">
          <h3>Informations générales</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Nombre de dossiers *</label>
              <input
                type="number"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Montant total (FCFA) *</label>
              <input
                type="number"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />
              <small>{formData.montant.toLocaleString('fr-FR')} FCFA</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de réception *</label>
              <input
                type="date"
                value={formData.dateReception}
                onChange={(e) => setFormData({ ...formData, dateReception: e.target.value })}
                required
              />
            </div>

            {requiresComite && (
              <div className="form-group">
                <label>Type de comité *</label>
                <select
                  value={formData.typeComite}
                  onChange={(e) => setFormData({ ...formData, typeComite: e.target.value })}
                  required
                >
                  <option value="">-- Sélectionnez --</option>
                  {comiteTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Détails des dossiers (optionnel) */}
        {requiresDetails && (
          <div className="form-section">
            <div className="section-header">
              <h3>Détails des dossiers ({formData.dossiers.length})</h3>
              <button type="button" className="btn btn-secondary" onClick={handleAddDossier}>
                ➕ Ajouter un dossier
              </button>
            </div>

            {formData.dossiers.length > 0 && (
              <div className="dossiers-list">
                <table>
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Matricule</th>
                      <th>Montant sollicité</th>
                      <th>Décision</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.dossiers.map((dossier, index) => (
                      <tr key={index}>
                        <td>{dossier.nomClient}</td>
                        <td>{dossier.matricule}</td>
                        <td>{dossier.montantSollicite.toLocaleString('fr-FR')} FCFA</td>
                        <td>{dossier.decision}</td>
                        <td>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => handleRemoveDossier(index)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </form>

      {/* Modal Ajout Dossier */}
      {showDossierModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ajouter un dossier</h3>
              <button onClick={() => setShowDossierModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nom du client *</label>
                <input
                  type="text"
                  value={currentDossier.nomClient}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, nomClient: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Matricule *</label>
                <input
                  type="text"
                  value={currentDossier.matricule}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, matricule: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Montant sollicité (FCFA)</label>
                <input
                  type="number"
                  value={currentDossier.montantSollicite}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, montantSollicite: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Décision</label>
                <select
                  value={currentDossier.decision}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, decision: e.target.value })}
                >
                  <option value="">-- Sélectionnez --</option>
                  {decisionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Détail de la décision</label>
                <textarea
                  value={currentDossier.detailDecision}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, detailDecision: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Commentaire</label>
                <textarea
                  value={currentDossier.commentaire}
                  onChange={(e) => setCurrentDossier({ ...currentDossier, commentaire: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDossierModal(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSaveDossier}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
      
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
};

export default CreditClassiqueFormNew;
