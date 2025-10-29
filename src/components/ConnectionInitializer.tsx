import { useEffect } from 'react';
import { Office365UsersService } from '../services/Office365UsersService';
import { SharePointService } from '../generated/services/SharePointService';

/**
 * Composant invisible qui initialise les connexions au démarrage
 * Ceci force Power Apps à activer les connexions SharePoint et Office 365
 */
export function ConnectionInitializer() {
  useEffect(() => {
    const initConnections = async () => {
      try {
        console.log('🔌 Initialisation des connexions Power Apps...');
        
        // Forcer l'initialisation de Office 365 Users
        try {
          await Office365UsersService.getMyProfile();
          console.log('✅ Office 365 Users connecté');
        } catch (e) {
          console.warn('⚠️ Office 365 Users non disponible:', e);
        }
        
        // Forcer l'initialisation de SharePoint
        try {
          await SharePointService.GetDataSetsMetadata();
          console.log('✅ SharePoint connecté');
        } catch (e) {
          console.warn('⚠️ SharePoint non disponible:', e);
        }
        
        console.log('✅ Initialisation des connexions terminée');
      } catch (error) {
        console.error('❌ Erreur initialisation connexions:', error);
      }
    };

    initConnections();
  }, []);

  // Composant invisible
  return null;
}
