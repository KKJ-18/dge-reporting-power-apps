import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import WeeklyReportForm, { type WeeklyReportData } from './components/WeeklyReportForm'
import ReportsView from './components/ReportsView'
import SubmissionTracking from './components/SubmissionTracking'
import ConsolidationView from './components/ConsolidationView'

function App() {
  const [activeTab, setActiveTab] = useState('saisie')

  const handleReportSubmit = (data: WeeklyReportData) => {
    console.log('Rapport soumis:', data)
    
    // Ici, on intégrera la logique pour envoyer les données à SharePoint
    // via les connexions Power Platform
    
    alert('✅ Rapport soumis avec succès !\n\nVotre rapport hebdomadaire a été enregistré et sera traité automatiquement.')
    
    // Simuler la sauvegarde réussie
    // Dans la vraie implémentation, on utilisera les APIs Power Platform
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'saisie':
        return <WeeklyReportForm onSubmit={handleReportSubmit} />
      case 'rapports':
        return <ReportsView />
      case 'suivi':
        return <SubmissionTracking />
      case 'consolidation':
        return <ConsolidationView />
      default:
        return <WeeklyReportForm onSubmit={handleReportSubmit} />
    }
  }

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="main-content">
        {renderActiveTab()}
        
        {/* Zone de debug pour le développement */}
        {import.meta.env.DEV && (
          <div className="card" style={{ marginTop: '2rem', opacity: 0.7 }}>
            <div className="card-header">
              <h3 className="card-title">🛠️ Informations de Debug</h3>
            </div>
            <div className="grid grid-3">
              <div>
                <strong>Statut:</strong> Application prête
              </div>
              <div>
                <strong>Environnement:</strong> {window.parent !== window ? 'Power Apps' : 'Développement'}
              </div>
              <div>
                <strong>URL:</strong> {window.location.href}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer style={{ 
        background: 'var(--dge-dark-gray)', 
        color: 'var(--dge-white)', 
        padding: '1rem 2rem', 
        textAlign: 'center' 
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            © 2025 Direction Générale de l'Économie (DGE) - Plateforme de Reporting Hebdomadaire
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
            Développé avec Power Apps • SharePoint • Power BI • Power Automate
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
