import React, { useState } from 'react';
import { AccordsService } from '../../services/AccordsService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 2 DSE — AIM (Autorisation Individuelle de Mobilisation)
 * 4 sous-types: Analyse, Dépôt BEAC, Réponses BEAC, MAJ BEAC
 * 
 * Variables résultats par client:
 * - Client (Matricule + Nom)
 * - Statut
 * - Montant du prêt
 * - Montant Demandé
 * - Montant Accordé
 * 
 * Fréquences: Journalière (1-3), Hebdomadaire (4)
 */

type AIMSpecificType =
  | 'aim-analyse'
  | 'aim-depot-beac'
  | 'aim-reponses-beac'
  | 'aim-maj-beac';

interface FormAIMDSEProps {
  activityName: string;
  specificType: AIMSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

interface ClientData {
  matricule: string;
  nomClient: string;
  statut: string;
  montantPret: number;
  montantDemande: number;
  montantAccorde: number;
  observation: string;
  date: string;
}

const STATUT_OPTIONS = [
  'En cours d\'analyse',
  'Déposé à la BEAC',
  'Réponse reçue',
  'Accordé',
  'Refusé',
  'En attente',
  'Mis à jour',
];

const FormAIMDSE: React.FC<FormAIMDSEProps> = ({
  activityName, specificType, onClose, onSave
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);

  const [formData, setFormData] = useState({
    matricule: '',
    nomClient: '',
    statut: '',
    montantPret: 0,
    montantDemande: 0,
    montantAccorde: 0,
    observation: '',
    date: new Date().toISOString().split('T')[0],
  });

  const getSubtypeLabel = () => {
    switch (specificType) {
      case 'aim-analyse': return 'Analyse';
      case 'aim-depot-beac': return 'Dépôt des dossiers auprès de la BEAC';
      case 'aim-reponses-beac': return 'Réponses courrier de la BEAC';
      case 'aim-maj-beac': return 'Mise à jour des dossiers déposés à la BEAC';
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddClient = () => {
    if (!formData.matricule || !formData.nomClient || !formData.statut) {
      showError('Erreur', 'Veuillez remplir au minimum le matricule, le nom du client et le statut');
      return;
    }
    setClients(prev => [...prev, { ...formData }]);
    setFormData({
      matricule: '',
      nomClient: '',
      statut: '',
      montantPret: 0,
      montantDemande: 0,
      montantAccorde: 0,
      observation: '',
      date: formData.date,
    });
    showSuccess('Client ajouté', `${formData.nomClient} ajouté à la liste (${clients.length + 1} client(s))`);
  };

  const handleRemoveClient = (index: number) => {
    setClients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (clients.length === 0 && (!formData.matricule || !formData.nomClient || !formData.statut)) {
      showError('Erreur', 'Veuillez ajouter au moins un client à la liste ou remplir les informations client');
      return;
    }

    setLoading(true);
    try {
      const reference = `AIM-${specificType.toUpperCase()}-${Date.now()}`;
      
      const clientsToSave = [...clients];
      if (formData.matricule && formData.nomClient && formData.statut) {
        clientsToSave.push(formData);
      }

      // 1. Sauvegarder un enregistrement Accords agrégé
      const totalDemande = clientsToSave.reduce((sum, c) => sum + c.montantDemande, 0);
      const totalAccorde = clientsToSave.reduce((sum, c) => sum + c.montantAccorde, 0);
      
      await AccordsService.create({
        Title: activityName,
        Matricule: `${clientsToSave.length} clients`,
        Statut: { Value: 'Multi-clients' },
        MontanPret: clientsToSave.reduce((sum, c) => sum + c.montantPret, 0),
        MontantDemande: totalDemande,
        MontantAccorde: totalAccorde,
        Reference: reference,
        Date: clientsToSave[0].date,
      });

      // 2. Sauvegarder chaque client dans DetailsDossiers
      for (const client of clientsToSave) {
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: client.nomClient,
          Matricule: client.matricule,
          MontantSollicite: client.montantDemande,
          Decision: client.statut,
          ObjetCommentaire: getSubtypeLabel(),
          Commentaire: client.observation,
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
          <span className="form-badge">AIM — {getSubtypeLabel()}</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-section">
          <h3 className="section-title">👤 Identification client</h3>
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
          <h3 className="section-title">💰 Détails AIM</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Statut <span className="required">*</span></label>
              <select value={formData.statut} onChange={e => handleChange('statut', e.target.value)} required>
                <option value="">Sélectionner le statut</option>
                {STATUT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Montant du prêt (FCFA)</label>
              <input type="number" value={formData.montantPret || ''} onChange={e => handleChange('montantPret', parseFloat(e.target.value) || 0)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Montant demandé (FCFA)</label>
              <input type="number" value={formData.montantDemande || ''} onChange={e => handleChange('montantDemande', parseFloat(e.target.value) || 0)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Montant accordé (FCFA)</label>
              <input type="number" value={formData.montantAccorde || ''} onChange={e => handleChange('montantAccorde', parseFloat(e.target.value) || 0)} placeholder="0" min="0" />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observation</label>
            <textarea value={formData.observation} onChange={e => handleChange('observation', e.target.value)} placeholder="Observations" rows={3} />
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
                    <th style={{ padding: '8px', textAlign: 'left' }}>Statut</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Demandé</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Accordé</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{client.matricule}</td>
                      <td style={{ padding: '8px' }}>{client.nomClient}</td>
                      <td style={{ padding: '8px' }}>{client.statut}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.montantDemande.toLocaleString()} FCFA</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.montantAccorde.toLocaleString()} FCFA</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button type="button" onClick={() => handleRemoveClient(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px' }}>
              <strong>Totaux :</strong> Demandé: {clients.reduce((s, c) => s + c.montantDemande, 0).toLocaleString()} FCFA • Accordé: {clients.reduce((s, c) => s + c.montantAccorde, 0).toLocaleString()} FCFA
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

export default FormAIMDSE;
