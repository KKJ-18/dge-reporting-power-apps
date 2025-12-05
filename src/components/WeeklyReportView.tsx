/**
 * Composant de visualisation du Rapport Hebdomadaire DGE
 * Structure Excel avec consolidation Direction + détail par département
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  WeeklyReportService, 
  getCurrentWeekDates, 
  formatPeriode,
  formatCurrency,
  formatMillions,
  type ConsolidatedReport
} from '../services/WeeklyReportService';
import type { UserProfile } from '../services/UserProfileService';
import type { RapportHebdomadaire } from '../Models/WeeklyReportModel';
import './WeeklyReportView.css';

interface WeekOption {
  label: string;
  debut: Date;
  fin: Date;
}

interface WeeklyReportViewProps {
  userProfile?: UserProfile | null;
}

const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ userProfile }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ConsolidatedReport | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<WeekOption | null>(null);
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);
  const [activeView, setActiveView] = useState<'consolidation' | string>('consolidation');
  const [activeSection, setActiveSection] = useState<string>('all');

  // Options de semaines
  useEffect(() => {
    const options: WeekOption[] = [];
    const current = getCurrentWeekDates();
    
    options.push({ label: 'Semaine en cours', debut: current.debut, fin: current.fin });
    
    for (let i = 1; i <= 4; i++) {
      const d = new Date(current.debut);
      d.setDate(d.getDate() - (7 * i));
      const f = new Date(d);
      f.setDate(f.getDate() + 6);
      options.push({
        label: `Semaine du ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`,
        debut: d,
        fin: f
      });
    }
    
    setWeekOptions(options);
    setSelectedWeek(options[0]);
  }, []);

  // Charger le rapport
  const loadReport = useCallback(async () => {
    if (!selectedWeek || !userProfile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await WeeklyReportService.generateConsolidatedReport({
        dateDebut: selectedWeek.debut,
        dateFin: selectedWeek.fin,
        userProfile
      });
      setReport(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  }, [selectedWeek, userProfile]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Export
  const handleExportCSV = () => {
    if (!report) return;
    WeeklyReportService.downloadCSV(report);
  };

  // Obtenir le rapport actif (consolidation ou département)
  const getActiveReport = (): RapportHebdomadaire | null => {
    if (!report) return null;
    if (activeView === 'consolidation') return report.consolidation;
    const dept = report.departements.find(d => d.departmentId === activeView);
    return dept?.report || null;
  };

  const activeReport = getActiveReport();

  // Sections du menu
  const sections = [
    { id: 'all', label: 'Rapport complet', icon: '📊' },
    { id: 'credits', label: '1-3. Crédits', icon: '💰' },
    { id: 'mep', label: '4. Situation MEP', icon: '📈' },
    { id: 'accords', label: '6. Accords', icon: '📋' },
    { id: 'pnp', label: '17. PNP', icon: '⚠️' }
  ];

  if (!userProfile) {
    return (
      <div className="weekly-report-error">
        <span className="error-icon">⚠️</span>
        <p>Profil utilisateur non disponible</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="weekly-report-loading">
        <div className="loading-spinner"></div>
        <p>Génération du rapport hebdomadaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-report-error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={loadReport}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="weekly-report-container">
      {/* En-tête */}
      <header className="report-header">
        <div className="header-left">
          <h1>📅 Rapport Hebdomadaire d'Activités</h1>
          <p className="header-subtitle">
            Direction Générale des Engagements - Afriland First Bank
          </p>
        </div>
        
        <div className="header-controls">
          <div className="week-selector">
            <label>Période :</label>
            <select 
              value={weekOptions.findIndex(w => w === selectedWeek)}
              onChange={(e) => setSelectedWeek(weekOptions[parseInt(e.target.value)])}
            >
              {weekOptions.map((week, idx) => (
                <option key={idx} value={idx}>
                  {week.label} ({formatPeriode(week.debut, week.fin)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="export-buttons">
            <button className="btn-export btn-excel" onClick={handleExportCSV}>
              <span>📊</span> Excel/CSV
            </button>
            <button className="btn-export btn-pdf" onClick={() => window.print()}>
              <span>📄</span> PDF
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Consolidation / Départements */}
      <nav className="department-nav">
        <button
          className={`dept-nav-item consolidation ${activeView === 'consolidation' ? 'active' : ''}`}
          onClick={() => setActiveView('consolidation')}
        >
          <span className="dept-icon">🏛️</span>
          <span className="dept-name">Consolidation DGE</span>
          <span className="dept-badge">{report?.stats.totalActivites || 0}</span>
        </button>
        
        {report?.departements.map(dept => (
          <button
            key={dept.departmentId}
            className={`dept-nav-item ${activeView === dept.departmentId ? 'active' : ''}`}
            onClick={() => setActiveView(dept.departmentId)}
            style={{ borderColor: activeView === dept.departmentId ? dept.color : 'transparent' }}
          >
            <span className="dept-icon">{dept.icon}</span>
            <span className="dept-name">{dept.departmentName}</span>
            <span className="dept-badge">{dept.activities.length}</span>
          </button>
        ))}
      </nav>

      {/* Statistiques globales */}
      {report && activeView === 'consolidation' && (
        <div className="global-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{report.stats.totalActivites}</span>
              <span className="stat-label">Activités totales</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">{report.stats.totalUtilisateurs}</span>
              <span className="stat-label">Contributeurs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-info">
              <span className="stat-value">{report.departements.length}</span>
              <span className="stat-label">Départements</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation des sections */}
      <nav className="section-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Métadonnées */}
      {activeReport && (
        <div className="report-metadata">
          <span className="meta-item"><strong>Réf:</strong> {activeReport.metadata.reference}</span>
          <span className="meta-item"><strong>Période:</strong> {formatPeriode(activeReport.metadata.periodeDebut, activeReport.metadata.periodeFin)}</span>
          <span className="meta-item"><strong>Généré le:</strong> {activeReport.metadata.dateCreation.toLocaleDateString('fr-FR')}</span>
        </div>
      )}

      {/* Contenu du rapport */}
      <main className="report-content">
        {activeReport && (
          <>
            {/* Section 1: Crédits Classiques */}
            {(activeSection === 'all' || activeSection === 'credits') && (
              <section className="report-section">
                <h2 className="section-title">
                  <span className="section-number">1</span>
                  {activeReport.creditsClassiques.titre}
                </h2>
                
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="col-nature">Nature</th>
                      <th className="col-nombre">Nombre</th>
                      <th className="col-montant">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.creditsClassiques.lignes.map((ligne, idx) => (
                      <tr key={idx} className={ligne.nombre > 0 ? 'has-data' : ''}>
                        <td>{ligne.nature}</td>
                        <td className="col-nombre">{ligne.nombre}</td>
                        <td className="col-montant">{formatCurrency(ligne.montant)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-nombre"><strong>{activeReport.creditsClassiques.total.nombre}</strong></td>
                      <td className="col-montant"><strong>{formatCurrency(activeReport.creditsClassiques.total.montant)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* Section 2: Crédits Programmes */}
            {(activeSection === 'all' || activeSection === 'credits') && (
              <section className="report-section">
                <h2 className="section-title">
                  <span className="section-number">2</span>
                  {activeReport.creditsProgrammes.titre}
                </h2>
                
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="col-nature">Nature</th>
                      <th className="col-nombre">Nombre</th>
                      <th className="col-montant">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.creditsProgrammes.lignes.map((ligne, idx) => (
                      <tr key={idx} className={ligne.nombre > 0 ? 'has-data' : ''}>
                        <td>{ligne.nature}</td>
                        <td className="col-nombre">{ligne.nombre}</td>
                        <td className="col-montant">{formatCurrency(ligne.montant)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-nombre"><strong>{activeReport.creditsProgrammes.total.nombre}</strong></td>
                      <td className="col-montant"><strong>{formatCurrency(activeReport.creditsProgrammes.total.montant)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* Section 3: Autres */}
            {(activeSection === 'all' || activeSection === 'credits') && (
              <section className="report-section">
                <h2 className="section-title">
                  <span className="section-number">3</span>
                  {activeReport.autres.titre}
                </h2>
                
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="col-nature">Nature</th>
                      <th className="col-nombre">Nombre</th>
                      <th className="col-montant">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.autres.lignes.map((ligne, idx) => (
                      <tr key={idx}>
                        <td>{ligne.nature}</td>
                        <td className="col-nombre">{ligne.nombre}</td>
                        <td className="col-montant">{formatCurrency(ligne.montant)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-nombre"><strong>{activeReport.autres.total.nombre}</strong></td>
                      <td className="col-montant"><strong>{formatCurrency(activeReport.autres.total.montant)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* Section 4: Situation MEP */}
            {(activeSection === 'all' || activeSection === 'mep') && (
              <section className="report-section mep-section">
                <h2 className="section-title">
                  <span className="section-number">4</span>
                  {activeReport.situationMEP.titre}
                </h2>
                <p className="section-period">{activeReport.situationMEP.periode}</p>
                
                <table className="report-table mep-table">
                  <thead>
                    <tr>
                      <th rowSpan={2} className="col-nature">Nature</th>
                      <th colSpan={3} className="col-group particulier">PARTICULIER</th>
                      <th colSpan={3} className="col-group entreprise">ENTREPRISE</th>
                    </tr>
                    <tr>
                      <th className="col-sub">Nbre</th>
                      <th className="col-sub">Mnt débloqué</th>
                      <th className="col-sub">% Eng</th>
                      <th className="col-sub">Nbre</th>
                      <th className="col-sub">Mnt débloqué</th>
                      <th className="col-sub">% Eng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.situationMEP.lignes.map((ligne, idx) => (
                      <tr key={idx} className={
                        (ligne.particulier.nombre > 0 || ligne.entreprise.nombre > 0) ? 'has-data' : ''
                      }>
                        <td>{ligne.nature}</td>
                        <td className="col-nombre">{ligne.particulier.nombre}</td>
                        <td className="col-montant">{formatMillions(ligne.particulier.montantDebloque)}</td>
                        <td className="col-percent">{ligne.particulier.pourcentageEngagement}%</td>
                        <td className="col-nombre">{ligne.entreprise.nombre}</td>
                        <td className="col-montant">{formatMillions(ligne.entreprise.montantDebloque)}</td>
                        <td className="col-percent">{ligne.entreprise.pourcentageEngagement}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-nombre"><strong>{activeReport.situationMEP.total.particulier.nombre}</strong></td>
                      <td className="col-montant"><strong>{formatMillions(activeReport.situationMEP.total.particulier.montantDebloque)}</strong></td>
                      <td></td>
                      <td className="col-nombre"><strong>{activeReport.situationMEP.total.entreprise.nombre}</strong></td>
                      <td className="col-montant"><strong>{formatMillions(activeReport.situationMEP.total.entreprise.montantDebloque)}</strong></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* Section 6: Accords */}
            {(activeSection === 'all' || activeSection === 'accords') && (
              <section className="report-section">
                <h2 className="section-title">
                  <span className="section-number">6</span>
                  {activeReport.accords.titre}
                </h2>
                
                {/* Dossiers Accordés */}
                <h3 className="subsection-title">Dossiers Accordés</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="col-num">N°</th>
                      <th className="col-entreprise">Entreprise</th>
                      <th className="col-montant">Montant Demandé</th>
                      <th className="col-montant">Montant Accordé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.accords.dossiersAccordes.length > 0 ? (
                      activeReport.accords.dossiersAccordes.map((dossier, idx) => (
                        <tr key={idx}>
                          <td className="col-num">{dossier.numero}</td>
                          <td>{dossier.entreprise}</td>
                          <td className="col-montant">{formatCurrency(dossier.montantDemande)}</td>
                          <td className="col-montant">{formatCurrency(dossier.montantAccorde || 0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="no-data">Aucun dossier accordé cette semaine</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={2}><strong>TOTAL</strong></td>
                      <td className="col-montant"><strong>{formatCurrency(activeReport.accords.totalAccordes.montantDemande)}</strong></td>
                      <td className="col-montant"><strong>{formatCurrency(activeReport.accords.totalAccordes.montantAccorde)}</strong></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Dossiers Complets Soumis */}
                <h3 className="subsection-title">Dossiers Complets Soumis</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th className="col-num">N°</th>
                      <th className="col-entreprise">Entreprise</th>
                      <th className="col-montant">Montant Demandé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.accords.dossiersCompletsSoumis.length > 0 ? (
                      activeReport.accords.dossiersCompletsSoumis.map((dossier, idx) => (
                        <tr key={idx}>
                          <td className="col-num">{dossier.numero}</td>
                          <td>{dossier.entreprise}</td>
                          <td className="col-montant">{formatCurrency(dossier.montantDemande)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="no-data">Aucun dossier cette semaine</td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {/* Section 17: Prêts Non Performants */}
            {(activeSection === 'all' || activeSection === 'pnp') && (
              <section className="report-section pnp-section">
                <h2 className="section-title">
                  <span className="section-number">17</span>
                  {activeReport.pretsNonPerformants.titre}
                </h2>
                
                {/* Recouvrement */}
                <h3 className="subsection-title">Réduction des anomalies - Recouvrement</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Libellé</th>
                      <th className="col-montant">Montant</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.pretsNonPerformants.reductionAnomalies.recouvrement.length > 0 ? (
                      activeReport.pretsNonPerformants.reductionAnomalies.recouvrement.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.libelle}</td>
                          <td className="col-montant">{formatCurrency(item.montant)}</td>
                          <td>{item.observation}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="no-data">Aucun recouvrement cette semaine</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-montant">
                        <strong>{formatCurrency(activeReport.pretsNonPerformants.reductionAnomalies.totalRecouvrement)}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Restructuration */}
                <h3 className="subsection-title">Restructuration - En cours de MEP</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Libellé Compte</th>
                      <th className="col-montant">Trésorerie/Agios</th>
                      <th>État</th>
                      <th>Observation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.pretsNonPerformants.restructuration.enCoursMEP.length > 0 ? (
                      activeReport.pretsNonPerformants.restructuration.enCoursMEP.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.libelleCompte}</td>
                          <td className="col-montant">{formatCurrency(item.tresorerieAgios)}</td>
                          <td>{item.etat}</td>
                          <td>{item.observation}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="no-data">Aucune restructuration en cours</td></tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td><strong>TOTAL</strong></td>
                      <td className="col-montant">
                        <strong>{formatCurrency(activeReport.pretsNonPerformants.restructuration.totalEnCoursMEP)}</strong>
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            )}

            {/* Sections textuelles */}
            {activeSection === 'all' && activeReport.sectionsTextuelles.length > 0 && (
              <section className="report-section textual-section">
                <h2 className="section-title">
                  <span className="section-number">📝</span>
                  Autres Sections
                </h2>
                
                <div className="textual-grid">
                  {activeReport.sectionsTextuelles.map(section => (
                    <div key={section.numero} className="textual-card">
                      <h4>{section.numero}. {section.titre}</h4>
                      <textarea 
                        placeholder="Saisir les informations..."
                        defaultValue={section.contenu}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="report-footer">
        <p>© {new Date().getFullYear()} Afriland First Bank - Direction Générale des Engagements</p>
        <p className="confidential">Document confidentiel - Usage interne uniquement</p>
      </footer>
    </div>
  );
};

export default WeeklyReportView;
