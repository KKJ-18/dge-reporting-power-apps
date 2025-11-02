import { useState, useEffect } from 'react'
import { ExportButtons } from '../ExportButtons'
import { AgenceResauService } from '../../services/AgenceResauService'

interface EngagementSection {
  nombre: number
  montant: number
}

interface AdminEngagementsData {
  // Métadonnées
  semaine: string
  reseau: string // Dropdown: National, International
  agence: string // Dropdown: Casablanca, Rabat, Tanger, etc.
  
  // Section 1: Crédits amortissables
  amortissables: EngagementSection
  
  // Section 2: Crédits en découvert
  decouvert: EngagementSection
  
  // Section 3: Autres lignes de crédit
  autresLignes: EngagementSection
  
  // Section 4: Crédits restructurés
  restructures: EngagementSection
  
  // Section 5: Leasing
  leasing: EngagementSection
  
  // Section 6: Crédits islamiques
  islamiques: EngagementSection
  
  // Totaux calculés
  total_nombre: number
  total_montant: number
  
  // Commentaires
  commentaires: string
}

interface AdminEngagementsFormProps {
  onSave: (data: AdminEngagementsData, isDraft: boolean) => void
  initialData?: Partial<AdminEngagementsData>
}

export default function AdminEngagementsForm({ onSave, initialData }: AdminEngagementsFormProps) {
  const [formData, setFormData] = useState<AdminEngagementsData>({
    semaine: new Date().toISOString().split('T')[0].slice(0, 7) + '-W' + 
             Math.ceil((new Date().getDate()) / 7),
    reseau: '',
    agence: '',
    amortissables: { nombre: 0, montant: 0 },
    decouvert: { nombre: 0, montant: 0 },
    autresLignes: { nombre: 0, montant: 0 },
    restructures: { nombre: 0, montant: 0 },
    leasing: { nombre: 0, montant: 0 },
    islamiques: { nombre: 0, montant: 0 },
    total_nombre: 0,
    total_montant: 0,
    commentaires: '',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [reseaux, setReseaux] = useState<string[]>([])
  const [agences, setAgences] = useState<string[]>([])
  const [loadingAgences, setLoadingAgences] = useState(true)

  // Charger les réseaux et agences depuis SharePoint
  useEffect(() => {
    loadAgencesEtReseaux()
  }, [])

  const loadAgencesEtReseaux = async () => {
    try {
      setLoadingAgences(true)
      console.log('📊 Chargement des agences et réseaux...')
      
      const result = await AgenceResauService.getAll()
      const data = result?.data || result?.value || []
      
      console.log(`✅ ${data.length} agences/réseaux chargés`)
      
      // Extraire les réseaux uniques
      const reseauxUniques = [...new Set(data.map((item: any) => item.NomResau).filter(Boolean))] as string[]
      setReseaux(reseauxUniques)
      
      // Extraire les agences uniques
      const agencesUniques = [...new Set(data.map((item: any) => item.Title).filter(Boolean))] as string[]
      setAgences(agencesUniques)
      
      console.log('📍 Réseaux:', reseauxUniques)
      console.log('🏢 Agences:', agencesUniques)
    } catch (error) {
      console.error('❌ Erreur chargement agences:', error)
      // Valeurs par défaut en cas d'erreur
      setReseaux(['National', 'International'])
      setAgences([])
    } finally {
      setLoadingAgences(false)
    }
  }

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      handleSave(true)
    }, 30000)

    return () => clearInterval(timer)
  }, [formData])

  // Calcul automatique des totaux
  useEffect(() => {
    const totalNombre = 
      formData.amortissables.nombre +
      formData.decouvert.nombre +
      formData.autresLignes.nombre +
      formData.restructures.nombre +
      formData.leasing.nombre +
      formData.islamiques.nombre

    const totalMontant = 
      formData.amortissables.montant +
      formData.decouvert.montant +
      formData.autresLignes.montant +
      formData.restructures.montant +
      formData.leasing.montant +
      formData.islamiques.montant

    setFormData(prev => ({
      ...prev,
      total_nombre: totalNombre,
      total_montant: totalMontant
    }))
  }, [
    formData.amortissables,
    formData.decouvert,
    formData.autresLignes,
    formData.restructures,
    formData.leasing,
    formData.islamiques
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation: Réseau et agence requis
    if (!formData.reseau) {
      newErrors.reseau = 'Le réseau est obligatoire'
    }

    if (!formData.agence) {
      newErrors.agence = 'L\'agence est obligatoire'
    }

    // Validation: Si montant > 0, nombre doit être > 0
    const sections: (keyof Pick<AdminEngagementsData, 'amortissables' | 'decouvert' | 'autresLignes' | 'restructures' | 'leasing' | 'islamiques'>)[] = 
      ['amortissables', 'decouvert', 'autresLignes', 'restructures', 'leasing', 'islamiques']

    sections.forEach(section => {
      const data = formData[section]
      if (data.montant > 0 && data.nombre === 0) {
        newErrors[`${section}_nombre`] = 'Le nombre doit être > 0 si montant > 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof AdminEngagementsData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSectionChange = (
    section: keyof Pick<AdminEngagementsData, 'amortissables' | 'decouvert' | 'autresLignes' | 'restructures' | 'leasing' | 'islamiques'>,
    field: 'nombre' | 'montant',
    value: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))

    const errorKey = `${section}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleSave = async (isDraft: boolean) => {
    if (!isDraft && !validateForm()) {
      return
    }

    setSaveStatus('saving')
    
    try {
      await onSave(formData, isDraft)
      setSaveStatus('saved')
      setLastSaved(new Date())
      
      setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Erreur de sauvegarde:', error)
      setSaveStatus('idle')
    }
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const renderSection = (
    title: string,
    icon: string,
    section: keyof Pick<AdminEngagementsData, 'amortissables' | 'decouvert' | 'autresLignes' | 'restructures' | 'leasing' | 'islamiques'>
  ) => (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{icon} {title}</h3>
      </div>
      <div className="card-content">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Nombre d'engagements</label>
            <input
              type="number"
              className={`form-input ${errors[`${section}_nombre`] ? 'error' : ''}`}
              value={formData[section].nombre}
              onChange={(e) => handleSectionChange(section, 'nombre', parseInt(e.target.value) || 0)}
              min="0"
            />
            {errors[`${section}_nombre`] && (
              <span className="error-message">{errors[`${section}_nombre`]}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Montant total (MAD)</label>
            <input
              type="number"
              className="form-input"
              value={formData[section].montant}
              onChange={(e) => handleSectionChange(section, 'montant', parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
            />
            <span className="form-hint">
              {formatCurrency(formData[section].montant)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Administration des Engagements</h1>
          <p className="page-subtitle">
            Suivi détaillé des engagements de crédit par type et par agence
          </p>
        </div>
        
        <div className="form-actions">
          {saveStatus === 'saving' && (
            <span className="save-status saving">💾 Enregistrement...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="save-status saved">
              ✅ Sauvegardé {lastSaved && `à ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={() => handleSave(true)}
          >
            💾 Enregistrer brouillon
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleSave(false)}
          >
            ✅ Soumettre
          </button>
        </div>
      </div>

      {/* Informations générales */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🏢 Informations Générales</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Réseau</label>
              <select
                className={`form-input ${errors.reseau ? 'error' : ''}`}
                value={formData.reseau}
                onChange={(e) => handleInputChange('reseau', e.target.value)}
                disabled={loadingAgences}
              >
                <option value="">
                  {loadingAgences ? '⏳ Chargement...' : '-- Sélectionnez un réseau --'}
                </option>
                {reseaux.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.reseau && (
                <span className="error-message">{errors.reseau}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Agence</label>
              <select
                className={`form-input ${errors.agence ? 'error' : ''}`}
                value={formData.agence}
                onChange={(e) => handleInputChange('agence', e.target.value)}
                disabled={loadingAgences}
              >
                <option value="">
                  {loadingAgences ? '⏳ Chargement...' : '-- Sélectionnez une agence --'}
                </option>
                {agences.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {errors.agence && (
                <span className="error-message">{errors.agence}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Semaine de reporting</label>
              <input
                type="text"
                className="form-input"
                value={formData.semaine}
                onChange={(e) => handleInputChange('semaine', e.target.value)}
                placeholder="2024-W01"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sections des différents types d'engagements */}
      {renderSection('Crédits Amortissables', '💰', 'amortissables')}
      {renderSection('Crédits en Découvert', '🔴', 'decouvert')}
      {renderSection('Autres Lignes de Crédit', '📑', 'autresLignes')}
      {renderSection('Crédits Restructurés', '🔄', 'restructures')}
      {renderSection('Leasing', '🚗', 'leasing')}
      {renderSection('Crédits Islamiques', '🕌', 'islamiques')}

      {/* Totaux */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1), rgba(204, 0, 0, 0.05))' }}>
        <div className="card-header">
          <h3 className="card-title">📈 Totaux Consolidés</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Total engagements</label>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {formData.total_nombre}
              </div>
              <span className="form-hint">Somme de tous les engagements</span>
            </div>

            <div className="form-group">
              <label className="form-label">Montant total consolidé</label>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {formatCurrency(formData.total_montant)}
              </div>
              <span className="form-hint">Cumul de tous les montants</span>
            </div>
          </div>

          {/* Répartition graphique simple */}
          <div style={{ marginTop: '2rem' }}>
            <label className="form-label">Répartition par type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Amortissables', data: formData.amortissables, color: '#CC0000' },
                { label: 'Découvert', data: formData.decouvert, color: '#E63946' },
                { label: 'Autres lignes', data: formData.autresLignes, color: '#F77F00' },
                { label: 'Restructurés', data: formData.restructures, color: '#06AED5' },
                { label: 'Leasing', data: formData.leasing, color: '#118AB2' },
                { label: 'Islamiques', data: formData.islamiques, color: '#073B4C' }
              ].map(item => {
                const percentage = formData.total_montant > 0 
                  ? (item.data.montant / formData.total_montant * 100).toFixed(1)
                  : '0.0'
                
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '140px', fontSize: '0.875rem', fontWeight: '500' }}>
                      {item.label}
                    </div>
                    <div style={{ 
                      flex: 1, 
                      height: '24px', 
                      background: 'var(--gray-100)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: item.color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ 
                      width: '80px', 
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: item.color
                    }}>
                      {percentage}%
                    </div>
                    <div style={{ 
                      width: '60px', 
                      textAlign: 'right',
                      fontSize: '0.875rem',
                      color: 'var(--gray-600)'
                    }}>
                      {item.data.nombre}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">💬 Commentaires & Observations</h3>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">Remarques supplémentaires</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.commentaires}
              onChange={(e) => handleInputChange('commentaires', e.target.value)}
              placeholder="Évolutions notables, opérations exceptionnelles, points d'attention..."
            />
          </div>

          <ExportButtons 
            formData={formData} 
            formName="Administration des Engagements"
            disabled={saveStatus === 'saving'}
          />
        </div>
      </div>
    </div>
  )
}