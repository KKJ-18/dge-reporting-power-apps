import React, { useState } from 'react';
import { SituationMEPService } from '../../services/SituationMEPService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 4 DSE — Projets (PV du comité de crédit)
 * 3 sous-types: Recensement des projets, Suivi décaissements, Suivi taux d'avancement
 * 
 * Variables résultats par client:
 * - Nombre de MEP (création des cases pour lister les matricules et montant)
 * - Taux d'avancement
 * - Observations
 * 
 * Fréquence: Hebdomadaire
 */

type ProjetsSpecificType =
  | 'recensement-projets'
  | 'suivi-decaissements'
  | 'suivi-taux-avancement';

interface FormProjetsDSEProps {
  activityName: string;
  specificType: ProjetsSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

interface ClientData {
  matricule: string;
  nomClient: string;
  montant: number;
  nombreMEP: number;
  tauxAvancement: number;
  observations: string;
  date: string;
}

const FormProjetsDSE: React.FC<FormProjetsDSEProps> = ({
  activityName, specificType, onClose, onSave
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);

  const [formData, setFormData] = useState({
    matricule: '',
    nomClient: '',
    montant: 0,
    nombreMEP: 0,
    tauxAvancement: 0,
    observations: '',
    date: new Date().toISOString().split('T')[0],
  });

  const getSubtypeLabel = () => {
    switch (specificType) {
      case 'recensement-projets': return 'Recensement des projets';
      case 'suivi-decaissements': return 'Suivi des décaissements';
      case 'suivi-taux-avancement': return 'Suivi du taux d\'avancement';
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddClient = () => {
    if (!formData.matricule || !formData.nomClient) {
      showError('Erreur', 'Veuillez remplir au minimum le matricule et le nom du client');
      return;
    }
    setClients(prev => [...prev, { ...formData }]);
    setFormData({
      matricule: '',
      nomClient: '',
      montant: 0,
      nombreMEP: 0,
      tauxAvancement: 0,
      observations: '',
      date: formData.date,
    });
    showSuccess('Client ajouté', `${formData.nomClient} ajouté à la liste (${clients.length + 1} client(s))`);
  };

  const handleRemoveClient = (index: number) => {
    setClients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clients.length === 0 && (!formData.matricule || !formData.nomClient)) {
      showError('Erreur', 'Veuillez ajouter au moins un client à la liste ou remplir les informations client');
      return;
    }

    setLoading(true);
    try {
      const reference = `PROJ-${specificType.toUpperCase()}-${Date.now()}`;
      
      const clientsToSave = [...clients];
      if (formData.matricule && formData.nomClient) {
        clientsToSave.push(formData);
      }

      // 1. Sauvegarder un enregistrement SituationMEP agrégé
      const totalMEP = clientsToSave.reduce((sum, c) => sum + c.nombreMEP, 0);
      const totalMontant = clientsToSave.reduce((sum, c) => sum + c.montant, 0);
      const moyenneTaux = clientsToSave.reduce((sum, c) => sum + c.tauxAvancement, 0) / clientsToSave.length;
      
      await SituationMEPService.create({
        Title: activityName,
        Nombre: totalMEP,
        Montant: totalMontant,
        DateMep: clientsToSave[0].date,
        Pourcentage: moyenneTaux,
        Reference: reference,
      });

      // 2. Sauvegarder chaque client dans DetailsDossiers
      for (const client of clientsToSave) {
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: client.nomClient,
          Matricule: client.matricule,
          MontantSollicite: client.montant,
          Decision: '',
          ObjetCommentaire: getSubtypeLabel(),
          Commentaire: client.observations,
          Reference: reference,
          Date: client.date,
        });
      }

      showSuccess('Succès', `${clientsToSave.length} client(s) enregistré(s) avec succès`);
      setTimeout(() => { onSave(); }, 1500);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showError('Erreur', 'Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <NotificationModal isOpen={notification.isOpen} type={notification.type} title={notification.title} message={notification.message} onClose={closeNotification} />
      <div className="form-header">
        <div className="form-title-group">
          <h2 className="form-title">{activityName}</h2>
          <span className="form-badge">PV du comité de crédit — {getSubtypeLabel()}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <h3 className="section-title">👤 Client / Projet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Matricule <span className="required">*</span></label>
              <input type="text" value={formData.matricule} onChange={e => handleChange('matricule', e.target.value)} placeholder="7 chiffres" required pattern="[0-9]{7}" maxLength={7} title="Le matricule doit contenir exactement 7 chiffres" />
            </div>
            <div className="form-group">
              <label>Nom du client <span className="required">*</span></label>
              <input type="text" value={formData.nomClient} onChange={e => handleChange('nomClient', e.target.value)} placeholder="Nom complet" required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">📊 Détails du projet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre de MEP <span className="required">*</span></label>
              <input type="number" value={formData.nombreMEP || ''} onChange={e => handleChange('nombreMEP', parseInt(e.target.value) || 0)} placeholder="0" min="0" required />
            </div>
            <div className="form-group">
              <label>Montant (FCFA)</label>
              <input type="number" value={formData.montant || ''} onChange={e => handleChange('montant', parseFloat(e.target.value) || 0)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Taux d'avancement (%)</label>
              <input type="number" value={formData.tauxAvancement || ''} onChange={e => handleChange('tauxAvancement', parseFloat(e.target.value) || 0)} placeholder="0" min="0" max="100" step="0.1" />
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observations</label>
            <textarea value={formData.observations} onChange={e => handleChange('observations', e.target.value)} placeholder="Observations sur le projet" rows={3} />
          </div>
        </div>

        {clients.length > 0 && (
          <div className="form-section">
            <h3 className="section-title">📋 Clients ajoutés ({clients.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Matricule</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>MEP</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Montant</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Taux</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{client.matricule}</td>
                      <td style={{ padding: '8px' }}>{client.nomClient}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.nombreMEP}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.montant.toLocaleString()} FCFA</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.tauxAvancement}%</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button type="button" onClick={() => handleRemoveClient(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px' }}>
              <strong>Totaux :</strong> MEP: {clients.reduce((s, c) => s + c.nombreMEP, 0)} • Montant: {clients.reduce((s, c) => s + c.montant, 0).toLocaleString()} FCFA • Taux moyen: {(clients.reduce((s, c) => s + c.tauxAvancement, 0) / clients.length).toFixed(1)}%
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button type="button" className="btn-secondary" onClick={handleAddClient} disabled={loading} style={{ backgroundColor: '#28a745', color: 'white' }}>➕ Ajouter ce client</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : `Enregistrer ${clients.length > 0 ? `(${clients.length} client(s))` : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProjetsDSE;
