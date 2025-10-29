import { useState, useEffect } from 'react'
import { ExportButtons } from '../ExportButtons'

interface SuiviMEPData {
  // Métadonnées
  mois: string // Format: YYYY-MM (fréquence mensuelle)
  dateRapport: string
  
  // Stocks
  stockInitial_nombre: number
  stockInitial_montant: number
  
  // Mouvements du mois
  entreesNouvelles_nombre: number
  entreesNouvelles_montant: number
  sortiesDecaissees_nombre: number
  sortiesDecaissees_montant: number
  sortiesAnnulees_nombre: number
  sortiesAnnulees_montant: number
  
  // Stock final calculé automatiquement
  stockFinal_nombre: number
  stockFinal_montant: number
  
  // Analyses
  tauxDecaissement: number // Calculé: (sorties décaissées / entrées) * 100
  tauxAnnulation: number // Calculé: (sorties annulées / entrées) * 100
  variationStock: number // Calculé: stock final - stock initial
  
  // Détails supplémentaires
  dossiersEnAttente_nombre: number
  dossiersEnAttente_montant: number
  dossiersRejetes_nombre: number
  dossiersRejetes_montant: number
  
  // Commentaires
  commentaires: string
}

interface SuiviMEPFormProps {
  onSave: (data: SuiviMEPData, isDraft: boolean) => void
  initialData?: Partial<SuiviMEPData>
}

