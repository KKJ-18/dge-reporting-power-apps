import React, { useState, useEffect } from 'react';
import { SituationMEPService } from '../../services/SituationMEPService';
import { DetailsDossiersService } from '../../services/DetailsDossiersService';
import { AgenceResauService } from '../../services/AgenceResauService';
import NotificationModal from '../NotificationModal';
import { useNotification } from '../../hooks/useNotification';
import '../../styles/forms.css';

/**
 * Cat. 1 DSE — Suivi des mises en place
 * 4 sous-types basés sur (Particulier/Entreprise) × (Identifier/Régulariser)
 * 
 * Variables résultats par client:
 * - Nombre d'éléments de non-conformité détectés
 * - Montant lié au financement
 * - État du dossier (en cours, traité, non traité)
 * 
 * Fréquence: Journalière
 */

type SuiviMEPSpecificType = 
  | 'particulier-identifier'
  | 'particulier-regulariser'
  | 'entreprise-identifier'
  | 'entreprise-regulariser';

interface FormSuiviMisesEnPlaceProps {
  activityName: string;
  specificType: SuiviMEPSpecificType;
  departmentColor?: string;
  onClose: () => void;
  onSave: () => void;
}

interface ClientData {
  matricule: string;
  nomClient: string;
  agence: string;
  reseau: string;
  nombreNonConformites: number;
  montantFinancement: number;
  etatDossier: '' | 'en_cours' | 'traite' | 'non_traite';
  observation: string;
  date: string;
}

