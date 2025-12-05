/**
 * Utilitaires pour gérer les emails SharePoint
 * SharePoint stocke les emails avec un préfixe comme: i:0#.f|membership|user@domain.com
 */

/**
 * Extrait l'email propre d'une chaîne SharePoint
 * @param emailString - Email brut de SharePoint (peut être i:0#.f|membership|email@domain.com)
 * @returns Email propre (email@domain.com)
 * 
 * @example
 * extractCleanEmail('i:0#.f|membership|cyrille_nana@afrilandfirstbank.com')
 * // returns 'cyrille_nana@afrilandfirstbank.com'
 * 
 * extractCleanEmail('user@domain.com')
 * // returns 'user@domain.com'
 */
export function extractCleanEmail(emailString: string | undefined | null): string {
  if (!emailString) return '';
  
  const email = String(emailString).trim();
  
  // Format SharePoint: i:0#.f|membership|email@domain.com
  if (email.includes('|')) {
    const parts = email.split('|');
    return parts[parts.length - 1].toLowerCase();
  }
  
  return email.toLowerCase();
}

/**
 * Compare deux emails SharePoint (gère les préfixes)
 * @param email1 - Premier email (peut avoir préfixe SharePoint)
 * @param email2 - Deuxième email (peut avoir préfixe SharePoint)
 * @returns true si les emails correspondent
 * 
 * @example
 * compareEmails('i:0#.f|membership|user@domain.com', 'user@domain.com')
 * // returns true
 */
export function compareEmails(email1: string | undefined | null, email2: string | undefined | null): boolean {
  const clean1 = extractCleanEmail(email1);
  const clean2 = extractCleanEmail(email2);
  
  if (!clean1 || !clean2) return false;
  
  return clean1 === clean2;
}

/**
 * Extrait l'email de l'auteur SharePoint (depuis Author#Claims ou Author.EMail)
 * @param authorData - Données Author de SharePoint
 * @returns Email propre de l'auteur
 */
export function extractAuthorEmail(authorData: any): string {
  if (!authorData) return '';
  
  // Essayer Author#Claims en premier (format: i:0#.f|membership|email)
  const claims = authorData['Author#Claims'] || authorData.AuthorClaims;
  if (claims) {
    return extractCleanEmail(String(claims));
  }
  
  // Essayer Author.EMail
  const authorEmail = authorData.Author?.EMail || authorData.EMail;
  if (authorEmail) {
    return extractCleanEmail(String(authorEmail));
  }
  
  return '';
}
