import { useState, useEffect } from 'react'
import './AppModern.css'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'
import CreditClassiqueForm from './components/forms/CreditClassiqueForm'
import CreditProgrammeForm from './components/forms/CreditProgrammeForm'
import AdminEngagementsForm from './components/forms/AdminEngagementsForm'
import SuiviMEPForm from './components/forms/SuiviMEPForm'
import ActivitesAnnexesForm from './components/forms/ActivitesAnnexesForm'
import UserProfile from './components/UserProfile'
import CategoryManager from './components/CategoryManager'
import ActivityManager from './components/ActivityManager'
import { Office365UsersService } from './services/Office365UsersService'

function AppModern() {
  const [activeModule, setActiveModule] = useState('home')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [currentUser, setCurrentUser] = useState({
    name: 'Chargement...',
    role: 'Utilisateur',
    avatar: '?',
    mail: '',
    phone: '',
    location: '',
    department: ''
  })
  const [profileError, setProfileError] = useState<string | null>(null)

  // Charger le profil utilisateur au démarrage
  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('🔄 Chargement du profil utilisateur...');
      try {
        const profileResult = await Office365UsersService.MyProfile();
        console.log('✅ Profil reçu (raw):', profileResult);
        console.log('✅ Type du résultat:', typeof profileResult);
        console.log('✅ Clés du résultat:', Object.keys(profileResult || {}));
        
        if (profileResult) {
          updateUserProfile(profileResult);
          console.log('✅ État utilisateur mis à jour');
          setProfileError(null);
        } else {
          console.warn('⚠️ Aucun profil reçu');
          setProfileError('Aucun profil utilisateur trouvé');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        console.error('❌ Stack:', error instanceof Error ? error.stack : 'N/A');
        setProfileError(error instanceof Error ? error.message : 'Erreur inconnue lors du chargement du profil utilisateur.');
      }
    }
    loadUserProfile()
  }, [])

  const updateUserProfile = (profileResult: any) => {
    console.log('📊 updateUserProfile appelé avec:', profileResult);
    
    // Le SDK retourne { data: {...}, success: true }
    let profile = profileResult?.data || profileResult?.result?.result || profileResult?.result || profileResult;
    
    console.log('📊 Profil extrait:', profile);
    console.log('📊 Type du profil:', typeof profile);
    
    if (profile && typeof profile === 'object') {
      console.log('📊 Propriétés du profil:', Object.keys(profile));
      console.log('📊 DisplayName:', profile.DisplayName);
      console.log('📊 displayName:', profile.displayName);
    }
    
    const displayName = profile?.DisplayName || profile?.displayName || 'Utilisateur (données non chargées)';
    const jobTitle = profile?.JobTitle || profile?.jobTitle || 'En attente de connexion';
    const mail = profile?.Mail || profile?.mail || '';
    const mobilePhone = profile?.mobilePhone || profile?.TelephoneNumber || '';
    const officeLocation = profile?.OfficeLocation || profile?.officeLocation || '';
    const department = profile?.Department || profile?.department || '';

    setCurrentUser({
      name: displayName,
      role: jobTitle,
      avatar: displayName.charAt(0).toUpperCase(),
      mail,
      phone: mobilePhone,
      location: officeLocation,
      department
    });
    
    console.log('✅ État currentUser mis à jour:', {
      name: displayName,
      role: jobTitle,
      mail,
      phone: mobilePhone,
      location: officeLocation,
      department
    });
  }

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId)
  }

  const handleSaveForm = (data: any, isDraft: boolean) => {
    console.log('Sauvegarde formulaire:', { data, isDraft })
    
    // Ici, on intégrera la logique pour envoyer les données à SharePoint
    // via les services Power Platform
    
    if (!isDraft) {
      alert('✅ Rapport soumis avec succès !\n\nVotre rapport a été enregistré et sera traité automatiquement.')
    }
  }

  const renderMainContent = () => {
    switch (activeModule) {
      case 'home':
        return (
          <HomePage
            onModuleSelect={handleModuleSelect}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        )
      
      case 'credit-classique':
        return (
          <CreditClassiqueForm
            onSave={handleSaveForm}
          />
        )
      
      case 'credit-programme':
        return (
          <CreditProgrammeForm
            onSave={handleSaveForm}
          />
        )
      
      case 'admin-engagements':
        return (
          <AdminEngagementsForm
            onSave={handleSaveForm}
          />
        )
      
      case 'suivi-mep':
        return (
          <SuiviMEPForm
            onSave={handleSaveForm}
          />
        )
      
      case 'activites-annexes':
        return (
          <ActivitesAnnexesForm
            onSave={handleSaveForm}
          />
        )
      
      case 'categories':
        return <CategoryManager />
      
      case 'activities':
        return <ActivityManager />
      
      case 'reports':
        return (
          <div className="page-header">
            <h1 className="page-title">📑 Mes Rapports</h1>
            <p className="page-subtitle">Consultez l'historique de vos rapports soumis</p>
          </div>
        )
      
      case 'validation':
        return (
          <div className="page-header">
            <h1 className="page-title">✅ Validation Hiérarchique</h1>
            <p className="page-subtitle">Valider les rapports de votre équipe</p>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="page-header">
            <h1 className="page-title">📊 Statistiques</h1>
            <p className="page-subtitle">Analyses et métriques de performance</p>
          </div>
        )
      
      case 'settings':
        return (
          <UserProfile 
            user={{
              name: currentUser.name,
              role: currentUser.role,
              mail: currentUser.mail,
              phone: currentUser.phone,
              location: currentUser.location,
              department: currentUser.department
            }}
            onProfileRefresh={updateUserProfile}
            initialError={profileError}
          />
        )
      
      case 'help':
        return (
          <div className="page-header">
            <h1 className="page-title">❓ Aide</h1>
            <p className="page-subtitle">Documentation et support</p>
          </div>
        )
      
      default:
        return (
          <HomePage
            onModuleSelect={handleModuleSelect}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        )
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        currentUser={currentUser}
      />
      
      <main className="main-content">
        {renderMainContent()}
        
        {/* Zone de debug pour le développement */}
        {import.meta.env.DEV && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            opacity: 0.7
          }}>
            <strong>🛠️ Debug Info:</strong>
            <div style={{ marginTop: '0.5rem' }}>
              Module actif: <strong>{activeModule}</strong> | 
              Période: <strong>{selectedPeriod || 'Non définie'}</strong> |
              Environnement: <strong>{window.parent !== window ? 'Power Apps' : 'Développement'}</strong>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AppModern