import React, { useEffect, useMemo, useState } from 'react';
import { getDepartment } from '../config/departmentsData';
import type { UserProfile } from '../services/UserProfileService';
import { AnalyseDossiersComitesService } from '../services/AnalyseDossiersComitesService';
import ActivityFormModal from './ActivityFormModal';
import { debugLog } from '../utils/logger';

interface AssistantDCEDashboardProps {
  userProfile: UserProfile;
}

const ASSISTANT_DCE_ACTIVITIES: string[] = [
  'Orientation et gestion administrative des dossiers DCE',
  'Rédaction et coordination de la gestion des courriers',
  'Organisation des comités de crédit',
  'Rédaction des PV de Comité de Crédit',
  'Suivi des signatures des PV',
  'Publication des PV',
  'Rédaction des rapports hebdo / mensuel / trimestriel / annuel',
  'Rédaction des comptes rendus de réunion',
  'Dispatching des dossiers dans entreprises_credit',
  'Gestion de la logistique interne',
  'Suivi des dossiers',
  'Archivage des dossiers'
];

interface AssistantDceSubmission {
  ID?: number;
  Title?: string;
  Date?: string;
  DateReception?: string;
  Nombre?: number;
  Montant?: number;
  Reference?: string;
  TypeComite?: string;
  Created?: string;
  'Author#Claims'?: string;
}

type HistoryPeriod = 'all' | '7d' | '30d' | '90d' | 'custom';

