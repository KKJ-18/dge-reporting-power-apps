/**
 * Script de diagnostic pour vérifier les catégories DSE dans SharePoint
 * 
 * À exécuter dans la console du navigateur (F12) quand l'app est lancée
 */

// Fonction pour diagnostiquer les catégories DSE
async function diagnosticDSECategories() {
  console.log('🔍 === DIAGNOSTIC CATÉGORIES DSE ===\n');
  
  try {
    // Importer le service
    const { DepartmentActivitiesService } = await import('../services/DepartmentActivitiesService');
    
    // Recharger les données depuis SharePoint
    console.log('📊 Rechargement des données depuis SharePoint...');
    await DepartmentActivitiesService.reload();
    
    // Récupérer le département DSE
    console.log('📂 Récupération du département DSE...');
    const dseDept = await DepartmentActivitiesService.getDepartment('DSE');
    
    console.log('\n✅ DÉPARTEMENT DSE CHARGÉ:');
    console.log(`   Nom complet: ${dseDept.fullName}`);
    console.log(`   Nombre de catégories: ${dseDept.categories.length}`);
    console.log(`   Couleur: ${dseDept.color}`);
    
    console.log('\n📋 CATÉGORIES TROUVÉES:');
    dseDept.categories.forEach((cat: any, index: number) => {
      console.log(`\n   ${index + 1}. ${cat.icon} ${cat.name}`);
      console.log(`      ID: ${cat.id}`);
      console.log(`      Nombre d'activités: ${cat.activities.length}`);
      
      if (cat.activities.length > 0) {
        console.log(`      Activités:`);
        cat.activities.forEach((act: any, actIndex: number) => {
          console.log(`         ${actIndex + 1}. ${act.name} (${act.frequency})`);
        });
      }
    });
    
    // Vérifier si Contrats et Projets existent
    const contratsExiste = dseDept.categories.find((c: any) => c.name === 'Contrats');
    const projetsExiste = dseDept.categories.find((c: any) => c.name === 'Projets');
    
    console.log('\n🔎 VÉRIFICATION CATÉGORIES SPÉCIFIQUES:');
    console.log(`   ✓ Contrats: ${contratsExiste ? '✅ TROUVÉE' : '❌ MANQUANTE'}`);
    if (contratsExiste) {
      console.log(`      - ${contratsExiste.activities.length} activités`);
      contratsExiste.activities.forEach((a: any) => console.log(`        • ${a.name}`));
    }
    
    console.log(`   ✓ Projets: ${projetsExiste ? '✅ TROUVÉE' : '❌ MANQUANTE'}`);
    if (projetsExiste) {
      console.log(`      - ${projetsExiste.activities.length} activités`);
      projetsExiste.activities.forEach((a: any) => console.log(`        • ${a.name}`));
    }
    
    // Vérifier si les données sont dans SharePoint
    if (!contratsExiste || !projetsExiste) {
      console.log('\n⚠️ CATÉGORIES MANQUANTES DANS SHAREPOINT!');
      console.log('\n📝 ACTION REQUISE:');
      console.log('   Ajouter dans la table SharePoint "Activity":');
      console.log('   ');
      console.log('   Pour Contrats (3 activités):');
      console.log('   - Title: "Avance sur facture"    | NomRubrique: "Contrats" | Departement: "DSE"');
      console.log('   - Title: "Préfinancement"        | NomRubrique: "Contrats" | Departement: "DSE"');
      console.log('   - Title: "Cautions"              | NomRubrique: "Contrats" | Departement: "DSE"');
      console.log('   ');
      console.log('   Pour Projets (1 activité):');
      console.log('   - Title: "PV du comité de crédit" | NomRubrique: "Projets" | Departement: "DSE"');
    }
    
    console.log('\n✅ DIAGNOSTIC TERMINÉ\n');
    
  } catch (error) {
    console.error('❌ ERREUR LORS DU DIAGNOSTIC:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

// Exporter pour utilisation dans la console
declare global {
  interface Window {
    diagnosticDSECategories: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.diagnosticDSECategories = diagnosticDSECategories;
}

console.log('✅ Script de diagnostic chargé!');
console.log('💡 Exécutez: diagnosticDSECategories()');

export { diagnosticDSECategories };
