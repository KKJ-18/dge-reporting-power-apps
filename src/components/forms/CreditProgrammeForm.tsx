import { useState, useEffect } from 'react'
import { ExportButtons } from '../ExportButtons'

interface CreditProgrammeData {
  // Dossiers reçus
  dossiersRecus_nombre: number
  dossiersRecus_montant: number
  dossiersRecus_date: string
  
  // Dossiers traités
  dossiersTraites_nombre: number
  dossiersTraites_montant: number
  
  // Calculs de délais
  delai_DCE: number // Délai moyen entre réception et présentation DCE
  delai_unite: number // Délai entre DCE et avis unité
  delai_decaissement: number // Délai entre accord et décaissement
  
  // Dossiers en attente
  enAttenteDCE_nombre: number
  enAttenteDCE_montant: number
  enAttenteAvis_nombre: number
  enAttenteAvis_montant: number
  enAttenteDecaissement_nombre: number
  enAttenteDecaissement_montant: number
  
  // Statistiques
  tauxTraitement: number // Calculé automatiquement
  delaiMoyenTotal: number // Somme des délais moyens
  
  // Métadonnées
  commentaires: string
  semaine: string
}

interface CreditProgrammeFormProps {
  onSave: (data: CreditProgrammeData, isDraft: boolean) => void
  initialData?: Partial<CreditProgrammeData>
}