const AssistantDCEDashboard: React.FC<AssistantDCEDashboardProps> = ({ userProfile }) => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dateReception, setDateReception] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nombre, setNombre] = useState<number>(0);
  const [montant, setMontant] = useState<number>(0);
  const [commentaire, setCommentaire] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<AssistantDceSubmission[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<HistoryPeriod>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const departments = [getDepartment('DA'), getDepartment('DSE'), getDepartment('DPNP')];

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setDateReception(today);
    setNombre(0);
    setMontant(0);
    setCommentaire('');
  };

  const closeFormModal = () => {
    setSelectedActivity(null);
    resetForm();
  };

  const generateReference = (): string => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, '');
    const timePart = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ADCE-${datePart}-${timePart}-${randomPart}`;
  };

  const loadSubmissions = async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const result = await AnalyseDossiersComitesService.getAll();
      const allRows = (result?.data || []) as AssistantDceSubmission[];
      const emailLower = userProfile.email?.toLowerCase?.() || '';

      const filtered = allRows
        .filter((row) => ASSISTANT_DCE_ACTIVITIES.includes(row.Title || ''))
        .filter((row) => (row.TypeComite || '').toLowerCase() === 'assistant dce')
        .filter((row) => {
          if (!emailLower) {
            return true;
          }

          const claims = (row['Author#Claims'] || '').toLowerCase();
          return claims.includes(emailLower);
        })
        .sort((a, b) => {
          const left = new Date(a.Created || a.Date || '').getTime();
          const right = new Date(b.Created || b.Date || '').getTime();
          return right - left;
        });

      setSubmissions(filtered);
    } catch (error) {
      debugLog('❌ Erreur chargement historique Assistant DCE:', error);
      setHistoryError("Impossible de charger l'historique.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const parseSubmissionDate = (row: AssistantDceSubmission): Date | null => {
    const dateSource = row.Created || row.Date || row.DateReception;
    if (!dateSource) {
      return null;
    }

    const parsed = new Date(dateSource);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  };

  const filteredSubmissions = useMemo(() => {
    const now = new Date();

    const matchesPeriod = (row: AssistantDceSubmission): boolean => {
      if (historyPeriod === 'all') {
        return true;
      }

      const rowDate = parseSubmissionDate(row);
      if (!rowDate) {
        return false;
      }

      if (historyPeriod === 'custom') {
        if (!customStartDate || !customEndDate) {
          return true;
        }

        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);

        return rowDate >= start && rowDate <= end;
      }

      const days = historyPeriod === '7d' ? 7 : historyPeriod === '30d' ? 30 : 90;
      const from = new Date(now);
      from.setDate(from.getDate() - days);
      return rowDate >= from;
    };

    return submissions.filter(matchesPeriod).slice(0, 50);
  }, [submissions, historyPeriod, customStartDate, customEndDate]);

  const submissionCount = useMemo(() => filteredSubmissions.length, [filteredSubmissions.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivity) {
      return;
    }

    setIsSaving(true);
    try {
      const reference = generateReference();
      const result = await AnalyseDossiersComitesService.create({
        Title: selectedActivity,
        Date: date,
        DateReception: dateReception,
        Nombre: nombre,
        Montant: montant,
        Reference: reference,
        TypeComite: 'Assistant DCE',
        ...(commentaire.trim() ? { OData__ColorTag: commentaire.trim() } : {})
      });

      if (!result.success) {
        throw new Error("La sauvegarde a échoué.");
      }

      await loadSubmissions();
      alert('✅ Activité Assistant DCE enregistrée avec succès.');
      closeFormModal();
    } catch (error) {
      debugLog('❌ Erreur sauvegarde Assistant DCE:', error);
      alert("❌ Erreur lors de l'enregistrement de l'activité.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">🗂️ Assistant DCE</h1>
        <p className="text-neutral-600">
          Espace de structuration DCE pour {userProfile.email}.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">✅ Activités Assistant DCE</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {ASSISTANT_DCE_ACTIVITIES.map((activity, index) => (
              <div key={activity} className="flex gap-3 items-start rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <span className="w-7 h-7 mt-0.5 shrink-0 rounded-full bg-primary-600 text-white text-sm font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-neutral-700 leading-6">{activity}</span>
                </div>
                <button
                  type="button"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
                  onClick={() => {
                    resetForm();
                    setSelectedActivity(activity);
                  }}
                >
                  Saisir
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">🔎 Référentiel des autres départements</h2>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {departments.map((department) => (
              <details key={department.id} className="rounded-xl border border-neutral-200 bg-neutral-50">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                  <span className="font-semibold text-neutral-800">
                    {department.icon} {department.fullName}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {department.categories.length} catégories
                  </span>
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  {department.categories.map((category) => (
                    <div key={category.id} className="rounded-lg border border-neutral-200 bg-white p-3">
                      <div className="font-medium text-neutral-800 mb-2">
                        {category.icon || '📁'} {category.name}
                      </div>
                      <ul className="list-disc ml-5 space-y-1 text-sm text-neutral-600">
                        {category.activities.map((activity) => (
                          <li key={activity.id}>{activity.label}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl shadow-md border border-neutral-200 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">📚 Historique des soumissions</h2>
          <span className="text-xs font-medium text-neutral-500">{submissionCount} élément(s)</span>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-neutral-600">Période</span>
            <select
              value={historyPeriod}
              onChange={(e) => setHistoryPeriod(e.target.value as HistoryPeriod)}
              className="px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="all">Tout</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </label>

          {historyPeriod === 'custom' && (
            <>
              <label className="space-y-1">
                <span className="text-xs font-medium text-neutral-600">Du</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-neutral-600">Au</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
            </>
          )}
        </div>

        {historyLoading && <p className="text-sm text-neutral-500">Chargement en cours...</p>}

        {!historyLoading && historyError && (
          <p className="text-sm text-red-600">{historyError}</p>
        )}

        {!historyLoading && !historyError && filteredSubmissions.length === 0 && (
          <p className="text-sm text-neutral-500">Aucune soumission Assistant DCE pour le moment.</p>
        )}

        {!historyLoading && !historyError && filteredSubmissions.length > 0 && (
          <div className="space-y-2">
            {filteredSubmissions.map((row) => (
              <div key={`${row.ID || row.Reference}-${row.Created || row.Date}`} className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-800">{row.Title || 'Activité'}</p>
                  <p className="text-xs text-neutral-500">{row.Reference || '-'}</p>
                </div>
                <p className="text-xs text-neutral-600 mt-1">
                  Date: {row.Date || '-'} • Réception: {row.DateReception || '-'} • Nombre: {row.Nombre ?? 0} • Montant: {(row.Montant ?? 0).toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <ActivityFormModal
        isOpen={Boolean(selectedActivity)}
        onClose={closeFormModal}
        title={selectedActivity || 'Saisie activité'}
      >
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-800">📝 Saisie activité Assistant DCE</h3>
            <p className="text-sm text-neutral-600 mt-1">{selectedActivity}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium text-neutral-700">Date *</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-neutral-700">Date de réception *</span>
                <input
                  type="date"
                  value={dateReception}
                  onChange={(e) => setDateReception(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-neutral-700">Nombre</span>
                <input
                  type="number"
                  min={0}
                  value={nombre}
                  onChange={(e) => setNombre(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm font-medium text-neutral-700">Montant (FCFA)</span>
                <input
                  type="number"
                  min={0}
                  value={montant}
                  onChange={(e) => setMontant(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-sm font-medium text-neutral-700">Commentaire (optionnel)</span>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Notes complémentaires"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                disabled={isSaving}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </ActivityFormModal>
    </div>
  );
};

export default AssistantDCEDashboard;
