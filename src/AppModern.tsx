import { useState, useEffect, useMemo } from 'react'
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
import DepartmentDashboardAnalyse from './components/DepartmentDashboardAnalyse'
import DepartmentDashboardDSE from './components/DepartmentDashboardDSE'
import DepartmentDashboardDPNP from './components/DepartmentDashboardDPNP'
import DirectorDashboard from './components/DirectorDashboard'
import ReportsDashboard from './components/ReportsDashboard'
import ObjectifsManagement from './components/ObjectifsManagement'
import DiagnosticPanel from './components/DiagnosticPanel'
import CategoryActivitiesPage from './components/CategoryActivitiesPage'
import HelpGuide from './components/HelpGuide'
import { UserProfileService, type UserProfile as UserProfileType } from './services/UserProfileService'
import { NotificationService } from './services/NotificationService'
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
        setUserProfile(profile);
        setProfileError(null);
        
        // Vérification quotidienne des objectifs (uniquement jours ouvrables)
        setTimeout(async () => {
          try {
            await NotificationService.performDailyCheck();
          } catch (error) {
            console.error('Erreur vérification quotidienne:', error);
          }
        }, 2000); // Attendre 2s après le chargement du profil
        
        // Redirection automatique basée sur le profil
        if (profile.isDirecteur) {
          setActiveModule('home'); // Directeur va au tableau de bord global
        } else if (profile.departement) {
          setActiveModule('home'); // Agent/Chef va à son tableau de bord
        } else {
          setActiveModule('home');
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

  // Récupérer la catégorie si on est sur une page category-xxx
  // IMPORTANT: Ce hook doit être AVANT les returns conditionnels
  const currentCategory = useMemo(() => {
    if (activeModule.startsWith('category-') && userProfile?.departement) {
      const categoryId = activeModule.replace('category-', '');
      try {
        const department = getDepartment(userProfile.departement);
        return department.categories.find(cat => cat.id === categoryId) || null;
      } catch {
        return null;
      }
    }
    return null;
  }, [activeModule, userProfile]);

  // Écran de chargement ultra moderne
  if (loadingProfile) {
    return (
      <div className="modern-loader-container">
        <div className="modern-loader-card">
          <div className="modern-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-core"></div>
          </div>
          <div className="modern-loader-text">
            Chargement de votre profil
          </div>
          <div className="loader-progress"></div>
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
    // Route pour les catégories d'activités
    if (activeModule.startsWith('category-') && userProfile?.departement && currentCategory) {
      const department = getDepartment(userProfile.departement);
      return (
        <CategoryActivitiesPage
          category={currentCategory}
          department={department}
          userProfile={userProfile}
          onNavigateToObjectifs={() => setActiveModule('objectifs')}
          onBack={() => setActiveModule('home')}
        />
      );
    }

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
            onNavigateToObjectifs={() => setActiveModule('objectifs-management')}
          />
        );
      
      case 'department-DSE':
        return (
          <DepartmentDashboardDSE
            department={getDepartment('DSE')}
            userProfile={userProfile}
            onNavigateToObjectifs={() => setActiveModule('objectifs-management')}
          />
        );

      case 'department-DPNP':
        return (
          <DepartmentDashboardDPNP
            department={getDepartment('DPNP')}
            userProfile={userProfile}
            onNavigateToObjectifs={() => setActiveModule('objectifs-management')}
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
      
      // Nouveau module unifié Rapports & Analyses
      case 'reports-dashboard':
        return <ReportsDashboard userProfile={userProfile} />
      
      case 'validation':
        return (
          <div className="page-header">
            <h1 className="page-title">✅ Validation Hiérarchique</h1>
            <p className="page-subtitle">Valider les rapports de votre équipe</p>
          </div>
        )

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
          <HelpGuide userProfile={userProfile} />
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

      {/* 🔧 Panneau de diagnostic Power SDK */}
      <DiagnosticPanel />
    </div>
  )
}

export default AppModern