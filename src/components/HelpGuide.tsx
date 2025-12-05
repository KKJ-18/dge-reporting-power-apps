import React, { useState, useMemo } from 'react';
import './HelpGuide.css';

interface HelpGuideProps {
  userProfile?: {
    departement: 'DA' | 'DPNP' | 'DSE' | null;
    isDirecteur: boolean;
    fonction: string | null;
    email?: string;
  };
}

const HelpGuide: React.FC<HelpGuideProps> = ({ userProfile }) => {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  // Déterminer le type de profil pour adapter le contenu
  const profileType = useMemo(() => {
    if (userProfile?.isDirecteur) return 'directeur';
    if (userProfile?.fonction?.toLowerCase().includes('chef')) return 'chef';
    return 'agent';
  }, [userProfile]);

  // Couleur selon le département
  const getDeptColor = () => {
    switch (userProfile?.departement) {
      case 'DA': return '#0078d4';
      case 'DSE': return '#107c10';
      case 'DPNP': return '#d83b01';
      default: return '#6366f1';
    }
  };

  // Sections adaptées selon le profil
  const sections = useMemo(() => {
    const baseSections = [
      { id: 'introduction', label: 'Introduction', icon: '📖' },
      { id: 'dashboard', label: 'Tableau de Bord', icon: '🏠' },
    ];

    // Agent et Chef voient les sections activités
    if (profileType !== 'directeur') {
      baseSections.push(
        { id: 'activities', label: 'Saisie Activités', icon: '📝' },
        { id: 'objectives', label: 'Objectifs', icon: '🎯' }
      );
    }

    // Tous voient les rapports
    baseSections.push({ id: 'reports', label: 'Rapports', icon: '📊' });

    // Directeur voit la section administration
    if (profileType === 'directeur') {
      baseSections.push({ id: 'admin', label: 'Administration', icon: '👔' });
    }

    baseSections.push({ id: 'faq', label: 'FAQ', icon: '❓' });

    return baseSections;
  }, [profileType]);

  const renderIntroduction = () => (
    <div className="help-section">
      <h2>📖 Bienvenue sur DGE Reporting</h2>
      
      <div className="help-card highlight" style={{ borderLeftColor: getDeptColor() }}>
        <h3>
          {profileType === 'directeur' && '👔 Espace Directeur'}
          {profileType === 'chef' && '👨‍💼 Espace Chef de Département'}
          {profileType === 'agent' && '👤 Espace Agent'}
        </h3>
        <p>
          {profileType === 'directeur' && 
            'En tant que Directeur, vous avez accès à une vue globale de tous les départements, ' +
            'aux outils de validation et au suivi des équipes.'}
          {profileType === 'chef' && 
            `En tant que Chef du département ${userProfile?.departement || ''}, vous gérez les activités de votre équipe ` +
            'et avez accès aux rapports consolidés de votre département.'}
          {profileType === 'agent' && 
            `En tant qu'Agent du département ${userProfile?.departement || ''}, vous saisissez vos activités quotidiennes ` +
            'et suivez vos objectifs de performance.'}
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <div className="card-icon">🏢</div>
          <h4>Votre Département</h4>
          {userProfile?.departement ? (
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: getDeptColor() }}>
              {userProfile.departement === 'DA' && 'Département Analyse'}
              {userProfile.departement === 'DSE' && 'Surveillance des Engagements'}
              {userProfile.departement === 'DPNP' && 'Prêts Non Performants'}
            </p>
          ) : (
            <p>Vue globale (tous les départements)</p>
          )}
        </div>

        <div className="help-card">
          <div className="card-icon">📋</div>
          <h4>Vos Accès</h4>
          <ul>
            {profileType === 'directeur' ? (
              <>
                <li>✅ Vue globale tous départements</li>
                <li>✅ Validation des rapports</li>
                <li>✅ Suivi des équipes</li>
              </>
            ) : (
              <>
                <li>✅ Saisie des activités</li>
                <li>✅ Définition des objectifs</li>
                <li>✅ Consultation des rapports</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="help-section">
      <h2>🏠 Tableau de Bord</h2>
      
      <div className="help-card">
        <h3>Votre espace de travail</h3>
        <p>
          Le tableau de bord est votre point d'entrée principal. Il affiche un récapitulatif 
          de vos activités et vous permet d'accéder rapidement aux fonctionnalités principales.
        </p>
      </div>

      {profileType === 'directeur' ? (
        <div className="help-card">
          <h4>📊 Vue Directeur</h4>
          <p>Votre tableau de bord affiche :</p>
          <ul>
            <li><strong>Vue d'ensemble</strong> - Statistiques globales de tous les départements</li>
            <li><strong>Sélection département</strong> - Accès direct à chaque département (DA, DSE, DPNP)</li>
            <li><strong>Actions rapides</strong> - Validation, suivi équipe, rapports</li>
          </ul>
        </div>
      ) : (
        <div className="help-card">
          <h4>📊 Vue {profileType === 'chef' ? 'Chef de Département' : 'Agent'}</h4>
          <p>Votre tableau de bord affiche :</p>
          <ul>
            <li><strong>Récapitulatif du jour</strong> - Activités saisies et objectifs</li>
            <li><strong>Catégories</strong> - Accès direct aux formulaires de saisie</li>
            <li><strong>Statistiques</strong> - Performance et progression</li>
          </ul>
        </div>
      )}
    </div>
  );

  const renderActivities = () => (
    <div className="help-section">
      <h2>📝 Saisie des Activités</h2>
      
      <div className="help-card warning">
        <h3>⚠️ Prérequis : Objectifs du Jour</h3>
        <p>
          Avant de saisir des activités, vous devez d'abord définir vos objectifs quotidiens 
          dans le module <strong>🎯 Objectifs</strong>. Cette étape est obligatoire.
        </p>
      </div>

      <div className="help-card">
        <h3>Comment saisir une activité</h3>
        <div className="process-steps">
          <div className="step">
            <div className="step-number" style={{ background: getDeptColor() }}>1</div>
            <div className="step-content">
              <h4>Sélectionner une catégorie</h4>
              <p>Dans le menu latéral, cliquez sur la catégorie souhaitée (ex: Crédits Classiques)</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number" style={{ background: getDeptColor() }}>2</div>
            <div className="step-content">
              <h4>Choisir l'activité</h4>
              <p>Sélectionnez l'activité spécifique dans la liste proposée</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number" style={{ background: getDeptColor() }}>3</div>
            <div className="step-content">
              <h4>Remplir le formulaire</h4>
              <p>Complétez les champs requis et enregistrez</p>
            </div>
          </div>
        </div>
      </div>

      {userProfile?.departement && (
        <div className="help-card">
          <h4>Catégories disponibles pour {userProfile.departement}</h4>
          {userProfile.departement === 'DA' && (
            <ul>
              <li>💰 Crédit classique</li>
              <li>🎯 Crédit programme</li>
              <li>📊 Administration des engagements</li>
              <li>📈 Suivi des dossiers MEP</li>
              <li>📎 Activités annexes</li>
            </ul>
          )}
          {userProfile.departement === 'DSE' && (
            <ul>
              <li>✅ Situation Mise en Place</li>
              <li>📋 Accords de Classement</li>
              <li>📄 Contrats</li>
              <li>🚀 Projets</li>
              <li>📎 Activités annexes</li>
            </ul>
          )}
          {userProfile.departement === 'DPNP' && (
            <ul>
              <li>🔄 Analyse restructuration</li>
              <li>⚠️ Suivi anomalies</li>
              <li>💸 Recouvrement</li>
              <li>📎 Activités annexes</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );

  const renderObjectives = () => (
    <div className="help-section">
      <h2>🎯 Gestion des Objectifs</h2>
      
      <div className="help-card highlight" style={{ borderLeftColor: getDeptColor() }}>
        <h3>Pourquoi définir des objectifs ?</h3>
        <p>
          Les objectifs quotidiens vous permettent de planifier votre journée et de mesurer 
          votre productivité. Ils sont <strong>obligatoires</strong> avant la saisie d'activités.
        </p>
      </div>

      <div className="help-card">
        <h3>Étapes pour définir vos objectifs</h3>
        <ol>
          <li>Accédez au module <strong>🎯 Objectifs</strong> dans le menu</li>
          <li>Sélectionnez la date (par défaut: aujourd'hui)</li>
          <li>Définissez le nombre d'activités prévues par catégorie</li>
          <li>Cliquez sur <strong>Enregistrer</strong></li>
        </ol>
      </div>

      <div className="help-card">
        <h3>Suivi de progression</h3>
        <p>
          Une fois vos objectifs définis, le tableau de bord affiche automatiquement :
        </p>
        <ul>
          <li>🟢 <strong>Vert</strong> - Objectif atteint ou dépassé</li>
          <li>🟡 <strong>Orange</strong> - En cours (50-99%)</li>
          <li>🔴 <strong>Rouge</strong> - En retard (&lt;50%)</li>
        </ul>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="help-section">
      <h2>📊 Rapports & Analyses</h2>
      
      <div className="help-card">
        <h3>Module unifié</h3>
        <p>
          Le module <strong>Rapports & Analyses</strong> regroupe toutes les fonctionnalités 
          de reporting en un seul endroit avec 3 onglets :
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <div className="card-icon">📊</div>
          <h4>Synthèse</h4>
          <p>Vue consolidée de toutes les activités saisies avec filtres par date, département et catégorie.</p>
        </div>

        <div className="help-card">
          <div className="card-icon">📈</div>
          <h4>Statistiques</h4>
          <p>Graphiques et indicateurs de performance pour analyser les tendances.</p>
        </div>

        <div className="help-card">
          <div className="card-icon">📋</div>
          <h4>Rapport Hebdo</h4>
          <p>Génération du rapport hebdomadaire au format Excel pour soumission.</p>
        </div>
      </div>

      {profileType === 'directeur' && (
        <div className="help-card highlight" style={{ borderLeftColor: getDeptColor() }}>
          <h4>👔 Accès Directeur</h4>
          <p>
            En tant que Directeur, vous pouvez consulter les rapports de tous les départements 
            et générer des rapports consolidés pour la Direction.
          </p>
        </div>
      )}
    </div>
  );

  const renderAdmin = () => (
    <div className="help-section">
      <h2>👔 Administration</h2>
      
      <div className="help-card highlight" style={{ borderLeftColor: getDeptColor() }}>
        <h3>Fonctionnalités réservées au Directeur</h3>
        <p>
          Ces modules sont accessibles uniquement avec votre profil Directeur.
        </p>
      </div>

      <div className="help-grid">
        <div className="help-card">
          <div className="card-icon">✅</div>
          <h4>Validation</h4>
          <p>
            Validez les rapports soumis par les chefs de département. 
            Vous pouvez approuver, rejeter ou demander des modifications.
          </p>
        </div>

        <div className="help-card">
          <div className="card-icon">👥</div>
          <h4>Suivi Équipe</h4>
          <p>
            Tableau de bord complet pour suivre l'activité de chaque département 
            et de chaque collaborateur.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="help-section">
      <h2>❓ Questions Fréquentes</h2>
      
      <div className="faq-list">
        {profileType !== 'directeur' && (
          <>
            <div className="faq-item">
              <h4>🔒 Pourquoi je ne peux pas saisir d'activités ?</h4>
              <p>
                Vous devez d'abord définir vos objectifs du jour. Accédez au module 
                🎯 Objectifs et définissez vos cibles.
              </p>
            </div>

            <div className="faq-item">
              <h4>📅 Puis-je modifier une activité déjà saisie ?</h4>
              <p>
                Oui, vous pouvez modifier les activités du jour en cours. Pour les jours 
                précédents, contactez votre chef de département.
              </p>
            </div>
          </>
        )}

        <div className="faq-item">
          <h4>📊 Comment générer un rapport ?</h4>
          <p>
            Accédez au module <strong>Rapports & Analyses</strong>, sélectionnez l'onglet 
            "Rapport Hebdo", choisissez la période et cliquez sur "Générer".
          </p>
        </div>

        <div className="faq-item">
          <h4>⚠️ Mon profil ne charge pas</h4>
          <p>
            Vérifiez votre connexion et réessayez. Si le problème persiste, 
            contactez l'administrateur système.
          </p>
        </div>

        {profileType === 'directeur' && (
          <div className="faq-item">
            <h4>👥 Comment voir l'activité d'un département ?</h4>
            <p>
              Depuis le tableau de bord, cliquez sur la carte du département souhaité 
              pour accéder à sa vue détaillée.
            </p>
          </div>
        )}
      </div>

      <div className="help-card">
        <h3>📞 Besoin d'aide ?</h3>
        <p>
          Pour toute question non couverte par ce guide, contactez le support technique 
          ou votre administrateur système.
        </p>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'introduction': return renderIntroduction();
      case 'dashboard': return renderDashboard();
      case 'activities': return renderActivities();
      case 'objectives': return renderObjectives();
      case 'reports': return renderReports();
      case 'admin': return renderAdmin();
      case 'faq': return renderFAQ();
      default: return renderIntroduction();
    }
  };

  return (
    <div className="help-guide">
      <div className="help-header" style={{ background: `linear-gradient(135deg, ${getDeptColor()} 0%, ${getDeptColor()}dd 100%)` }}>
        <h1>📚 Guide d'Utilisation</h1>
        <p className="help-subtitle">
          {profileType === 'directeur' && 'Guide pour Directeur - Vue globale'}
          {profileType === 'chef' && `Guide pour Chef de département - ${userProfile?.departement}`}
          {profileType === 'agent' && `Guide pour Agent - ${userProfile?.departement}`}
        </p>
      </div>

      <div className="help-layout">
        <nav className="help-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              style={activeSection === section.id ? { background: `${getDeptColor()}15`, borderLeftColor: getDeptColor() } : {}}
            >
              <span className="nav-item-icon">{section.icon}</span>
              <span className="nav-item-label">{section.label}</span>
            </button>
          ))}
        </nav>

        <main className="help-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default HelpGuide;
