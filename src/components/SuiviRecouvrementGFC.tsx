import React, { useState, useEffect } from 'react';
import { ClientsenAnomalieService } from '../services/ClientsenAnomalieService';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import { ClientsenAnomalie } from '../Models/ClientsenAnomalieModel';
import { ActionRecouvrement } from '../Models/ActionRecouvrementModel';
import './SuiviRecouvrementGFC.css';

interface SuiviRecouvrementGFCProps {
  onClose?: () => void;
}

const SuiviRecouvrementGFC: React.FC<SuiviRecouvrementGFCProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientsEnAnomalie, setClientsEnAnomalie] = useState<ClientsenAnomalie[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientsenAnomalie[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientsenAnomalie | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showClientSearch, setShowClientSearch] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  
  // État pour l'upload de fichier
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  // États pour le formulaire d'action
  const [formData, setFormData] = useState({
    DatePlanification: '',
    DateExc_x00e9_cution: '',
    Title: '', // Commentaire
    Origineimpay_x00e9_: '',
    Typedaction: '',
    Lienpi_x00e8_cejointe: '',
    DateprochaineAction: ''
  });

  // Types d'actions disponibles (selon la capture d'écran)
  const typesAction = [
    'Compte rendu de visite',
    'Entretien Téléphonique',
    'Lettre de relance',
    'Mise en demeure',
    'Notification d\'engagements',
    'Saisie des comptes',
    'Transfert au contentieux'
  ];

  // Recherche de clients avec filtres côté serveur (OPTIMISÉ pour 100k+ éléments)
  const searchClients = async (searchValue: string = searchTerm) => {
    if (!searchValue || searchValue.length < 2) {
      setError('Veuillez saisir au moins 2 caractères pour rechercher');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      // Utiliser substringof pour recherche côté serveur SharePoint
      // Cela permet de filtrer avant de charger, évitant de charger 100k éléments
      const searchFilter = `(substringof('${searchValue}', Title) or substringof('${searchValue}', Matricule) or substringof('${searchValue}', NomGFC)) and (StatutAction eq 'Aucun' or StatutAction eq null)`;
      
      const result = await ClientsenAnomalieService.getAll({
        filter: searchFilter,
        top: 1000, // Limiter à 1000 résultats max
        orderby: 'Created desc'
      });

      if (result.success && result.data) {
        // Vérification supplémentaire côté client
        const clientsValides = result.data.filter((client: ClientsenAnomalie) => {
          const statutValue = (client.StatutAction as any)?.Value;
          return !statutValue || statutValue === 'Aucun' || statutValue === '';
        });
        
        setClientsEnAnomalie(clientsValides);
        setFilteredClients(clientsValides);
        setTotalItems(clientsValides.length);
        setCurrentPage(1);
        
        if (clientsValides.length === 0) {
          setError('Aucun client trouvé avec ces critères');
        }
      } else {
        setError('Erreur lors de la recherche');
      }
    } catch (err) {
      console.error('Erreur recherche:', err);
      setError('Erreur lors de la recherche. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la touche Entrée pour lancer la recherche
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchClients();
    }
  };

  // Filtrer les clients selon le terme de recherche
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clientsEnAnomalie);
      setTotalItems(clientsEnAnomalie.length);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = clientsEnAnomalie.filter(client => 
      (client.Title?.toLowerCase().includes(term)) ||
      (client.Matricule?.toLowerCase().includes(term)) ||
      (client.NomGFC?.toLowerCase().includes(term))
    );
    
    setFilteredClients(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [searchTerm, clientsEnAnomalie]);

  // Calculer les éléments de la page actuelle
  const getPaginatedClients = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredClients.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Gestion de l'upload de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Dans un environnement réel, vous uploaderiez le fichier vers SharePoint
      // et obtiendriez une URL. Pour l'instant, on simule avec un nom
      setUploadedFileUrl(file.name);
      setFormData(prev => ({ ...prev, Lienpi_x00e8_cejointe: file.name }));
    }
  };

  // Sélectionner un client et préremplir le formulaire
  const handleSelectClient = (client: ClientsenAnomalie) => {
    setSelectedClient(client);
    setShowClientSearch(false);
    setError(null);
    setSuccessMessage(null);
    
    // Réinitialiser le formulaire avec les données du client
    setFormData({
      DatePlanification: '',
      DateExc_x00e9_cution: '',
      Title: '',
      Origineimpay_x00e9_: '',
      Typedaction: '',
      Lienpi_x00e8_cejointe: '',
      DateprochaineAction: ''
    });
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    if (!formData.DateExc_x00e9_cution) {
      setError('La date d\'exécution est obligatoire');
      return false;
    }

    if (!formData.Title?.trim()) {
      setError('Le commentaire est obligatoire');
      return false;
    }

    if (!formData.Origineimpay_x00e9_?.trim()) {
      setError('L\'origine de l\'impayé est obligatoire');
      return false;
    }

    if (!formData.Typedaction) {
      setError('Le type d\'action est obligatoire');
      return false;
    }

    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;
    
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 1. Créer l'action de recouvrement
      const actionData: any = {
        Title: formData.Title,
        DateExc_x00e9_cution: formData.DateExc_x00e9_cution,
        Origineimpay_x00e9_: formData.Origineimpay_x00e9_,
        Matricule: selectedClient.Matricule,
        NomClient: selectedClient.Title,
        EmailGFC: selectedClient.EmailGFC || ''
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.DatePlanification) {
        actionData.DatePlanification = formData.DatePlanification;
      }
      if (formData.Lienpi_x00e8_cejointe) {
        actionData.Lienpi_x00e8_cejointe = formData.Lienpi_x00e8_cejointe;
      }
      if (formData.DateprochaineAction) {
        actionData.DateprochaineAction = formData.DateprochaineAction;
      }
      if (formData.Typedaction) {
        actionData.Typedaction = formData.Typedaction; // Chaîne simple, pas d'objet
      }

      console.log('📤 Envoi action recouvrement:', actionData);
      
      const createResult = await ActionRecouvrementService.create(actionData);

      if (!createResult.success) {
        throw new Error('Échec de la création de l\'action de recouvrement');
      }

      // 2. Mettre à jour le StatutAction du client en anomalie
      const updateResult = await ClientsenAnomalieService.update(
        selectedClient.ID!.toString(),
        {
          StatutAction: { Value: 'En cours' }
        }
      );

      if (!updateResult.success) {
        console.warn('Attention: Action créée mais mise à jour du statut client échouée');
      }

      // 3. Afficher le succès et réinitialiser
      setSuccessMessage('✅ Action de recouvrement enregistrée avec succès !');
      
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setSelectedClient(null);
        setShowClientSearch(true);
        setFormData({
          DatePlanification: '',
          DateExc_x00e9_cution: '',
          Title: '',
          Origineimpay_x00e9_: '',
          Typedaction: '',
          Lienpi_x00e8_cejointe: '',
          DateprochaineAction: ''
        });
        loadClientsEnAnomalie(); // Recharger la liste
      }, 2000);

    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      setError('Une erreur est survenue lors de l\'enregistrement de l\'action');
    } finally {
      setSaving(false);
    }
  };

  // Retour à la recherche
  const handleBackToSearch = () => {
    setSelectedClient(null);
    setShowClientSearch(true);
    setError(null);
    setSuccessMessage(null);
  };

  // Formater le montant
  const formatMontant = (montant?: number) => {
    if (!montant) return '0 FCFA';
    return `${montant.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <div className="suivi-recouvrement-container">
      <div className="suivi-recouvrement-header">
        <h2>🏛️ Suivi des Actions de Recouvrement pour les GFC</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>✕</button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {/* Vue de recherche de clients */}
      {showClientSearch && (
        <div className="client-search-section">
          <div className="search-box">
            <div className="search-input-wrapper">
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un client (nom, matricule, GFC)... min 2 caractères"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="search-input"
                />
              </div>
              <button 
                className="search-button"
                onClick={() => searchClients()}
                disabled={loading || searchTerm.length < 2}
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
            {hasSearched && (
              <div className="search-info">
                {totalItems} client(s) trouvé(s) • Page {currentPage} sur {totalPages}
              </div>
            )}
          </div>

          {!hasSearched && !loading ? (
            <div className="search-prompt">
              <p>💡 Saisissez au moins 2 caractères et cliquez sur "Rechercher" pour afficher les clients en anomalie</p>
            </div>
          ) : loading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Chargement des clients en anomalie...</p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="no-data">
              <p>😊 Aucun client en anomalie avec statut "Aucun" trouvé</p>
            </div>
          ) : (
            <>
              <div className="clients-list">
                {getPaginatedClients().map((client) => (
                <div
                  key={client.ID}
                  className="client-card"
                  onClick={() => handleSelectClient(client)}
                >
                  <div className="client-card-header">
                    <h3>{client.Title || 'Sans nom'}</h3>
                    <span className="client-badge">Matricule: {client.Matricule}</span>
                  </div>
                  <div className="client-card-body">
                    <div className="client-info-row">
                      <span className="label">GFC:</span>
                      <span className="value">{client.NomGFC || 'N/A'}</span>
                    </div>
                    <div className="client-info-row">
                      <span className="label">Email GFC:</span>
                      <span className="value">{client.EmailGFC || 'N/A'}</span>
                    </div>
                    <div className="client-info-row">
                      <span className="label">Agence:</span>
                      <span className="value">{client.Nomagence || 'N/A'}</span>
                    </div>
                    <div className="client-info-row">
                      <span className="label">Montant:</span>
                      <span className="value amount">{formatMontant(client.Montant)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Précédent
                </button>
                
                <div className="pagination-info">
                  Page {currentPage} sur {totalPages}
                </div>
                
                <button 
                  className="pagination-button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
          )}
        </div>
      )}

      {/* Formulaire d'action de recouvrement */}
      {!showClientSearch && selectedClient && (
        <div className="action-form-section">
          <button className="back-button" onClick={handleBackToSearch}>
            ← Retour à la recherche
          </button>

          <div className="client-selected-info">
            <h3>Client sélectionné</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nom:</span>
                <span className="info-value">{selectedClient.Title}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Matricule:</span>
                <span className="info-value">{selectedClient.Matricule}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Montant:</span>
                <span className="info-value amount">{formatMontant(selectedClient.Montant)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email GFC:</span>
                <span className="info-value">{selectedClient.EmailGFC || 'N/A'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="action-form">
            <h3>Formulaire d'Action de Recouvrement</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="typedaction">
                  Type d'Action <span className="required">*</span>
                </label>
                <select
                  id="typedaction"
                  value={formData.Typedaction}
                  onChange={(e) => handleInputChange('Typedaction', e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner un type --</option>
                  {typesAction.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateExecution">
                  Date d'Exécution <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="dateExecution"
                  value={formData.DateExc_x00e9_cution}
                  onChange={(e) => handleInputChange('DateExc_x00e9_cution', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="datePlanification">
                  Date de Planification <span className="optional">(optionnel)</span>
                </label>
                <input
                  type="date"
                  id="datePlanification"
                  value={formData.DatePlanification}
                  onChange={(e) => handleInputChange('DatePlanification', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateProchaineAction">
                  Date de Prochaine Action <span className="optional">(optionnel)</span>
                </label>
                <input
                  type="date"
                  id="dateProchaineAction"
                  value={formData.DateprochaineAction}
                  onChange={(e) => handleInputChange('DateprochaineAction', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="origineImpaye">
                Origine de l'Impayé <span className="required">*</span>
              </label>
              <input
                type="text"
                id="origineImpaye"
                value={formData.Origineimpay_x00e9_}
                onChange={(e) => handleInputChange('Origineimpay_x00e9_', e.target.value)}
                placeholder="Ex: Crédit, Découvert, Garantie..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="commentaire">
                Commentaire <span className="required">*</span>
              </label>
              <textarea
                id="commentaire"
                value={formData.Title}
                onChange={(e) => handleInputChange('Title', e.target.value)}
                placeholder="Décrivez l'action de recouvrement effectuée..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pieceJointe">
                Pièce Jointe <span className="optional">(optionnel)</span>
              </label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="pieceJointe"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="file-input"
                />
                {uploadedFile && (
                  <div className="file-preview">
                    📎 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
              <small className="form-hint">
                Formats acceptés : PDF, Word, Images (max 10 MB)
              </small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBackToSearch}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : '💾 Enregistrer l\'Action'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SuiviRecouvrementGFC;
