import { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import Sidebar from './components/SidebarModern'
import AppShell from './components/ui/AppShell'
import AnimatedLoader from './components/ui/AnimatedLoader'
import { UserProfileService, type UserProfile as UserProfileType } from './services/UserProfileService'
import { NotificationService } from './services/NotificationService'
import { getDepartment, loadDepartments } from './config/departmentsData'
import { canAccessModule, getDefaultModule } from './config/navigationAccess'
import { debugLog, debugWarn } from './utils/logger'

const HomePage = lazy(() => import('./components/HomePage'))
const CreditClassiqueForm = lazy(() => import('./components/forms/CreditClassiqueForm'))
const CreditProgrammeForm = lazy(() => import('./components/forms/CreditProgrammeForm'))
const AdminEngagementsForm = lazy(() => import('./components/forms/AdminEngagementsForm'))
const SuiviMEPForm = lazy(() => import('./components/forms/SuiviMEPForm'))
const ActivitesAnnexesForm = lazy(() => import('./components/forms/ActivitesAnnexesForm'))
const UserProfile = lazy(() => import('./components/UserProfile'))
const CategoryManager = lazy(() => import('./components/CategoryManager'))
const ActivityManagerModern = lazy(() => import('./components/ActivityManagerModern'))
const DepartmentDashboardAnalyse = lazy(() => import('./components/DepartmentDashboardAnalyseTailwind'))
const DepartmentDashboardDSE = lazy(() => import('./components/DepartmentDashboardDSETailwind'))
const DepartmentDashboardDPNP = lazy(() => import('./components/DepartmentDashboardDPNPTailwind'))
const DirectorDashboard = lazy(() => import('./components/DirectorDashboard'))
const ReportsDashboardModern = lazy(() => import('./components/ReportsDashboardModern'))
const ObjectifsManagement = lazy(() => import('./components/ObjectifsManagement'))
const DiagnosticPanel = lazy(() => import('./components/DiagnosticPanel'))
const CategoryActivitiesPage = lazy(() => import('./components/CategoryActivitiesPage'))
const HelpGuide = lazy(() => import('./components/HelpGuide'))
const SuiviRecouvrementGFC = lazy(() => import('./components/SuiviRecouvrementGFC'))
const DashboardModern = lazy(() => import('./components/DashboardModern'))
const AssistantDCEDashboard = lazy(() => import('./components/AssistantDCEDashboard'))

function AppModern() {
  const [activeModule, setActiveModule] = useState('home')
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
        setActiveModule(getDefaultModule(profile));
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
    if (!userProfile) return;
    if (!canAccessModule(userProfile, moduleId)) {
      debugWarn(`Accès refusé au module: ${moduleId}`);
      setActiveModule(getDefaultModule(userProfile));
      return;
    }
    setActiveModule(moduleId)
  }

  const handleSaveForm = (data: any, isDraft: boolean) => {
    debugLog('Sauvegarde formulaire:', { data, isDraft })
    
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

  // Écran de chargement - AnimatedLoader V2
  if (loadingProfile) {
    return <AnimatedLoader />;
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
    // Route spéciale pour "Suivi des actions de recouvrement pour les GFC"
    if (activeModule === 'category-suivi-recouvrement-gfc' || 
        activeModule === 'category-suivi-des-actions-de-recouvrement-pour-les-gfc') {
      return <SuiviRecouvrementGFC onClose={() => handleModuleSelect('home')} />;
    }
    
    // Route pour les catégories d'activités
    if (activeModule.startsWith('category-') && userProfile?.departement && currentCategory) {
      const department = getDepartment(userProfile.departement);
      return (
        <CategoryActivitiesPage
          category={currentCategory}
          department={department}
          userProfile={userProfile}
          onNavigateToObjectifs={() => handleModuleSelect('objectifs')}
          onBack={() => handleModuleSelect('home')}
        />
      );
    }

    switch (activeModule) {
      case 'home':
        return (
          <DashboardModern
            onModuleSelect={handleModuleSelect}
          />
        )
      
      // Routes pour les départements (vue Directeur)
      case 'department-DA':
        return (
          <DepartmentDashboardAnalyse
            department={getDepartment('DA')}
            userProfile={userProfile}
            onNavigateToObjectifs={() => handleModuleSelect('objectifs-management')}
          />
        );
      
      case 'department-DSE':
        return (
          <DepartmentDashboardDSE
            department={getDepartment('DSE')}
            userProfile={userProfile}
            onNavigateToObjectifs={() => handleModuleSelect('objectifs-management')}
          />
        );

      case 'department-DPNP':
        return (
          <DepartmentDashboardDPNP
            department={getDepartment('DPNP')}
            userProfile={userProfile}
            onNavigateToObjectifs={() => handleModuleSelect('objectifs-management')}
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
        return <ReportsDashboardModern userProfile={userProfile} />
      
      case 'validation':
        return (
          <div className="page-header">
            <h1 className="page-title">✅ Validation Hiérarchique</h1>
            <p className="page-subtitle">Valider les rapports de votre équipe</p>
          </div>
        )

      case 'objectifs':
        return <ObjectifsManagement />

      case 'objectifs-management':
        return <ObjectifsManagement />
      
      case 'team-monitoring':
        return <DirectorDashboard />

      case 'assistant-dce':
        return <AssistantDCEDashboard userProfile={userProfile} />
      
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
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      sidebar={
        <Sidebar
          activeModule={activeModule}
          onModuleChange={handleModuleSelect}
          userProfile={userProfile}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      }
      debugPanel={
        import.meta.env.DEV ? (
          <div className="ui-debug-card">
            <strong className="ui-debug-title">🛠️ Debug Info:</strong>
            <div className="ui-debug-row">
              <span>Module: <strong className="ui-debug-value">{activeModule}</strong></span>
              <span>Période: <strong className="ui-debug-value">{selectedPeriod || 'Non définie'}</strong></span>
              <span>Département: <strong className="ui-debug-value">{userProfile.departement || 'N/A'}</strong></span>
              <span>Directeur: <strong className="ui-debug-value">{userProfile.isDirecteur ? 'Oui' : 'Non'}</strong></span>
              <span>Assistant DCE: <strong className="ui-debug-value">{userProfile.isAssistantDCE ? 'Oui' : 'Non'}</strong></span>
            </div>
          </div>
        ) : undefined
      }
    >
      <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Chargement du module...</div>}>
        {renderMainContent()}
      </Suspense>
      {/* 🔧 Panneau de diagnostic Power SDK */}
      <Suspense fallback={null}>
        <DiagnosticPanel />
      </Suspense>
    </AppShell>
  )
}

export default AppModern