const FormSuiviMisesEnPlace: React.FC<FormSuiviMisesEnPlaceProps> = ({
  activityName, specificType, onClose, onSave
}) => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [agences, setAgences] = useState<string[]>([]);
  const [reseaux, setReseaux] = useState<string[]>([]);
  const [loadingAgences, setLoadingAgences] = useState(false);
  const [clients, setClients] = useState<ClientData[]>([]);

  const [formData, setFormData] = useState({
    matricule: '',
    nomClient: '',
    agence: '',
    reseau: '',
    nombreNonConformites: 0,
    montantFinancement: 0,
    etatDossier: '' as '' | 'en_cours' | 'traite' | 'non_traite',
    observation: '',
    date: new Date().toISOString().split('T')[0],
  });

  const typeClient = specificType.startsWith('particulier') ? 'Particulier' : 'Entreprise';
  const actionType = specificType.endsWith('identifier') ? 'Identifier les non-conformités' : 'Régulariser les anomalies';

  useEffect(() => {
    (async () => {
      setLoadingAgences(true);
      try {
        const result = await AgenceResauService.getAll();
        const data = result?.data || result?.value || [];
        setAgences([...new Set(data.map((a: any) => a.Title).filter(Boolean))] as string[]);
        setReseaux([...new Set(data.map((a: any) => a.NomResau).filter(Boolean))] as string[]);
      } catch (e) { console.error('Erreur chargement agences:', e); }
      setLoadingAgences(false);
    })();
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddClient = () => {
    if (!formData.matricule || !formData.nomClient || !formData.etatDossier) {
      showError('Erreur', 'Veuillez remplir au minimum le matricule, le nom du client et l\'état du dossier');
      return;
    }
    setClients(prev => [...prev, { ...formData }]);
    // Réinitialiser le formulaire
    setFormData({
      matricule: '',
      nomClient: '',
      agence: '',
      reseau: '',
      nombreNonConformites: 0,
      montantFinancement: 0,
      etatDossier: '' as '' | 'en_cours' | 'traite' | 'non_traite',
      observation: '',
      date: formData.date, // Garde la même date
    });
    showSuccess('Client ajouté', `${formData.nomClient} ajouté à la liste (${clients.length + 1} client(s))`);
  };

  const handleRemoveClient = (index: number) => {
    setClients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si aucun client dans la liste, vérifier qu'il y a un client en cours de saisie
    if (clients.length === 0 && (!formData.matricule || !formData.nomClient)) {
      showError('Erreur', 'Veuillez ajouter au moins un client à la liste ou remplir les informations client');
      return;
    }

    setLoading(true);
    try {
      const reference = `MEP-${typeClient.substring(0, 3).toUpperCase()}-${Date.now()}`;
      
      // Déterminer la liste finale : clients déjà ajoutés + client actuel si rempli
      const clientsToSave = [...clients];
      if (formData.matricule && formData.nomClient && formData.etatDossier) {
        clientsToSave.push(formData);
      }

      // Calculer les totaux
      const totalNonConformites = clientsToSave.reduce((sum, c) => sum + c.nombreNonConformites, 0);
      const totalMontant = clientsToSave.reduce((sum, c) => sum + c.montantFinancement, 0);

      // 1. Sauvegarder l'enregistrement principal dans SituationMEP (agrégé)
      await SituationMEPService.create({
        Title: activityName,
        Nombre: totalNonConformites,
        Montant: totalMontant,
        DateMep: clientsToSave[0].date,
        Pourcentage: 0,
        Reference: reference,
      });

      // 2. Sauvegarder chaque client dans DetailsDossiers
      for (const client of clientsToSave) {
        await DetailsDossiersService.create({
          Title: activityName,
          NomClient: client.nomClient,
          Matricule: client.matricule,
          MontantSollicite: client.montantFinancement,
          Decision: client.etatDossier === 'traite' ? 'Traité' : client.etatDossier === 'non_traite' ? 'Non traité' : 'En cours',
          ObjetCommentaire: `${typeClient} - ${actionType}`,
          Commentaire: client.observation,
          Comite: `Agence: ${client.agence} | Réseau: ${client.reseau}`,
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
          <span className="form-badge">{typeClient} — {actionType}</span>
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
            <div className="form-group">
              <label>Agence</label>
              <select value={formData.agence} onChange={e => handleChange('agence', e.target.value)} disabled={loadingAgences}>
                <option value="">{loadingAgences ? 'Chargement...' : 'Sélectionner une agence'}</option>
                {agences.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Réseau</label>
              <select value={formData.reseau} onChange={e => handleChange('reseau', e.target.value)} disabled={loadingAgences}>
                <option value="">{loadingAgences ? 'Chargement...' : 'Sélectionner un réseau'}</option>
                {reseaux.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">📊 Résultats de suivi</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Nombre d'éléments de non-conformité <span className="required">*</span></label>
              <input type="number" value={formData.nombreNonConformites || ''} onChange={e => handleChange('nombreNonConformites', parseInt(e.target.value) || 0)} placeholder="0" min="0" required />
            </div>
            <div className="form-group">
              <label>Montant lié au financement (FCFA)</label>
              <input type="number" value={formData.montantFinancement || ''} onChange={e => handleChange('montantFinancement', parseFloat(e.target.value) || 0)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>État du dossier <span className="required">*</span></label>
              <select value={formData.etatDossier} onChange={e => handleChange('etatDossier', e.target.value)} required>
                <option value="">Sélectionner l'état</option>
                <option value="en_cours">En cours</option>
                <option value="traite">Traité</option>
                <option value="non_traite">Non traité</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} required />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Observation</label>
            <textarea value={formData.observation} onChange={e => handleChange('observation', e.target.value)} placeholder="Observations / commentaires" rows={3} />
          </div>
        </div>

        {/* Liste des clients ajoutés */}
        {clients.length > 0 && (
          <div className="form-section">
            <h3 className="section-title">📋 Clients ajoutés ({clients.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Matricule</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Nom</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Agence</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Non-conf.</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Montant</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>État</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '8px' }}>{client.matricule}</td>
                      <td style={{ padding: '8px' }}>{client.nomClient}</td>
                      <td style={{ padding: '8px' }}>{client.agence || '-'}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.nombreNonConformites}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{client.montantFinancement.toLocaleString()} FCFA</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px',
                          backgroundColor: client.etatDossier === 'traite' ? '#d4edda' : client.etatDossier === 'non_traite' ? '#f8d7da' : '#fff3cd',
                          color: client.etatDossier === 'traite' ? '#155724' : client.etatDossier === 'non_traite' ? '#721c24' : '#856404'
                        }}>
                          {client.etatDossier === 'en_cours' ? 'En cours' : client.etatDossier === 'traite' ? 'Traité' : 'Non traité'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveClient(index)}
                          style={{ 
                            background: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            padding: '4px 8px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          ✕ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '13px' }}>
              <strong>Totaux :</strong> {clients.reduce((s, c) => s + c.nombreNonConformites, 0)} non-conformités • {clients.reduce((s, c) => s + c.montantFinancement, 0).toLocaleString()} FCFA
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Annuler</button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleAddClient} 
            disabled={loading}
            style={{ backgroundColor: '#28a745', color: 'white' }}
          >
            ➕ Ajouter ce client à la liste
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : `Enregistrer ${clients.length > 0 ? `(${clients.length} client(s))` : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSuiviMisesEnPlace;
