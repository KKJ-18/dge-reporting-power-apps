import React, { useEffect, useState } from 'react';
import { SharePointService as GeneratedService } from '../generated/services/SharePointService';

const SharePointListExplorer: React.FC = () => {
  const [sites, setSites] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await GeneratedService.GetDataSetsMetadata();
      const data = (result as any).data || result;
      console.log('Sites récupérés:', data);
      setSites(data?.value || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async (siteUrl: string) => {
    setLoading(true);
    setError(null);
    setSelectedSite(siteUrl);
    
    try {
      const result = await GeneratedService.GetTables(siteUrl);
      const data = (result as any).data || result;
      console.log('Listes récupérées:', data);
      setLists(data?.value || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copié: ${text}`);
  };

  return (
    <div className="page-header">
      <h1 className="page-title">🔍 Explorateur SharePoint</h1>
      <p className="page-subtitle">Découvrez les sites et listes SharePoint disponibles</p>

      <div style={{ marginTop: '2rem', maxWidth: '1200px' }}>
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991B1B'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Section Sites */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '1rem' 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>📁 Sites SharePoint</h2>
            <button
              onClick={loadSites}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                background: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              🔄 Rafraîchir
            </button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden'
          }}>
            {loading && sites.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                ⏳ Chargement des sites...
              </div>
            ) : sites.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Aucun site trouvé. Assurez-vous d'être dans Power Apps.
              </div>
            ) : (
              sites.map((site, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: index < sites.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                    cursor: 'pointer',
                    background: selectedSite === site.Name ? 'rgba(204, 0, 0, 0.05)' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => loadLists(site.Name)}
                >
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {site.DisplayName || site.Name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <code style={{ background: 'rgba(0,0,0,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {site.Name}
                    </code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(site.Name);
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      📋 Copier
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section Listes */}
        {lists.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              📋 Listes du site sélectionné
            </h2>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              {lists.map((list, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: index < lists.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {list.DisplayName || list.Name}
                  </div>
                  
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: '#6B7280', minWidth: '80px' }}>
                        Name:
                      </span>
                      <code style={{ 
                        background: 'rgba(0,0,0,0.05)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        flex: 1
                      }}>
                        {list.Name}
                      </code>
                      <button
                        onClick={() => copyToClipboard(list.Name)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        📋
                      </button>
                    </div>

                    {list.Id && (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6B7280', minWidth: '80px' }}>
                          ID:
                        </span>
                        <code style={{ 
                          background: 'rgba(16, 185, 129, 0.1)', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          flex: 1,
                          color: '#059669',
                          fontWeight: '600'
                        }}>
                          {list.Id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(list.Id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          📋
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1E40AF' }}>
            💡 Instructions
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem', color: '#1E40AF' }}>
            <li>Cliquez sur un site pour voir ses listes</li>
            <li>Utilisez le bouton 📋 pour copier le Name ou l'ID</li>
            <li>L'ID de la liste est nécessaire pour le paramètre -t de pac code add-data-source</li>
            <li>Cette fonctionnalité ne fonctionne que dans Power Apps (pas en mode développement local)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SharePointListExplorer;
