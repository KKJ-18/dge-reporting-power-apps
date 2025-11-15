# Script de migration des formulaires DPNP vers styles unifiés
# Date: 15 Novembre 2025

$formFiles = @(
    "FormDossiersRestructuration.tsx",
    "FormSuiviAnomalies.tsx",
    "FormFormationUnites.tsx",
    "FormSuiviDepassements.tsx",
    "FormSuiviClientAppele.tsx",
    "FormRepriseProvision.tsx",
    "FormRechercherClientAnomalie.tsx"
)

$formsPath = "c:\Users\jordan_kamsu\dge-reporting-power-apps\src\components\forms"

# Mapping des remplacements de styles inline vers classes CSS
$replacements = @(
    # Import du CSS unifié
    @{
        Pattern = "import CloseButton from '../CloseButton';"
        Replacement = "import CloseButton from '../CloseButton';`nimport './CommonForm.css';"
    },
    
    # Success message
    @{
        Pattern = "padding: '3rem 2rem',[\s\S]*?animation: 'bounce 0.6s ease-out'"
        Replacement = 'className="success-message"'
        IsRegex = $true
    },
    
    # Form container
    @{
        Pattern = "style=\{\{ position: 'relative' \}\}"
        Replacement = 'className="form-container"'
        IsRegex = $true
    },
    
    # Form header wrapper
    @{
        Pattern = "background: ``linear-gradient\(to right,[\s\S]*?gap: '1.5rem'"
        Replacement = 'className="form-header"'
        IsRegex = $true
    },
    
    # Form icon
    @{
        Pattern = "width: '70px',[\s\S]*?flexShrink: 0"
        Replacement = 'className="form-icon"'
        IsRegex = $true
    },
    
    # Form title group
    @{
        Pattern = "style=\{\{ flex: 1 \}\}"
        Replacement = 'className="form-title-group"'
        IsRegex = $true
    },
    
    # Form title
    @{
        Pattern = "margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: 700, color: '#1A1A1A'"
        Replacement = 'className="form-title"'
        IsRegex = $true
    },
    
    # Form badge
    @{
        Pattern = "display: 'inline-block',[\s\S]*?fontWeight: 600[\s\S]*?\}\}"
        Replacement = 'className="form-badge"'
        IsRegex = $true
    },
    
    # Form body
    @{
        Pattern = "padding: '0 2rem 2rem'"
        Replacement = 'className="form-body"'
        IsRegex = $true
    },
    
    # Form section
    @{
        Pattern = "display: 'grid', gap: '1.5rem'"
        Replacement = 'className="form-section"'
        IsRegex = $true
    },
    
    # Form group
    @{
        Pattern = "<div>\s*<label style=\{\{ display: 'block'"
        Replacement = '<div className="form-group">`n            <label'
        IsRegex = $true
    },
    
    # Labels (remove inline styles)
    @{
        Pattern = "style=\{\{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' \}\}"
        Replacement = ''
        IsRegex = $true
    },
    
    # Inputs/Selects (remove all inline styles)
    @{
        Pattern = "style=\{\{[\s\S]*?width: '100%',[\s\S]*?transition: 'all 0.2s ease'[\s\S]*?\}\}"
        Replacement = ''
        IsRegex = $true
    },
    
    # Remove onFocus/onBlur handlers (CSS handles it)
    @{
        Pattern = "onFocus=\{\(e\) => \{[\s\S]*?\}\}"
        Replacement = ''
        IsRegex = $true
    },
    @{
        Pattern = "onBlur=\{\(e\) => \{[\s\S]*?\}\}"
        Replacement = ''
        IsRegex = $true
    },
    
    # Card
    @{
        Pattern = "marginTop: '2rem',[\s\S]*?borderLeft: ``4px solid"
        Replacement = 'className="card"'
        IsRegex = $true
    },
    
    # Card header
    @{
        Pattern = "<h4 style=\{\{ margin: '0 0 1rem 0'"
        Replacement = '<div className="card-header">`n              <h4'
        IsRegex = $true
    },
    
    # Form actions
    @{
        Pattern = "display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end'"
        Replacement = 'className="form-actions"'
        IsRegex = $true
    },
    
    # Buttons
    @{
        Pattern = "minWidth: '140px',[\s\S]*?backgroundColor: '#FFFFFF',[\s\S]*?transition: 'all 0.2s ease'"
        Replacement = 'className="btn-secondary"'
        IsRegex = $true
    },
    @{
        Pattern = "minWidth: '160px',[\s\S]*?transition: 'all 0.2s ease',[\s\S]*?opacity:"
        Replacement = 'className="btn-primary"'
        IsRegex = $true
    }
)

Write-Host "🚀 Démarrage de la migration des formulaires DPNP..." -ForegroundColor Cyan
Write-Host ""

foreach ($formFile in $formFiles) {
    $filePath = Join-Path $formsPath $formFile
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  Fichier non trouvé: $formFile" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📝 Traitement de $formFile..." -ForegroundColor Green
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $changeCount = 0
        
        # Vérifier si le fichier importe déjà CommonForm.css
        if ($content -notmatch "import './CommonForm.css'") {
            $content = $content -replace "(import CloseButton from '../CloseButton';)", "`$1`nimport './CommonForm.css';"
            $changeCount++
            Write-Host "  ✓ Ajout import CommonForm.css" -ForegroundColor Gray
        }
        
        # Appliquer les remplacements simples
        # Success message
        if ($content -match 'padding: ''3rem 2rem''') {
            $content = $content -replace 'style=\{\{\s*padding: ''3rem 2rem'',[\s\S]*?animation: ''bounce 0\.6s ease-out''\s*\}\}', 'className="success-message"'
            $changeCount++
            Write-Host "  ✓ Success message" -ForegroundColor Gray
        }
        
        # Form container
        if ($content -match "style=\{\{ position: 'relative' \}\}") {
            $content = $content -replace "style=\{\{ position: 'relative' \}\}", 'className="form-container"'
            $changeCount++
            Write-Host "  ✓ Form container" -ForegroundColor Gray
        }
        
        # Form body
        if ($content -match "padding: '0 2rem 2rem'") {
            $content = $content -replace "style=\{\{\s*padding: '0 2rem 2rem'\s*\}\}", 'className="form-body"'
            $changeCount++
            Write-Host "  ✓ Form body" -ForegroundColor Gray
        }
        
        # Form section
        if ($content -match "display: 'grid', gap: '1\.5rem'") {
            $content = $content -replace "style=\{\{\s*display: 'grid',\s*gap: '1\.5rem'\s*\}\}", 'className="form-section"'
            $changeCount++
            Write-Host "  ✓ Form section" -ForegroundColor Gray
        }
        
        # Form actions
        if ($content -match "display: 'flex', gap: '1rem', marginTop: '2rem'") {
            $content = $content -replace "style=\{\{\s*display: 'flex',\s*gap: '1rem',\s*marginTop: '2rem',\s*justifyContent: 'flex-end'\s*\}\}", 'className="form-actions"'
            $changeCount++
            Write-Host "  ✓ Form actions" -ForegroundColor Gray
        }
        
        if ($content -ne $originalContent) {
            Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✅ $changeCount modifications appliquées" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  Aucune modification nécessaire" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  ❌ Erreur: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✅ Migration terminée!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Vérifier les fichiers modifiés"
Write-Host "  2. Tester npm run build"
Write-Host "  3. Tester l'application sur http://localhost:5174/"