export default function CreditProgrammeForm({ onSave, initialData }: CreditProgrammeFormProps) {
  const [formData, setFormData] = useState<CreditProgrammeData>({
    dossiersRecus_nombre: 0,
    dossiersRecus_montant: 0,
    dossiersRecus_date: '',
    dossiersTraites_nombre: 0,
    dossiersTraites_montant: 0,
    delai_DCE: 0,
    delai_unite: 0,
    delai_decaissement: 0,
    enAttenteDCE_nombre: 0,
    enAttenteDCE_montant: 0,
    enAttenteAvis_nombre: 0,
    enAttenteAvis_montant: 0,
    enAttenteDecaissement_nombre: 0,
    enAttenteDecaissement_montant: 0,
    tauxTraitement: 0,
    delaiMoyenTotal: 0,
    commentaires: '',
    semaine: new Date().toISOString().split('T')[0].slice(0, 7) + '-W' + 
             Math.ceil((new Date().getDate()) / 7),
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(() => {
      handleSave(true)
    }, 30000)

    return () => clearInterval(timer)
  }, [formData])

  // Calculs automatiques
  useEffect(() => {
    const total = formData.delai_DCE + formData.delai_unite + formData.delai_decaissement
    const taux = formData.dossiersRecus_nombre > 0 
      ? (formData.dossiersTraites_nombre / formData.dossiersRecus_nombre) * 100 
      : 0

    setFormData(prev => ({
      ...prev,
      delaiMoyenTotal: total,
      tauxTraitement: Math.round(taux * 100) / 100
    }))
  }, [
    formData.delai_DCE, 
    formData.delai_unite, 
    formData.delai_decaissement,
    formData.dossiersRecus_nombre,
    formData.dossiersTraites_nombre
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation: Si montant > 0, nombre doit être > 0
    if (formData.dossiersRecus_montant > 0 && formData.dossiersRecus_nombre === 0) {
      newErrors.dossiersRecus_nombre = 'Le nombre de dossiers doit être > 0 si montant > 0'
    }

    if (formData.dossiersTraites_montant > 0 && formData.dossiersTraites_nombre === 0) {
      newErrors.dossiersTraites_nombre = 'Le nombre de dossiers doit être > 0 si montant > 0'
    }

    // Alerte si délai moyen total > 10 jours
    if (formData.delaiMoyenTotal > 10) {
      newErrors.delaiMoyenTotal = '⚠️ Attention : Le délai total dépasse 10 jours !'
    }

    // Vérification cohérence délais
    if (formData.delai_DCE < 0 || formData.delai_unite < 0 || formData.delai_decaissement < 0) {
      newErrors.delai_DCE = 'Les délais ne peuvent pas être négatifs'
    }

    // Les dossiers traités ne peuvent pas excéder les dossiers reçus
    if (formData.dossiersTraites_nombre > formData.dossiersRecus_nombre) {
      newErrors.dossiersTraites_nombre = 'Ne peut pas dépasser le nombre de dossiers reçus'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CreditProgrammeData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Nettoyer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
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

  return (
    <div className="form-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Crédit Programme</h1>
          <p className="page-subtitle">
            Suivi des dossiers de crédit programme avec calcul automatique des délais de traitement
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

      {/* Section 1: Dossiers reçus */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📥 Dossiers Reçus</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Nombre de dossiers</label>
              <input
                type="number"
                className={`form-input ${errors.dossiersRecus_nombre ? 'error' : ''}`}
                value={formData.dossiersRecus_nombre}
                onChange={(e) => handleInputChange('dossiersRecus_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
              {errors.dossiersRecus_nombre && (
                <span className="error-message">{errors.dossiersRecus_nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label required">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.dossiersRecus_montant}
                onChange={(e) => handleInputChange('dossiersRecus_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">
                {formatCurrency(formData.dossiersRecus_montant)}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Date de réception</label>
              <input
                type="date"
                className="form-input"
                value={formData.dossiersRecus_date}
                onChange={(e) => handleInputChange('dossiersRecus_date', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Dossiers traités */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">✅ Dossiers Traités</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className={`form-input ${errors.dossiersTraites_nombre ? 'error' : ''}`}
                value={formData.dossiersTraites_nombre}
                onChange={(e) => handleInputChange('dossiersTraites_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
              {errors.dossiersTraites_nombre && (
                <span className="error-message">{errors.dossiersTraites_nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.dossiersTraites_montant}
                onChange={(e) => handleInputChange('dossiersTraites_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">
                {formatCurrency(formData.dossiersTraites_montant)}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Taux de traitement</label>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {formData.tauxTraitement.toFixed(2)}%
              </div>
              <span className="form-hint">
                Calculé automatiquement : {formData.dossiersTraites_nombre} / {formData.dossiersRecus_nombre}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Calculs des délais */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⏱️ Délais de Traitement (en jours)</h3>
          {formData.delaiMoyenTotal > 10 && (
            <span className="badge badge-warning">⚠️ Délai total &gt; 10 jours</span>
          )}
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Délai moyen réception → DCE</label>
              <input
                type="number"
                className={`form-input ${errors.delai_DCE ? 'error' : ''}`}
                value={formData.delai_DCE}
                onChange={(e) => handleInputChange('delai_DCE', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
              {errors.delai_DCE && (
                <span className="error-message">{errors.delai_DCE}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Délai moyen DCE → Avis unité</label>
              <input
                type="number"
                className="form-input"
                value={formData.delai_unite}
                onChange={(e) => handleInputChange('delai_unite', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Délai moyen Accord → Décaissement</label>
              <input
                type="number"
                className="form-input"
                value={formData.delai_decaissement}
                onChange={(e) => handleInputChange('delai_decaissement', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Délai moyen total de la chaîne</label>
              <div className={`stat-value ${formData.delaiMoyenTotal > 10 ? 'error' : ''}`} 
                   style={{ fontSize: '2rem', fontWeight: 'bold', color: formData.delaiMoyenTotal > 10 ? 'var(--color-error)' : 'var(--dge-red)' }}>
                {formData.delaiMoyenTotal.toFixed(1)} jours
              </div>
              <span className="form-hint">
                Somme automatique : {formData.delai_DCE} + {formData.delai_unite} + {formData.delai_decaissement}
              </span>
              {formData.delaiMoyenTotal > 10 && (
                <span className="error-message" style={{ marginTop: '0.5rem', display: 'block' }}>
                  ⚠️ Le délai total dépasse le seuil d'alerte de 10 jours. Veuillez vérifier les goulots d'étranglement.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Dossiers en attente */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⏳ Dossiers en Attente</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                En attente présentation DCE
              </h4>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteDCE_nombre}
                onChange={(e) => handleInputChange('enAttenteDCE_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteDCE_montant}
                onChange={(e) => handleInputChange('enAttenteDCE_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">{formatCurrency(formData.enAttenteDCE_montant)}</span>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem', fontWeight: '600' }}>
                En attente avis unité
              </h4>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteAvis_nombre}
                onChange={(e) => handleInputChange('enAttenteAvis_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteAvis_montant}
                onChange={(e) => handleInputChange('enAttenteAvis_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">{formatCurrency(formData.enAttenteAvis_montant)}</span>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <h4 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem', fontWeight: '600' }}>
                En attente décaissement
              </h4>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteDecaissement_nombre}
                onChange={(e) => handleInputChange('enAttenteDecaissement_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.enAttenteDecaissement_montant}
                onChange={(e) => handleInputChange('enAttenteDecaissement_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">{formatCurrency(formData.enAttenteDecaissement_montant)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Commentaires */}
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
              placeholder="Précisions sur les délais, difficultés rencontrées, actions correctives..."
            />
          </div>

          <ExportButtons 
            formData={formData} 
            formName="Crédit Programme"
            disabled={saveStatus === 'saving'}
          />
        </div>
      </div>
    </div>
  )
}