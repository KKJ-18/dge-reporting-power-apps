import { useState, useEffect } from 'react'
import './AppModern.css'
import Sidebar from './components/Sidebar'
import HomePageModern from './components/HomePageModern'
import HomePage from './components/HomePage'
import CreditClassiqueForm from './components/forms/CreditClassiqueForm'
import CreditProgrammeForm from './components/forms/CreditProgrammeForm'
import AdminEngagementsForm from './components/forms/AdminEngagementsForm'
import SuiviMEPForm from './components/forms/SuiviMEPForm'
import ActivitesAnnexesForm from './components/forms/ActivitesAnnexesForm'
import UserProfile from './components/UserProfile'
import CategoryManager from './components/CategoryManager'
import ActivityManagerModern from './components/ActivityManagerModern'
import DepartmentDashboard from './components/DepartmentDashboard'
import DepartmentDashboardAnalyse from './components/DepartmentDashboardAnalyse'
import DirectorDashboard from './components/DirectorDashboard'
import ReportsStatistics from './components/ReportsStatistics'
import ObjectifsManagement from './components/ObjectifsManagement'
import { UserProfileService, type UserProfile as UserProfileType } from './services/UserProfileService'
import { getDepartment, loadDepartments } from './config/departmentsData'

function AppModern() {
  const [activeModule, setActiveModule] = useState('home')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  // 🎯 POINT D'ENTRÉE - Charger le profil utilisateur au démarrage
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoadingProfile(true);
      try {
        // Charger les départements depuis SharePoint
        await loadDepartments();
        
        // Charger le profil utilisateur
        const profile = await UserProfileService.getCurrentUserProfile();
        console.log('✅ Profil chargé:', profile);
        setUserProfile(profile);
        setProfileError(null);
        
        // Redirection automatique basée sur le profil
        if (profile.isDirecteur) {
          console.log('👔 Directeur détecté - Vue globale');
          setActiveModule('home'); // Affiche la sélection des départements
        } else if (profile.departement) {
          console.log(`🏢 Département ${profile.departement} détecté`);
          setActiveModule('home'); // Affiche le dashboard du département
        } else {
          console.log('⚠️ Utilisateur sans département');
          setActiveModule('home'); // Affiche le message d'erreur
        }
      } catch (error) {
        console.error('❌ Erreur chargement profil:', error);
        setProfileError(error instanceof Error ? error.message : 'Erreur de chargement du profil');
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile()
  }, [])

  const handleModuleSelect = (moduleId: string) => {
    setActiveModule(moduleId)
  }

  const handleSaveForm = (data: any, isDraft: boolean) => {
    console.log('Sauvegarde formulaire:', { data, isDraft })
    
    if (!isDraft) {
      alert('✅ Rapport soumis avec succès !\n\nVotre rapport a été enregistré et sera traité automatiquement.')
    }
  }

  // Écran de chargement
  if (loadingProfile) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div className="spinner"></div>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#666',
            fontWeight: 500
          }}>
            Chargement de votre profil...
          </p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (profileError || !userProfile) {
    return (
      <div className="app-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{profileError || 'Impossible de charger votre profil'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeModule) {
      case 'home':
        return (
          <HomePageModern
            onModuleSelect={handleModuleSelect}
          />
        )
      
      // Routes pour les départements (vue Directeur)
      case 'department-DA':
        return (
          <DepartmentDashboardAnalyse
            department={getDepartment('DA')}
            userProfile={userProfile}
          />
        );
      
      case 'department-DSE':
      case 'department-DPNP':
        const deptId = activeModule.split('-')[1] as 'DSE' | 'DPNP';
        return (
          <DepartmentDashboard
            department={getDepartment(deptId)}
            userProfile={userProfile}
          />
        );
      
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
        return <ActivityManagerModern />
      
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
        return <ReportsStatistics />

      case 'objectifs':
        return <ObjectifsManagement />
      
      case 'team-monitoring':
        return <DirectorDashboard />
      
      case 'settings':
        return (
          <UserProfile 
            user={{
              name: userProfile.email,
              role: userProfile.fonction || 'Non défini',
              mail: userProfile.email,
              phone: '',
              location: '',
              department: userProfile.departement || 'Non assigné'
            }}
            onProfileRefresh={async () => {
              const newProfile = await UserProfileService.getCurrentUserProfile();
              setUserProfile(newProfile);
            }}
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
        userProfile={userProfile}
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
              Département: <strong>{userProfile.departement || 'N/A'}</strong> |
              Directeur: <strong>{userProfile.isDirecteur ? 'Oui' : 'Non'}</strong>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AppModern