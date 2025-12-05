# Script pour corriger le filtrage email dans ObjectifsManagement.tsx

$filePath = "c:\Users\jordan_kamsu\dge-reporting-power-apps\src\components\ObjectifsManagement.tsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Remplacer la fonction loadObjectifsForDate
$oldPattern = @'
  const loadObjectifsForDate = async \(date: string\) => \{[\s\S]*?setLoading\(false\);\s*\}\s*\};
'@

$newCode = @'
  const loadObjectifsForDate = async (date: string) => {
    if (!userProfile) {
      console.warn('Profil utilisateur non charge');
      return;
    }

    setLoading(true);
    try {
      console.log('================================================');
      console.log('REQUETE SHAREPOINT (SANS FILTRE)');
      console.log('Email brut:', userProfile.email);
      console.log('Email nettoye:', extractCleanEmail(userProfile.email));
      console.log('Date:', date);
      
      const result = await ObjectifService.getAll();
      const data: Objectif[] = result?.data || result?.value || [];
      
      console.log('Total recupere:', data.length);
      if (data.length > 0) {
        console.log('Premier - Author#Claims:', data[0]['Author#Claims']);
        console.log('Premier - Email extrait:', extractAuthorEmail(data[0]));
      }

      const userEmailClean = extractCleanEmail(userProfile.email);

      const filtered = data.filter((obj: Objectif) => {
        const authorEmail = extractAuthorEmail(obj);
        const isAuthor = authorEmail === userEmailClean;
        
        if (!isAuthor) return false;
        if (!obj.Date) return false;
        
        const objDate = new Date(obj.Date).toISOString().split('T')[0];
        const match = objDate === date;
        if (match) {
          console.log('Match trouve:', obj.Title, '- Email:', authorEmail);
        }
        return match;
      });
      
      console.log('RESULTAT:', filtered.length, 'objectif(s)');
      console.log('================================================');
      
      setObjectifs(filtered);
    } catch (error: any) {
      showError('Erreur', 'Impossible de charger les objectifs');
      console.error('Erreur chargement objectifs:', error);
    } finally {
      setLoading(false);
    }
  };
'@

if ($content -match $oldPattern) {
    $content = $content -replace $oldPattern, $newCode
    Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Fichier mis a jour avec succes!"
} else {
    Write-Host "Pattern non trouve. Affichage des premieres lignes de la fonction:"
    $content -split "`n" | Select-Object -Skip 127 -First 20
}
