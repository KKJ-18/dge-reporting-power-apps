# Script PowerShell pour ajouter la catégorie "Suivi des actions de recouvrement pour les GFC"
# dans la table SharePoint Activity

<#
.SYNOPSIS
    Ajoute la catégorie de suivi de recouvrement pour le département DPNP

.DESCRIPTION
    Ce script ajoute une nouvelle catégorie dans la table Activity de SharePoint
    pour permettre le suivi des actions de recouvrement pour les GFC du département DPNP.

.NOTES
    Auteur: Équipe DGE
    Date: 2025-12-08
    Version: 1.0
#>

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Ajout de la catégorie Suivi Recouvrement GFC (DPNP)         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$categoryInfo = @{
    CategoryName = "Suivi des actions de recouvrement pour les GFC"
    CategoryID = "suivi-recouvrement-gfc"
    Departement = "DPNP"
    Icon = "💰"
    Description = "Gestion des actions de recouvrement pour les clients en anomalie"
}

Write-Host "📋 Informations de la catégorie à créer:" -ForegroundColor Yellow
Write-Host "   Nom: $($categoryInfo.CategoryName)" -ForegroundColor White
Write-Host "   ID: $($categoryInfo.CategoryID)" -ForegroundColor White
Write-Host "   Département: $($categoryInfo.Departement)" -ForegroundColor White
Write-Host "   Icône: $($categoryInfo.Icon)" -ForegroundColor White
Write-Host ""

# Vérifier si l'utilisateur veut continuer
$confirm = Read-Host "Voulez-vous continuer? (O/N)"
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "❌ Opération annulée par l'utilisateur" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔧 Méthode d'ajout de la catégorie:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Via Power Apps" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "1. Ouvrir l'application Power Apps" -ForegroundColor White
Write-Host "2. Accéder au module 'Gestion des Catégories'" -ForegroundColor White
Write-Host "3. Cliquer sur '+ Nouvelle Catégorie'" -ForegroundColor White
Write-Host "4. Remplir les champs:" -ForegroundColor White
Write-Host "   - Nom: $($categoryInfo.CategoryName)" -ForegroundColor Gray
Write-Host "   - ID: $($categoryInfo.CategoryID)" -ForegroundColor Gray
Write-Host "   - Département: $($categoryInfo.Departement)" -ForegroundColor Gray
Write-Host "   - Icône: $($categoryInfo.Icon)" -ForegroundColor Gray
Write-Host "5. Enregistrer" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Directement dans SharePoint" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "1. Accéder à la liste SharePoint 'Activity'" -ForegroundColor White
Write-Host "2. Cliquer sur '+ Nouveau'" -ForegroundColor White
Write-Host "3. Remplir les champs:" -ForegroundColor White
Write-Host "   - CategoryName: $($categoryInfo.CategoryName)" -ForegroundColor Gray
Write-Host "   - CategoryID: $($categoryInfo.CategoryID)" -ForegroundColor Gray
Write-Host "   - Departement: $($categoryInfo.Departement)" -ForegroundColor Gray
Write-Host "   - Icon: $($categoryInfo.Icon)" -ForegroundColor Gray
Write-Host "4. Enregistrer" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Via PnP PowerShell (Avancé)" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Commande à exécuter:" -ForegroundColor White
Write-Host ""
Write-Host @"
Connect-PnPOnline -Url "https://votretenant.sharepoint.com/sites/votre-site" -Interactive

`$listItem = Add-PnPListItem -List "Activity" -Values @{
    "Title" = "$($categoryInfo.CategoryName)"
    "CategoryName" = "$($categoryInfo.CategoryName)"
    "CategoryID" = "$($categoryInfo.CategoryID)"
    "Departement" = "$($categoryInfo.Departement)"
    "Icon" = "$($categoryInfo.Icon)"
}

Write-Host "✅ Catégorie créée avec succès (ID: `$(`$listItem.Id))" -ForegroundColor Green
"@ -ForegroundColor Gray
Write-Host ""

# Créer un fichier JSON avec les informations
$jsonFile = "suivi-recouvrement-category.json"
$categoryInfo | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonFile -Encoding UTF8

Write-Host "💾 Fichier JSON créé: $jsonFile" -ForegroundColor Green
Write-Host ""

# Instructions pour vérifier
Write-Host "🔍 Vérification après ajout:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Accéder au département DPNP dans l'application" -ForegroundColor White
Write-Host "2. Vérifier que la catégorie '$($categoryInfo.Icon) $($categoryInfo.CategoryName)' apparaît" -ForegroundColor White
Write-Host "3. Cliquer sur la catégorie" -ForegroundColor White
Write-Host "4. Vérifier que l'interface de recherche de clients s'affiche" -ForegroundColor White
Write-Host ""

# Informations supplémentaires
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   Consultez: docs/md/SUIVI_RECOUVREMENT_GFC_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "✅ Script terminé!" -ForegroundColor Green
Write-Host ""

# Ouvrir le fichier JSON créé
$openFile = Read-Host "Voulez-vous ouvrir le fichier JSON créé? (O/N)"
if ($openFile -eq "O" -or $openFile -eq "o") {
    Invoke-Item $jsonFile
}
