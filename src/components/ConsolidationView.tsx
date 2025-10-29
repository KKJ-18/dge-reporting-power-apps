import React, { useState } from 'react';

interface ConsolidationViewProps {
  // Future props pour les données SharePoint
}

interface ConsolidatedData {
  period: string;
  division: string;
  creditsClassiques: number;
  comitesCredit: number;
  creditsProgrammes: number;
  autresCredits: number;
  mepClassements: number;
  nonPerformants: number;
  projetsInternes: number;
}

const ConsolidationView: React.FC<ConsolidationViewProps> = () => {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [groupBy, setGroupBy] = useState('division');
  const [showChart, setShowChart] = useState(true);

  // Données d'exemple pour la consolidation
  const mockConsolidatedData: ConsolidatedData[] = [
    {
      period: '2025-W40',
      division: 'Crédits',
      creditsClassiques: 25,
      comitesCredit: 12,
      creditsProgrammes: 8,
      autresCredits: 5,
      mepClassements: 15,
      nonPerformants: 3,
      projetsInternes: 7
    },
    {
      period: '2025-W41',
      division: 'Crédits',
      creditsClassiques: 28,
      comitesCredit: 14,
      creditsProgrammes: 10,
      autresCredits: 4,
      mepClassements: 18,
      nonPerformants: 2,
      projetsInternes: 9
    },
    {
      period: '2025-W40',
      division: 'Recouvrement',
      creditsClassiques: 5,
      comitesCredit: 8,
      creditsProgrammes: 2,
      autresCredits: 12,
      mepClassements: 3,
      nonPerformants: 20,
      projetsInternes: 4
    },
    {
      period: '2025-W41',
      division: 'Recouvrement',
      creditsClassiques: 4,
      comitesCredit: 10,
      creditsProgrammes: 3,
      autresCredits: 15,
      mepClassements: 4,
      nonPerformants: 25,
      projetsInternes: 6
    }
  ];

  const calculateTotals = () => {
    const filtered = mockConsolidatedData.filter(data => {
      if (selectedDivision !== 'all' && data.division !== selectedDivision) return false;
      return true;
    });

    return {
      creditsClassiques: filtered.reduce((sum, item) => sum + item.creditsClassiques, 0),
      comitesCredit: filtered.reduce((sum, item) => sum + item.comitesCredit, 0),
      creditsProgrammes: filtered.reduce((sum, item) => sum + item.creditsProgrammes, 0),
      autresCredits: filtered.reduce((sum, item) => sum + item.autresCredits, 0),
      mepClassements: filtered.reduce((sum, item) => sum + item.mepClassements, 0),
      nonPerformants: filtered.reduce((sum, item) => sum + item.nonPerformants, 0),
      projetsInternes: filtered.reduce((sum, item) => sum + item.projetsInternes, 0)
    };
  };

  const totals = calculateTotals();

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting consolidated data as ${format}`);
    alert(`Export consolidé en ${format.toUpperCase()} lancé !`);
  };

  const getEvolutionData = (): Array<{ period: string; total: number }> => {
    const evolution: Array<{ period: string; total: number }> = [];
    const periods = ['2025-W40', '2025-W41', '2025-W42', '2025-W43'];
    
    periods.forEach(period => {
      const periodData = mockConsolidatedData.filter(d => d.period === period);
      const total = periodData.reduce((sum, item) => 
        sum + item.creditsClassiques + item.comitesCredit + item.creditsProgrammes + 
        item.autresCredits + item.mepClassements + item.nonPerformants + item.projetsInternes, 0
      );
      evolution.push({ period, total });
    });
    
    return evolution;
  };

  const evolutionData = getEvolutionData();

  return (
    <div className="content-section">
      <div className="card-header">
        <h2 className="card-title">📈 Consolidation Multi-Période</h2>
        <p style={{ color: 'var(--dge-dark-gray)', marginTop: '0.5rem' }}>
          Analysez et consolidez les données sur plusieurs périodes
        </p>
      </div>

      {/* Filtres de consolidation */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🔍 Paramètres de Consolidation</h3>
        </div>
        
        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label">📅 Date de début</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">📅 Date de fin</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">🏢 Division</label>
            <select 
              className="form-select"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">Toutes les divisions</option>
              <option value="Crédits">Division Crédits</option>
              <option value="Recouvrement">Division Recouvrement</option>
              <option value="Risques">Division Risques</option>
              <option value="Opérations">Division Opérations</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">📊 Grouper par</label>
            <select 
              className="form-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
            >
              <option value="division">Division</option>
              <option value="period">Période</option>
              <option value="rubrique">Rubrique</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <button className="btn btn-primary">🔍 Générer la Consolidation</button>
          <button className="btn btn-outline">🔄 Réinitialiser</button>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={showChart}
              onChange={(e) => setShowChart(e.target.checked)}
            />
            📊 Afficher les graphiques
          </label>
        </div>
      </div>

      {/* Résumé exécutif */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">📋 Résumé Exécutif</h3>
        </div>
        
        <div className="grid grid-4">
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>💰</div>
              <h4>Crédits Classiques</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {totals.creditsClassiques}
              </p>
              <small style={{ color: 'var(--dge-dark-gray)' }}>Total des activités</small>
            </div>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>🏛️</div>
              <h4>Comités de Crédit</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {totals.comitesCredit}
              </p>
              <small style={{ color: 'var(--dge-dark-gray)' }}>Participations</small>
            </div>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>🎯</div>
              <h4>Crédits Programmes</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {totals.creditsProgrammes}
              </p>
              <small style={{ color: 'var(--dge-dark-gray)' }}>Programmes traités</small>
            </div>
          </div>

          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>⚠️</div>
              <h4>Prêts Non Performants</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
                {totals.nonPerformants}
              </p>
              <small style={{ color: 'var(--dge-dark-gray)' }}>Dossiers traités</small>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique d'évolution */}
      {showChart && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">📊 Évolution de l'Activité</h3>
          </div>
          
          <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--dge-light-gray)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--dge-dark-gray)', marginBottom: '2rem' }}>
              📈 Graphique d'évolution temporelle (Power BI Embedded à intégrer)
            </p>
            
            {/* Simulation d'un graphique simple */}
            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'center', gap: '1rem', height: '200px' }}>
            {evolutionData.map((data) => (
              <div key={data.period} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '40px', 
                      height: `${(data.total / Math.max(...evolutionData.map(d => d.total))) * 150}px`,
                      background: 'var(--dge-red)',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '0.5rem'
                    }}
                  ></div>
                  <small style={{ transform: 'rotate(-45deg)', fontSize: '0.75rem' }}>
                    {data.period}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tableau de données consolidées */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">📊 Données Consolidées</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('csv')}
            >
              📄 CSV
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('excel')}
            >
              📗 Excel
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleExport('pdf')}
            >
              📑 PDF
            </button>
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>📅 Période</th>
              <th>🏢 Division</th>
              <th>💰 Crédits Classiques</th>
              <th>🏛️ Comités</th>
              <th>🎯 Programmes</th>
              <th>📋 Autres</th>
              <th>⭐ MEP</th>
              <th>⚠️ Non Perf.</th>
              <th>🏢 Projets Int.</th>
              <th>📊 Total</th>
            </tr>
          </thead>
          <tbody>
            {mockConsolidatedData
              .filter(data => selectedDivision === 'all' || data.division === selectedDivision)
              .map((data, index) => {
                const total = data.creditsClassiques + data.comitesCredit + data.creditsProgrammes + 
                            data.autresCredits + data.mepClassements + data.nonPerformants + data.projetsInternes;
                
                return (
                  <tr key={index}>
                    <td>{data.period}</td>
                    <td>{data.division}</td>
                    <td>{data.creditsClassiques}</td>
                    <td>{data.comitesCredit}</td>
                    <td>{data.creditsProgrammes}</td>
                    <td>{data.autresCredits}</td>
                    <td>{data.mepClassements}</td>
                    <td>{data.nonPerformants}</td>
                    <td>{data.projetsInternes}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--dge-red)' }}>{total}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Actions d'export programmé */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚙️ Export Automatique</h3>
        </div>
        
        <div className="grid grid-2">
          <div>
            <h4>📧 Export Programmé</h4>
            <p style={{ color: 'var(--dge-dark-gray)', marginBottom: '1rem' }}>
              Programmez l'envoi automatique des rapports consolidés
            </p>
            
            <div className="form-group">
              <label className="form-label">🔄 Fréquence</label>
              <select className="form-select">
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">📧 Destinataires</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="email1@dge.gov, email2@dge.gov"
              />
            </div>
            
            <button className="btn btn-primary">⚙️ Configurer l'Export Auto</button>
          </div>
          
          <div>
            <h4>📊 Intégration Power BI</h4>
            <p style={{ color: 'var(--dge-dark-gray)', marginBottom: '1rem' }}>
              Accédez aux dashboards Power BI avancés
            </p>
            
            <div style={{ padding: '1rem', background: 'var(--dge-light-gray)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p>Dashboard Power BI</p>
              <small style={{ color: 'var(--dge-dark-gray)' }}>
                Visualisations avancées et analyses prédictives
              </small>
            </div>
            
            <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>
              🔗 Ouvrir Power BI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidationView;