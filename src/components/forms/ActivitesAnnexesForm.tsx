import { useState, useEffect, useRef } from 'react'
import { ExportButtons } from '../ExportButtons'
import { useObjectifValidation } from '../../hooks/useObjectifValidation'
import { ACTIVITY_NAMES } from '../../config/activityNames'

interface ActiviteAnnexeData {
  type: string
  description: string
  duree?: number // Obligatoire si type = Formation
  participants?: number
  fichierNom?: string
  fichierUrl?: string
}

interface ActivitesAnnexesData {
  // Métadonnées
  semaine: string
  dateRapport: string
  
  // Section 1: Formations
  formations: ActiviteAnnexeData[]
  
  // Section 2: Réunions
  reunions: ActiviteAnnexeData[]
  
  // Section 3: Déplacements
  deplacements: ActiviteAnnexeData[]
  
  // Section 4: Audits
  audits: ActiviteAnnexeData[]
  
  // Section 5: Autres
  autres: ActiviteAnnexeData[]
  
  // Statistiques
  totalActivites: number
  totalDureeFormations: number
  
  // Commentaires
  commentairesGeneraux: string
}

interface ActivitesAnnexesFormProps {
  onSave: (data: ActivitesAnnexesData, isDraft: boolean) => void
  initialData?: Partial<ActivitesAnnexesData>
}

