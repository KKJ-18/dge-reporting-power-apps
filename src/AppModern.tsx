import { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/SidebarTailwind'
import HomePageModern from './components/HomePageModernTailwind'
import HomePage from './components/HomePage'
import CreditClassiqueForm from './components/forms/CreditClassiqueForm'
import CreditProgrammeForm from './components/forms/CreditProgrammeForm'
import AdminEngagementsForm from './components/forms/AdminEngagementsForm'
import SuiviMEPForm from './components/forms/SuiviMEPForm'
import ActivitesAnnexesForm from './components/forms/ActivitesAnnexesForm'
import UserProfile from './components/UserProfile'
import CategoryManager from './components/CategoryManager'
import ActivityManagerModern from './components/ActivityManagerModern'
import DepartmentDashboardAnalyse from './components/DepartmentDashboardAnalyseTailwind'
import DepartmentDashboardDSE from './components/DepartmentDashboardDSETailwind'
import DepartmentDashboardDPNP from './components/DepartmentDashboardDPNPTailwind'
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

  // Écran de chargement Tailwind - Centré sur toute la page
  if (loadingProfile) {
    return (
      <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-neutral-50 via-white to-neutral-100 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-modal p-8 flex flex-col items-center gap-6 max-w-sm w-full mx-4 animate-scale-in">
          {/* Spinner moderne */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-t-primary-400 rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
          </div>
          
          {/* Texte */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-800 mb-1">Chargement en cours</h2>
            <p className="text-sm text-neutral-500">Préparation de votre espace de travail...</p>
          </div>
          
          {/* Barre de progression animée */}
          <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
              style={{ 
                animation: 'progressBar 2s ease-in-out infinite',
                width: '100%',
                transformOrigin: 'left'
              }}
            ></div>
          </div>
          <style>{`
            @keyframes progressBar {
              0% { transform: scaleX(0); }
              50% { transform: scaleX(0.7); }
              100% { transform: scaleX(1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Écran d'erreur Tailwind
  if (profileError || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-modal p-8 flex flex-col items-center gap-6 max-w-md w-full animate-scale-in">
          {/* Icône erreur */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Texte */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Erreur de chargement</h2>
            <p className="text-neutral-600">{profileError || 'Impossible de charger votre profil'}</p>
          </div>
          
          {/* Bouton */}
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réessayer
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
    <div className="flex min-h-screen w-full bg-neutral-50">
      <Sidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        userProfile={userProfile}
      />
      
      {/* Main content - prend tout l'espace restant après la sidebar */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-4 lg:p-6 w-full">
          {renderMainContent()}
        </div>
        
        {/* Zone de debug pour le développement */}
        {import.meta.env.DEV && (
          <div className="ml-6 mr-6 mb-6 p-4 bg-neutral-100 rounded-xl text-sm text-neutral-600">
            <strong className="text-neutral-800">🛠️ Debug Info:</strong>
            <div className="mt-2 flex flex-wrap gap-4">
              <span>Module: <strong className="text-primary-600">{activeModule}</strong></span>
              <span>Période: <strong className="text-primary-600">{selectedPeriod || 'Non définie'}</strong></span>
              <span>Département: <strong className="text-primary-600">{userProfile.departement || 'N/A'}</strong></span>
              <span>Directeur: <strong className="text-primary-600">{userProfile.isDirecteur ? 'Oui' : 'Non'}</strong></span>
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