export default function SuiviMEPForm({ onSave, initialData }: SuiviMEPFormProps) {
  const [formData, setFormData] = useState<SuiviMEPData>({
    mois: new Date().toISOString().slice(0, 7), // Format YYYY-MM
    dateRapport: new Date().toISOString().split('T')[0],
    stockInitial_nombre: 0,
    stockInitial_montant: 0,
    entreesNouvelles_nombre: 0,
    entreesNouvelles_montant: 0,
    sortiesDecaissees_nombre: 0,
    sortiesDecaissees_montant: 0,
    sortiesAnnulees_nombre: 0,
    sortiesAnnulees_montant: 0,
    stockFinal_nombre: 0,
    stockFinal_montant: 0,
    tauxDecaissement: 0,
    tauxAnnulation: 0,
    variationStock: 0,
    dossiersEnAttente_nombre: 0,
    dossiersEnAttente_montant: 0,
    dossiersRejetes_nombre: 0,
    dossiersRejetes_montant: 0,
    commentaires: '',
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
    // Stock final = Stock initial + Entrées - Sorties décaissées - Sorties annulées
    const stockFinalNombre = 
      formData.stockInitial_nombre + 
      formData.entreesNouvelles_nombre - 
      formData.sortiesDecaissees_nombre - 
      formData.sortiesAnnulees_nombre

    const stockFinalMontant = 
      formData.stockInitial_montant + 
      formData.entreesNouvelles_montant - 
      formData.sortiesDecaissees_montant - 
      formData.sortiesAnnulees_montant

    // Taux de décaissement
    const tauxDecaissement = formData.entreesNouvelles_montant > 0
      ? (formData.sortiesDecaissees_montant / formData.entreesNouvelles_montant) * 100
      : 0

    // Taux d'annulation
    const tauxAnnulation = formData.entreesNouvelles_montant > 0
      ? (formData.sortiesAnnulees_montant / formData.entreesNouvelles_montant) * 100
      : 0

    // Variation de stock
    const variation = stockFinalMontant - formData.stockInitial_montant

    setFormData(prev => ({
      ...prev,
      stockFinal_nombre: stockFinalNombre,
      stockFinal_montant: stockFinalMontant,
      tauxDecaissement: Math.round(tauxDecaissement * 100) / 100,
      tauxAnnulation: Math.round(tauxAnnulation * 100) / 100,
      variationStock: variation
    }))
  }, [
    formData.stockInitial_nombre,
    formData.stockInitial_montant,
    formData.entreesNouvelles_nombre,
    formData.entreesNouvelles_montant,
    formData.sortiesDecaissees_nombre,
    formData.sortiesDecaissees_montant,
    formData.sortiesAnnulees_nombre,
    formData.sortiesAnnulees_montant
  ])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validation: Le mois est obligatoire
    if (!formData.mois) {
      newErrors.mois = 'Le mois de reporting est obligatoire'
    }

    // Validation: Si montant > 0, nombre doit être > 0
    if (formData.stockInitial_montant > 0 && formData.stockInitial_nombre === 0) {
      newErrors.stockInitial_nombre = 'Le nombre doit être > 0 si montant > 0'
    }

    if (formData.entreesNouvelles_montant > 0 && formData.entreesNouvelles_nombre === 0) {
      newErrors.entreesNouvelles_nombre = 'Le nombre doit être > 0 si montant > 0'
    }

    // Vérifier que les sorties ne dépassent pas le stock disponible
    const stockDisponible = formData.stockInitial_nombre + formData.entreesNouvelles_nombre
    const totalSorties = formData.sortiesDecaissees_nombre + formData.sortiesAnnulees_nombre

    if (totalSorties > stockDisponible) {
      newErrors.sortiesDecaissees_nombre = 'Les sorties totales dépassent le stock disponible'
    }

    // Alerte si stock final négatif
    if (formData.stockFinal_nombre < 0 || formData.stockFinal_montant < 0) {
      newErrors.stockFinal = '⚠️ Stock final négatif détecté ! Vérifiez les valeurs.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof SuiviMEPData, value: any) => {
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
          <h1 className="page-title">📈 Suivi Dossiers MEP</h1>
          <p className="page-subtitle">
            Suivi mensuel des stocks de dossiers Mise En Place avec calculs automatiques
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
          <h3 className="card-title">📅 Période de Reporting</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Mois</label>
              <input
                type="month"
                className={`form-input ${errors.mois ? 'error' : ''}`}
                value={formData.mois}
                onChange={(e) => handleInputChange('mois', e.target.value)}
              />
              {errors.mois && (
                <span className="error-message">{errors.mois}</span>
              )}
              <span className="form-hint">Format: YYYY-MM (fréquence mensuelle)</span>
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

      {/* Stock initial */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📦 Stock Initial (début du mois)</h3>
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nombre de dossiers</label>
              <input
                type="number"
                className={`form-input ${errors.stockInitial_nombre ? 'error' : ''}`}
                value={formData.stockInitial_nombre}
                onChange={(e) => handleInputChange('stockInitial_nombre', parseInt(e.target.value) || 0)}
                min="0"
              />
              {errors.stockInitial_nombre && (
                <span className="error-message">{errors.stockInitial_nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Montant total (MAD)</label>
              <input
                type="number"
                className="form-input"
                value={formData.stockInitial_montant}
                onChange={(e) => handleInputChange('stockInitial_montant', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
              />
              <span className="form-hint">
                {formatCurrency(formData.stockInitial_montant)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mouvements du mois */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Mouvements du Mois</h3>
        </div>
        <div className="card-content">
          {/* Entrées */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--color-success)' }}>
              ➕ Entrées (nouveaux dossiers)
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre de dossiers</label>
                <input
                  type="number"
                  className={`form-input ${errors.entreesNouvelles_nombre ? 'error' : ''}`}
                  value={formData.entreesNouvelles_nombre}
                  onChange={(e) => handleInputChange('entreesNouvelles_nombre', parseInt(e.target.value) || 0)}
                  min="0"
                />
                {errors.entreesNouvelles_nombre && (
                  <span className="error-message">{errors.entreesNouvelles_nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Montant total (MAD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.entreesNouvelles_montant}
                  onChange={(e) => handleInputChange('entreesNouvelles_montant', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <span className="form-hint">
                  {formatCurrency(formData.entreesNouvelles_montant)}
                </span>
              </div>
            </div>
          </div>

          {/* Sorties décaissées */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--color-info)' }}>
              ✅ Sorties (décaissées)
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre de dossiers</label>
                <input
                  type="number"
                  className={`form-input ${errors.sortiesDecaissees_nombre ? 'error' : ''}`}
                  value={formData.sortiesDecaissees_nombre}
                  onChange={(e) => handleInputChange('sortiesDecaissees_nombre', parseInt(e.target.value) || 0)}
                  min="0"
                />
                {errors.sortiesDecaissees_nombre && (
                  <span className="error-message">{errors.sortiesDecaissees_nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Montant total (MAD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sortiesDecaissees_montant}
                  onChange={(e) => handleInputChange('sortiesDecaissees_montant', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <span className="form-hint">
                  {formatCurrency(formData.sortiesDecaissees_montant)}
                </span>
              </div>
            </div>
          </div>

          {/* Sorties annulées */}
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600', color: 'var(--color-error)' }}>
              ❌ Sorties (annulées)
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre de dossiers</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sortiesAnnulees_nombre}
                  onChange={(e) => handleInputChange('sortiesAnnulees_nombre', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant total (MAD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.sortiesAnnulees_montant}
                  onChange={(e) => handleInputChange('sortiesAnnulees_montant', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <span className="form-hint">
                  {formatCurrency(formData.sortiesAnnulees_montant)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock final et analyses */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1), rgba(204, 0, 0, 0.05))' }}>
        <div className="card-header">
          <h3 className="card-title">🎯 Stock Final & Analyses</h3>
          {errors.stockFinal && (
            <span className="badge badge-error">{errors.stockFinal}</span>
          )}
        </div>
        <div className="card-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Stock final (nombre)</label>
              <div className="stat-value" style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: formData.stockFinal_nombre < 0 ? 'var(--color-error)' : 'var(--dge-red)' 
              }}>
                {formData.stockFinal_nombre}
              </div>
              <span className="form-hint">
                Calculé: {formData.stockInitial_nombre} + {formData.entreesNouvelles_nombre} - {formData.sortiesDecaissees_nombre} - {formData.sortiesAnnulees_nombre}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Stock final (montant)</label>
              <div className="stat-value" style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: formData.stockFinal_montant < 0 ? 'var(--color-error)' : 'var(--dge-red)' 
              }}>
                {formatCurrency(formData.stockFinal_montant)}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Taux de décaissement</label>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>
                {formData.tauxDecaissement.toFixed(2)}%
              </div>
              <span className="form-hint">
                Dossiers décaissés / Entrées nouvelles
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Taux d'annulation</label>
              <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>
                {formData.tauxAnnulation.toFixed(2)}%
              </div>
              <span className="form-hint">
                Dossiers annulés / Entrées nouvelles
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Variation de stock</label>
              <div className="stat-value" style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: formData.variationStock > 0 ? 'var(--color-success)' : formData.variationStock < 0 ? 'var(--color-error)' : 'var(--gray-600)' 
              }}>
                {formData.variationStock > 0 ? '+' : ''}{formatCurrency(formData.variationStock)}
              </div>
              <span className="form-hint">
                Stock final - Stock initial
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Détails complémentaires */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Détails Complémentaires</h3>
        </div>
        <div className="card-content">
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
              ⏳ Dossiers en attente de décaissement
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre de dossiers</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dossiersEnAttente_nombre}
                  onChange={(e) => handleInputChange('dossiersEnAttente_nombre', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant total (MAD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dossiersEnAttente_montant}
                  onChange={(e) => handleInputChange('dossiersEnAttente_montant', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <span className="form-hint">
                  {formatCurrency(formData.dossiersEnAttente_montant)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
              🚫 Dossiers rejetés
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nombre de dossiers</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dossiersRejetes_nombre}
                  onChange={(e) => handleInputChange('dossiersRejetes_nombre', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Montant total (MAD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.dossiersRejetes_montant}
                  onChange={(e) => handleInputChange('dossiersRejetes_montant', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
                <span className="form-hint">
                  {formatCurrency(formData.dossiersRejetes_montant)}
                </span>
              </div>
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
              placeholder="Analyses de tendance, actions à mener, points d'attention..."
            />
          </div>

          <ExportButtons 
            formData={formData} 
            formName="Suivi MEP"
            disabled={saveStatus === 'saving'}
          />
        </div>
      </div>
    </div>
  )
}