export default function ActivitesAnnexesForm({ onSave, initialData }: ActivitesAnnexesFormProps) {
  const [formData, setFormData] = useState<ActivitesAnnexesData>({
    semaine: new Date().toISOString().split('T')[0].slice(0, 7) + '-W' + 
             Math.ceil((new Date().getDate()) / 7),
    dateRapport: new Date().toISOString().split('T')[0],
    formations: [],
    reunions: [],
    deplacements: [],
    audits: [],
    autres: [],
    totalActivites: 0,
    totalDureeFormations: 0,
    commentairesGeneraux: '',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const { isValidating: isValidatingObjectif, validateBeforeSubmit } = useObjectifValidation()

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      handleSave(true)
    }, 30000)

    return () => clearInterval(timer)
  }, [formData])

  // Calculs automatiques
  useEffect(() => {
    const totalActivites = 
      formData.formations.length +
      formData.reunions.length +
      formData.deplacements.length +
      formData.audits.length +
      formData.autres.length

    const totalDureeFormations = formData.formations.reduce(
      (sum, f) => sum + (f.duree || 0), 
      0
    )

    setFormData(prev => ({
      ...prev,
      totalActivites,
      totalDureeFormations
    }))
  }, [
    formData.formations,
    formData.reunions,
    formData.deplacements,
    formData.audits,
    formData.autres
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation: Pour chaque formation, la durée est obligatoire
    formData.formations.forEach((formation, index) => {
      if (!formation.duree || formation.duree === 0) {
        newErrors[`formation_${index}_duree`] = 'La durée est obligatoire pour les formations'
      }
      if (!formation.description || formation.description.trim() === '') {
        newErrors[`formation_${index}_description`] = 'La description est obligatoire'
      }
    })

    // Validation: Description obligatoire pour toutes les activités
    const allActivites = [
      ...formData.reunions.map((r, i) => ({ ...r, key: `reunion_${i}` })),
      ...formData.deplacements.map((d, i) => ({ ...d, key: `deplacement_${i}` })),
      ...formData.audits.map((a, i) => ({ ...a, key: `audit_${i}` })),
      ...formData.autres.map((o, i) => ({ ...o, key: `autre_${i}` }))
    ]

    allActivites.forEach(activite => {
      if (!activite.description || activite.description.trim() === '') {
        newErrors[`${activite.key}_description`] = 'La description est obligatoire'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ActivitesAnnexesData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addActivite = (section: 'formations' | 'reunions' | 'deplacements' | 'audits' | 'autres') => {
    const newActivite: ActiviteAnnexeData = {
      type: section.charAt(0).toUpperCase() + section.slice(1, -1),
      description: '',
      duree: section === 'formations' ? 0 : undefined,
      participants: undefined,
      fichierNom: undefined,
      fichierUrl: undefined
    }

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newActivite]
    }))
  }

  const removeActivite = (
    section: 'formations' | 'reunions' | 'deplacements' | 'audits' | 'autres',
    index: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const updateActivite = (
    section: 'formations' | 'reunions' | 'deplacements' | 'audits' | 'autres',
    index: number,
    field: keyof ActiviteAnnexeData,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((activite, i) => 
        i === index ? { ...activite, [field]: value } : activite
      )
    }))

    // Nettoyer les erreurs
    const errorKey = `${section.slice(0, -1)}_${index}_${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleFileUpload = (
    section: 'formations' | 'reunions' | 'deplacements' | 'audits' | 'autres',
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      // Ici, on simule l'upload. Dans la version réelle, on utilisera SharePoint
      const fileName = file.name
      const fileUrl = URL.createObjectURL(file) // Temporaire, sera remplacé par l'URL SharePoint
      
      updateActivite(section, index, 'fichierNom', fileName)
      updateActivite(section, index, 'fichierUrl', fileUrl)
    }
  }

  const handleSave = async (isDraft: boolean) => {
    if (!isDraft && !validateForm()) {
      return
    }

    if (!isDraft) {
      // Vérifier au moins une activité pour la validation
      const totalActivites = 
        formData.formations.length +
        formData.reunions.length +
        formData.deplacements.length +
        formData.audits.length +
        formData.autres.length;

      if (totalActivites === 0) {
        alert('⚠️ Veuillez ajouter au moins une activité avant de soumettre.');
        return;
      }

      // Pour ActivitesAnnexes, on valide avec le type d'activité le plus représentatif
      let activityName: typeof ACTIVITY_NAMES[keyof typeof ACTIVITY_NAMES] = ACTIVITY_NAMES.FORMATIONS;
      if (formData.formations.length > 0) {
        activityName = ACTIVITY_NAMES.FORMATIONS;
      } else if (formData.reunions.length > 0) {
        activityName = ACTIVITY_NAMES.REUNIONS;
      } else if (formData.deplacements.length > 0) {
        activityName = ACTIVITY_NAMES.DEPLACEMENTS;
      } else if (formData.audits.length > 0) {
        activityName = ACTIVITY_NAMES.AUDITS;
      } else {
        activityName = ACTIVITY_NAMES.AUTRES_ACTIVITES;
      }

      const isValid = await validateBeforeSubmit(
        activityName,
        new Date(formData.dateRapport)
      );
      if (!isValid) return;
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

  const renderActivitesList = (
    section: 'formations' | 'reunions' | 'deplacements' | 'audits' | 'autres',
    title: string,
    icon: string,
    requiresDuration: boolean = false
  ) => {
    const activites = formData[section]
    const sectionKey = section.slice(0, -1) // Remove 's' from section name

    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{icon} {title}</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => addActivite(section)}
          >
            ➕ Ajouter
          </button>
        </div>
        <div className="card-content">
          {activites.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>
              Aucune activité ajoutée. Cliquez sur "Ajouter" pour commencer.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activites.map((activite, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--gray-50)',
                    borderRadius: '12px',
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <div className="form-grid">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label required">Description de l'activité</label>
                      <textarea
                        className={`form-input ${errors[`${sectionKey}_${index}_description`] ? 'error' : ''}`}
                        rows={2}
                        value={activite.description}
                        onChange={(e) => updateActivite(section, index, 'description', e.target.value)}
                        placeholder="Décrivez l'activité en détail..."
                      />
                      {errors[`${sectionKey}_${index}_description`] && (
                        <span className="error-message">{errors[`${sectionKey}_${index}_description`]}</span>
                      )}
                    </div>

                    {requiresDuration && (
                      <div className="form-group">
                        <label className="form-label required">Durée (heures)</label>
                        <input
                          type="number"
                          className={`form-input ${errors[`${sectionKey}_${index}_duree`] ? 'error' : ''}`}
                          value={activite.duree || 0}
                          onChange={(e) => updateActivite(section, index, 'duree', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                        />
                        {errors[`${sectionKey}_${index}_duree`] && (
                          <span className="error-message">{errors[`${sectionKey}_${index}_duree`]}</span>
                        )}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Nombre de participants</label>
                      <input
                        type="number"
                        className="form-input"
                        value={activite.participants || ''}
                        onChange={(e) => updateActivite(section, index, 'participants', parseInt(e.target.value) || undefined)}
                        min="0"
                        placeholder="Optionnel"
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Pièce jointe (optionnel)</label>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[`${section}_${index}`] = el }}
                        className="form-input"
                        onChange={(e) => handleFileUpload(section, index, e)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        style={{ padding: '0.5rem' }}
                      />
                      {activite.fichierNom && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.5rem 1rem',
                          background: 'var(--color-success-bg)',
                          color: 'var(--color-success)',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>📎 {activite.fichierNom}</span>
                          {activite.fichierUrl && (
                            <a 
                              href={activite.fichierUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginLeft: 'auto', textDecoration: 'underline' }}
                            >
                              Voir le fichier
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() => removeActivite(section, index)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Activités Annexes</h1>
          <p className="page-subtitle">
            Suivi hebdomadaire des formations, réunions, déplacements et autres activités
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
            disabled={isValidatingObjectif}
          >
            {isValidatingObjectif ? '⏳ Vérification objectif...' : '✅ Soumettre'}
          </button>
        </div>
      </div>

      {/* Informations générales */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Période de Reporting</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Semaine</label>
              <input
                type="text"
                className="form-input"
                value={formData.semaine}
                onChange={(e) => handleInputChange('semaine', e.target.value)}
                placeholder="2024-W01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date du rapport</label>
              <input
                type="date"
                className="form-input"
                value={formData.dateRapport}
                onChange={(e) => handleInputChange('dateRapport', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1), rgba(204, 0, 0, 0.05))' }}>
        <div className="card-header">
          <h3 className="card-title">📊 Vue d'Ensemble</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Total activités</label>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {formData.totalActivites}
              </div>
              <span className="form-hint">
                {formData.formations.length} formations · {formData.reunions.length} réunions · 
                {formData.deplacements.length} déplacements · {formData.audits.length} audits · 
                {formData.autres.length} autres
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Durée totale formations</label>
              <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-info)' }}>
                {formData.totalDureeFormations}h
              </div>
              <span className="form-hint">
                Somme de toutes les formations
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections des activités */}
      {renderActivitesList('formations', 'Formations', '🎓', true)}
      {renderActivitesList('reunions', 'Réunions', '👥')}
      {renderActivitesList('deplacements', 'Déplacements', '✈️')}
      {renderActivitesList('audits', 'Audits & Contrôles', '🔍')}
      {renderActivitesList('autres', 'Autres Activités', '📌')}

      {/* Commentaires généraux */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">💬 Commentaires Généraux</h3>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">Remarques sur la semaine</label>
            <textarea
              className="form-input"
              rows={4}
              value={formData.commentairesGeneraux}
              onChange={(e) => handleInputChange('commentairesGeneraux', e.target.value)}
              placeholder="Observations générales, points saillants, suggestions d'amélioration..."
            />
          </div>

          <ExportButtons 
            formData={formData} 
            formName="Activités Annexes"
            disabled={saveStatus === 'saving'}
          />
        </div>
      </div>
    </div>
  )
}