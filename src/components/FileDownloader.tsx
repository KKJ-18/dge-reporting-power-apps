import React from 'react';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import './FileDownloader.css';

interface FileDownloaderProps {
  actionId: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  showDetails?: boolean;
}

const FileDownloader: React.FC<FileDownloaderProps> = ({ 
  actionId, 
  fileName, 
  fileType, 
  fileSize,
  showDetails = true 
}) => {
  const [downloading, setDownloading] = React.useState(false);

  // Formater la taille du fichier
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Taille inconnue';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Obtenir l'icône selon le type de fichier
  const getFileIcon = (type?: string): string => {
    if (!type) return '📄';
    
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📘';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
    if (type.includes('image')) return '🖼️';
    return '📄';
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      console.log('📥 Début du téléchargement pour action ID:', actionId);
      
      // 1. Récupérer l'action depuis SharePoint
      const result = await ActionRecouvrementService.get(actionId);
      
      if (!result.success || !result.data) {
        console.error('❌ Action introuvable:', actionId);
        alert('Erreur : Action introuvable');
        return;
      }

      const action = result.data;
      console.log('✅ Action récupérée:', action);
      
      // 2. Vérifier la présence du fichier base64
      if (!action.PieceJointeBase64) {
        console.warn('⚠️ Aucun fichier attaché');
        alert('Aucun fichier attaché à cette action');
        return;
      }

      // 3. Décoder le base64 en binaire
      console.log('🔄 Décodage base64...');
      const base64Data = action.PieceJointeBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('✅ Base64 décodé:', bytes.length, 'octets');

      // 4. Créer un Blob avec le type MIME approprié
      const mimeType = action.TypeFichier || 'application/octet-stream';
      const blob = new Blob([bytes], { type: mimeType });
      console.log('✅ Blob créé:', blob.size, 'octets, type:', blob.type);
      
      // 5. Créer un lien de téléchargement et le déclencher
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = action.NomFichier || fileName || 'fichier';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Fichier téléchargé avec succès:', action.NomFichier);
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier. Vérifiez la console pour plus de détails.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="file-downloader">
      {showDetails && (fileName || fileType || fileSize) && (
        <div className="file-info">
          <span className="file-icon">{getFileIcon(fileType)}</span>
          <div className="file-details">
            {fileName && <span className="file-name">{fileName}</span>}
            {fileSize && <span className="file-size">{formatFileSize(fileSize)}</span>}
          </div>
        </div>
      )}
      
      <button 
        onClick={handleDownload} 
        disabled={downloading}
        className="download-btn"
        title="Télécharger la pièce jointe"
      >
        {downloading ? (
          <>
            <span className="spinner">⏳</span> Téléchargement...
          </>
        ) : (
          <>
            📥 Télécharger
          </>
        )}
      </button>
    </div>
  );
};

export default FileDownloader;
