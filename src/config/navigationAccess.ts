import type { UserProfile } from '../services/UserProfileService';

function isAssistantDCERole(profile: UserProfile): boolean {
  if (profile.isAssistantDCE) return true;
  const fonction = profile.fonction?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
  return fonction.includes('assistant') && fonction.includes('dce');
}

const DIRECTOR_ONLY_MODULES = new Set([
  'validation',
  'team-monitoring',
  'department-DA',
  'department-DSE',
  'department-DPNP',
  'categories',
  'activities'
]);

const ASSISTANT_DCE_ONLY_MODULES = new Set([
  'assistant-dce'
]);

const PUBLIC_MODULES = new Set([
  'home',
  'reports-dashboard',
  'objectifs',
  'objectifs-management',
  'settings',
  'help',
  'exports'
]);

const LEGACY_FORM_MODULES = new Set([
  'credit-classique',
  'credit-programme',
  'admin-engagements',
  'suivi-mep',
  'activites-annexes'
]);

export function canAccessModule(profile: UserProfile, moduleId: string): boolean {
  if (!moduleId) return false;

  if (PUBLIC_MODULES.has(moduleId)) {
    return true;
  }

  if (moduleId.startsWith('category-')) {
    return Boolean(profile.departement) && !profile.isDirecteur;
  }

  if (DIRECTOR_ONLY_MODULES.has(moduleId)) {
    return profile.isDirecteur;
  }

  if (ASSISTANT_DCE_ONLY_MODULES.has(moduleId)) {
    return profile.isDirecteur || isAssistantDCERole(profile);
  }

  if (LEGACY_FORM_MODULES.has(moduleId)) {
    return profile.isDirecteur || Boolean(profile.departement);
  }

  return true;
}

export function getDefaultModule(profile: UserProfile): string {
  if (isAssistantDCERole(profile)) return 'assistant-dce';
  if (profile.isDirecteur) return 'home';
  if (profile.departement) return 'home';
  return 'home';
}
