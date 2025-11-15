import React, { useState } from 'react';
import { getPowerSdkInstance } from '@pa-client/power-code-sdk/lib/';
import { dataSourcesInfo } from '../../.power/appschemas/dataSourcesInfo';

const DiagnosticPanel: React.FC = () => {
  const [diagResults, setDiagResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: string[] = [];

    try {
      results.push('🔍 === DIAGNOSTIC POWER SDK ===\n');

      // 1. Vérifier l'instance SDK
      results.push('1️⃣ Vérification de l\'instance SDK...');
      const sdkInstance = getPowerSdkInstance(dataSourcesInfo);
      results.push(`   ✅ Instance SDK récupérée: ${!!sdkInstance}`);
      results.push(`   ✅ Type: ${typeof sdkInstance}`);

      // 2. Vérifier les data sources
      results.push('\n2️⃣ Vérification des sources de données:');
      const dataSourceKeys = Object.keys(dataSourcesInfo);
      results.push(`   ✅ ${dataSourceKeys.length} sources de données configurées`);
      
      const relevantSources = ['situationmep', 'accords', 'contrats'];
      relevantSources.forEach(source => {
        const exists = dataSourceKeys.includes(source);
        results.push(`   ${exists ? '✅' : '❌'} ${source}: ${exists ? 'Configuré' : 'MANQUANT'}`);
      });

      // 3. Vérifier l'API Data
      results.push('\n3️⃣ Vérification de l\'API Data:');
      results.push(`   ✅ Data API disponible: ${!!sdkInstance.Data}`);
      results.push(`   ✅ createRecordAsync: ${typeof sdkInstance.Data?.createRecordAsync}`);
      results.push(`   ✅ retrieveMultipleRecordsAsync: ${typeof sdkInstance.Data?.retrieveMultipleRecordsAsync}`);

      // 4. Test de récupération de données (SituationMEP)
      if (dataSourceKeys.includes('situationmep')) {
        results.push('\n4️⃣ Test de récupération de données (SituationMEP):');
        try {
          const testResult = await sdkInstance.Data.retrieveMultipleRecordsAsync(
            'situationmep',
            { top: 1 }
          );
          results.push(`   ✅ Requête réussie!`);
          results.push(`   ✅ success: ${testResult.success}`);
          results.push(`   ✅ Erreur: ${testResult.error || 'Aucune'}`);
          results.push(`   ✅ Nombre de résultats: ${(testResult as any).result?.length || 0}`);
        } catch (error) {
          results.push(`   ❌ ERREUR de récupération: ${(error as Error).message}`);
          results.push(`   📋 Stack: ${(error as Error).stack?.substring(0, 200)}`);
        }
      }

      // 5. Test de création de données (sans vraiment créer)
      results.push('\n5️⃣ Préparation pour test de création:');
      results.push('   ℹ️ Structure de test préparée (non envoyée)');
      
      const testRecord = {
        Title: 'TEST DIAGNOSTIC',
        Nombre: 0,
        Montant: 0,
        DateMep: new Date().toISOString().split('T')[0],
        Pourcentage: 0
      };
      results.push(`   ✅ Record de test: ${JSON.stringify(testRecord, null, 2)}`);

      results.push('\n✅ === DIAGNOSTIC TERMINÉ ===');
    } catch (error) {
      results.push(`\n❌ ERREUR CRITIQUE: ${(error as Error).message}`);
      results.push(`📋 Stack: ${(error as Error).stack}`);
    } finally {
      setLoading(false);
    }

    setDiagResults(results.join('\n'));
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      backgroundColor: '#1F2937',
      color: '#F9FAFB',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      maxWidth: '500px'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '700' }}>
        🔧 Diagnostic Power SDK
      </h3>
      
      <button
        onClick={runDiagnostics}
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#CC0000',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          width: '100%',
          marginBottom: '1rem'
        }}
      >
        {loading ? '⏳ Test en cours...' : '🚀 Lancer le diagnostic'}
      </button>

      {diagResults && (
        <pre style={{
          backgroundColor: '#111827',
          padding: '1rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          maxHeight: '400px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          margin: 0
        }}>
          {diagResults}
        </pre>
      )}
    </div>
  );
};

export default DiagnosticPanel;
