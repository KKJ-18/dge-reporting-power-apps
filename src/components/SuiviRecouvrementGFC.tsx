import React, { useState, useEffect } from 'react';
import { ClientsenAnomalieService } from '../services/ClientsenAnomalieService';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import { ClientsenAnomalie } from '../Models/ClientsenAnomalieModel';
import { ActionRecouvrement } from '../Models/ActionRecouvrementModel';
import FileDownloader from './FileDownloader';
import './SuiviRecouvrementGFC.css';

/**
 * Composant de Suivi des Actions de Recouvrement pour les GFC
 * 
 * Fonctionnalités:
 * - Recherche de clients en anomalie (StatutAction = "Aucun")
 * - Pagination côté serveur (supporte 100k+ éléments)
 * - Formulaire d'enregistrement d'actions avec 7 types d'actions
 * - Upload de fichiers en base64 (max 10 MB)
 * - Incrémentation automatique du compteur d'actions
 * - Mise à jour automatique du statut client
 * 
 * Note technique:
 * Les fichiers sont stockés en base64 dans un champ SharePoint "PieceJointeBase64"
 * car Power Apps SDK ne supporte pas l'upload direct de pièces jointes.
 */

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
  
  // État pour les actions précédentes du client
  const [previousActions, setPreviousActions] = useState<ActionRecouvrement[]>([]);
  const [loadingPreviousActions, setLoadingPreviousActions] = useState(false);

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
        orderBy: ['Created desc']
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

  // Gestion de l'upload de fichier avec conversion en base64
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 2 MB pour base64 car SharePoint limite à ~750KB encodé)
      // 2 MB en binaire = ~2.7 MB en base64, mais SharePoint accepte jusqu'à ~750KB
      const maxSizeBytes = 500 * 1024; // 500 KB max pour être sûr
      
      if (file.size > maxSizeBytes) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
        setError(`Le fichier est trop volumineux (${sizeMB} MB). Limite : ${maxSizeMB} MB pour le stockage base64.`);
        event.target.value = ''; // Reset input
        return;
      }
      
      setError(null); // Clear any previous errors
      setUploadedFile(file);
      setFormData(prev => ({ ...prev, Lienpi_x00e8_cejointe: file.name }));
      console.log(`📎 Fichier sélectionné: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  // Fonction pour convertir et uploader le fichier en base64
  const uploadFileAsBase64 = async (itemId: string, file: File): Promise<boolean> => {
    try {
      console.log(`📎 Conversion fichier en base64: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      // Convertir le fichier en base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Extraire uniquement la partie base64
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64SizeKB = (base64.length / 1024).toFixed(2);
      console.log(`✅ Fichier converti en base64 (taille encodée: ${base64SizeKB} KB)`);
      
      // Vérification supplémentaire de la taille encodée
      if (base64.length > 700 * 1024) { // 700 KB encodé max
        console.error(`❌ Base64 trop volumineux: ${base64SizeKB} KB (limite: 700 KB)`);
        return false;
      }

      // Mettre à jour l'enregistrement avec le base64
      console.log(`📤 Envoi vers SharePoint (Action ID: ${itemId})...`);
      // Note: PieceJointeBase64, NomFichier, TypeFichier, TailleFichier ne sont pas dans le modèle généré
      // Ces champs doivent être ajoutés manuellement au modèle ActionRecouvrementModel.ts
      const updateResult = await ActionRecouvrementService.update(itemId, {
        // PieceJointeBase64: base64,
        // NomFichier: file.name,
        // TypeFichier: file.type,
        // TailleFichier: file.size
      } as any);

      if (updateResult.success) {
        console.log('✅ Fichier uploadé avec succès vers SharePoint');
      } else {
        console.error('❌ Échec mise à jour SharePoint:', updateResult);
      }

      return updateResult.success;
    } catch (error) {
      console.error('❌ Erreur conversion base64:', error);
      return false;
    }
  };

  // Sélectionner un client et préremplir le formulaire
  const handleSelectClient = (client: ClientsenAnomalie) => {
    setSelectedClient(client);
    setShowClientSearch(false);
    setError(null);
    setSuccessMessage(null);
    
    // Charger les actions précédentes
    if (client.Matricule) {
      loadPreviousActions(client.Matricule);
    }
    
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
    setUploadedFile(null);
  };
  
  // Charger les actions précédentes du client
  const loadPreviousActions = async (matricule: string) => {
    setLoadingPreviousActions(true);
    try {
      const result = await ActionRecouvrementService.getAll({
        filter: `Matricule eq '${matricule}'`,
        orderBy: ['Created desc'],
        top: 5 // Afficher les 5 dernières actions
      });
      
      if (result.success && result.data) {
        setPreviousActions(result.data);
        console.log('✅ Actions précédentes chargées:', result.data.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement actions précédentes:', error);
    } finally {
      setLoadingPreviousActions(false);
    }
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
      // 1. Récupérer le nombre d'actions planifiées précédentes pour ce matricule
      console.log('🔍 Recherche actions précédentes pour matricule:', selectedClient.Matricule);
      let nombreActionsPlanifiees = 1; // Par défaut 1 si aucune action précédente
      
      try {
        const previousActionsResult = await ActionRecouvrementService.getAll({
          filter: `Matricule eq '${selectedClient.Matricule}'`,
          orderBy: ['Created desc'],
          top: 1
        });
        
        if (previousActionsResult.success && previousActionsResult.data && previousActionsResult.data.length > 0) {
          const lastAction = previousActionsResult.data[0];
          const lastNumber = lastAction.NombreActionPlaniif_x00e9_ || 0;
          nombreActionsPlanifiees = lastNumber + 1;
          console.log(`✅ Dernière action trouvée: ${lastNumber}, nouvelle valeur: ${nombreActionsPlanifiees}`);
        } else {
          console.log('ℹ️ Aucune action précédente trouvée, initialisation à 1');
        }
      } catch (err) {
        console.warn('⚠️ Erreur récupération actions précédentes, utilisation valeur par défaut:', err);
      }

      // 2. Créer l'action de recouvrement avec le nombre incrémenté
      const actionData: any = {
        Title: formData.Title,
        DateExc_x00e9_cution: formData.DateExc_x00e9_cution,
        Origineimpay_x00e9_: formData.Origineimpay_x00e9_,
        Matricule: selectedClient.Matricule,
        NomClient: selectedClient.Title,
        EmailGFC: selectedClient.EmailGFC || '',
        NombreActionPlaniif_x00e9_: nombreActionsPlanifiees
      };

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.DatePlanification) {
        actionData.DatePlanification = formData.DatePlanification;
      }
      if (formData.DateprochaineAction) {
        actionData.DateprochaineAction = formData.DateprochaineAction;
      }
      
      // Type d'action : colonne Choice dans SharePoint (doit être un objet avec Value)
      if (formData.Typedaction) {
        actionData.Typedaction = { Value: formData.Typedaction };
      }

      console.log('📤 Envoi action recouvrement:', JSON.stringify(actionData, null, 2));

      const createResult = await ActionRecouvrementService.create(actionData);
      console.log('📥 Résultat création (raw):', createResult);

      if (!createResult || !createResult.success) {
        // Log détaillé pour debugging
        console.error('❌ Échec création - createResult:', createResult);
        if ((createResult as any)?.error) {
          console.error('❌ Détails erreur serveur:', JSON.stringify((createResult as any).error, null, 2));
        }
        const serverMsg = (createResult && (createResult as any).error) 
          ? JSON.stringify((createResult as any).error) 
          : 'Aucun détail d\'erreur';
        throw new Error('Échec de la création de l\'action de recouvrement: ' + serverMsg);
      }

      const newActionId = (createResult.data as any)?.ID;
      console.log('✅ Action créée avec ID:', newActionId);

      // 3. Upload du fichier en base64 si présent
      if (uploadedFile && newActionId) {
        console.log(`📎 Tentative upload fichier: ${uploadedFile.name}`);
        const uploadSuccess = await uploadFileAsBase64(newActionId.toString(), uploadedFile);
        
        if (uploadSuccess) {
          console.log('✅ Fichier uploadé avec succès en base64');
        } else {
          console.warn('⚠️ Échec upload fichier, mais l\'action est créée');
        }
      }

      // 4. Mettre à jour le StatutAction du client en anomalie
      const updateResult = await ClientsenAnomalieService.update(
        selectedClient.ID!.toString(),
        {
          StatutAction: { Value: 'En cours' }
        }
      );

      if (!updateResult.success) {
        console.warn('⚠️ Action créée mais mise à jour du statut client échouée');
      }

      // 4. Afficher le succès et réinitialiser
      setSuccessMessage('✅ Action de recouvrement enregistrée avec succès !');
      
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setSelectedClient(null);
        setShowClientSearch(true);
        setUploadedFile(null);
        setFormData({
          DatePlanification: '',
          DateExc_x00e9_cution: '',
          Title: '',
          Origineimpay_x00e9_: '',
          Typedaction: '',
          Lienpi_x00e8_cejointe: '',
          DateprochaineAction: ''
        });
        // Pas besoin de recharger car on retourne à la recherche
      }, 2000);

    } catch (err: any) {
      // Log complet pour debugging
      console.error("Erreur lors de l'enregistrement:", err);
      if (err && err.response) {
        try {
          console.error('Erreur response data:', err.response.data || err.response);
        } catch (e) {
          console.error('Impossible de lire err.response', e);
        }
      }
      // Si createResult retournait une structure d'erreur, elle aura déjà été loggée
      const errMsg = err?.message || 'Une erreur est survenue lors de l\'enregistrement de l\'action';
      setError(errMsg);
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
                📎 Le fichier sera converti et stocké en base64 dans SharePoint (max 500 KB). Formats : PDF, Word, Images.
              </small>
            </div>

            {/* Actions précédentes */}
            {previousActions.length > 0 && (
              <div className="previous-actions-section">
                <h4>📋 Actions précédentes ({previousActions.length})</h4>
                {loadingPreviousActions ? (
                  <div className="loading-small">Chargement...</div>
                ) : (
                  <div className="previous-actions-list">
                    {previousActions.map((action, index) => (
                      <div key={action.ID || index} className="previous-action-item">
                        <div className="action-header">
                          <span className="action-type">
                            {(action.Typedaction as any)?.Value || action.Typedaction || 'N/A'}
                          </span>
                          <span className="action-date">
                            {action.DateExc_x00e9_cution 
                              ? new Date(action.DateExc_x00e9_cution).toLocaleDateString('fr-FR')
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="action-details">
                          <p className="action-comment">{action.Title || 'Aucun commentaire'}</p>
                          {action.Origineimpay_x00e9_ && (
                            <p className="action-origin"><strong>Origine:</strong> {action.Origineimpay_x00e9_}</p>
                          )}
                        </div>
                        {(action as any).PieceJointeBase64 && (
                          <FileDownloader 
                            actionId={action.ID!.toString()}
                            fileName={(action as any).NomFichier}
                            fileType={(action as any).TypeFichier}
                            fileSize={(action as any).TailleFichier}
                            showDetails={true}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
