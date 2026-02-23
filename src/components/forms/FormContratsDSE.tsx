import React, { useState } from 'react';
import { ContratsService } from '../../services/ContratsService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 3 DSE — Contrats (Surveillance)
 * 3 sous-types: Avance sur facture, Préfinancement, Cautions
 * 
 * Variables résultats par client:
 * - Nature
 * - Nombre
 * - Montant
 * 
 * Fréquence: Journalière
 */

type ContratSpecificType = 'avance-facture' | 'prefinancement' | 'cautions';

interface FormContratsDSEProps {
  activityName: string;
  contratType: ContratSpecificType;
  onSave: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  departmentColor?: string;
}

interface ClientData {
  matricule: string;
  nomClient: string;
  nature: string;
  nombre: number;
  montant: number;
  observation: string;
  date: string;
}

const FormContratsDSE: React.FC<FormContratsDSEProps> = ({
  activityName, contratType, onSave, onCancel, onClose
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const handleClose = onClose || onCancel || (() => {});
  const [clients, setClients] = useState<ClientData[]>([]);

  const [formData, setFormData] = useState({
    matricule: '',
    nomClient: '',
    nature: contratType === 'avance-facture' ? 'Avance sur facture' 
           : contratType === 'prefinancement' ? 'Préfinancement' 
           : 'Caution',
    nombre: 0,
    montant: 0,
    observation: '',
    date: new Date().toISOString().split('T')[0],
  });

  const getSubtypeLabel = () => {
    switch (contratType) {
      case 'avance-facture': return 'Avance sur facture — Surveillance';
      case 'prefinancement': return 'Préfinancement — Surveillance';
      case 'cautions': return 'Cautions — Surveillance';
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
      nature: formData.nature,
      nombre: 0,
      montant: 0,
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
    
    if (clients.length === 0 && (!formData.matricule || !formData.nomClient)) {
      showError('Erreur', 'Veuillez ajouter au moins un client à la liste ou remplir les informations client');
      return;
    }

    setLoading(true);
    try {
      const reference = `CONTRAT-${contratType.toUpperCase()}-${Date.now()}`;
      
      const clientsToSave = [...clients];
      if (formData.matricule && formData.nomClient) {
        clientsToSave.push(formData);
      }

      // 1. Sauvegarder un enregistrement Contrats agrégé
      const totalNombre = clientsToSave.reduce((sum, c) => sum + c.nombre, 0);
      const totalMontant = clientsToSave.reduce((sum, c) => sum + c.montant, 0);
      
      await ContratsService.create({
        Title: activityName,
        MatriculeClient: `${clientsToSave.length} clients`,
        Montant: totalMontant,
        DateVersement: clientsToSave[0].date,
        Duree: totalNombre,
        Observation: `Multi-clients: ${clientsToSave[0].nature}`,
        Reference: reference,
        Date: clientsToSave[0].date,
      });

      // 2. Sauvegarder chaque client dans DetailsDossiers
      for (const client of clientsToSave) {
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: client.nomClient,
          Matricule: client.matricule,
          MontantSollicite: client.montant,
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
          <span className="form-badge">{getSubtypeLabel()}</span>
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
          <h3 className="section-title">📊 Détails du contrat</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nature</label>
              <input type="text" value={formData.nature} onChange={e => handleChange('nature', e.target.value)} placeholder="Nature du contrat" />
            </div>
            <div className="form-group">
              <label>Nombre <span className="required">*</span></label>
              <input type="number" value={formData.nombre || ''} onChange={e => handleChange('nombre', parseInt(e.target.value) || 0)} placeholder="0" min="0" required />
            </div>
            <div className="form-group">
              <label>Montant (FCFA) <span className="required">*</span></label>
              <input type="number" value={formData.montant || ''} onChange={e => handleChange('montant', parseFloat(e.target.value) || 0)} placeholder="0" min="0" required />
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
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
                    <th style={{ padding: '8px', textAlign: 'left' }}>Nature</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Nombre</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Montant</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{client.matricule}</td>
                      <td style={{ padding: '8px' }}>{client.nomClient}</td>
                      <td style={{ padding: '8px' }}>{client.nature}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.nombre}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.montant.toLocaleString()} FCFA</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button type="button" onClick={() => handleRemoveClient(index)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px' }}>
              <strong>Totaux :</strong> Nombre: {clients.reduce((s, c) => s + c.nombre, 0)} • Montant: {clients.reduce((s, c) => s + c.montant, 0).toLocaleString()} FCFA
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleClose} disabled={loading}>Annuler</button>
          <button type="button" className="btn-secondary" onClick={handleAddClient} disabled={loading} style={{ backgroundColor: '#28a745', color: 'white' }}>➕ Ajouter ce client</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : `Enregistrer ${clients.length > 0 ? `(${clients.length} client(s))` : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormContratsDSE;
