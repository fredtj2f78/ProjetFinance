"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  // États pour les statistiques des comptes
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDiagnostic, setErrorDiagnostic] = useState<string | null>(null);

  // États pour les engagements futurs
  const [engagements, setEngagements] = useState<any[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(true);
  const [errorEngagements, setErrorEngagements] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // 1. Récupération des comptes
    async function fetchStats() {
      try {
        const { data: stats, error } = await supabase
          .from('stats_par_compte')
          .select('*');

        if (error) {
          setErrorDiagnostic(`Erreur Supabase : ${error.message}`);
        } else if (stats) {
          const formattedStats = stats.map((row: any) => ({
            ...row,
            total_decaisse_positif: Math.abs(row.total_decaisse)
          }));
          setData(formattedStats);
        }
      } catch (err: any) {
        setErrorDiagnostic(`Erreur : ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    // 2. Récupération des engagements futurs
    async function fetchEngagements() {
      try {
        const { data: eng, error } = await supabase
          .from('engagements_futurs')
          .select('*')
          .order('date_echeance', { ascending: true }); // Tri du plus proche au plus lointain

        if (error) {
          // Si la table n'existe pas encore, on l'attrape ici
          if (error.code === '42P01') {
             setErrorEngagements("La table 'engagements_futurs' n'existe pas encore dans Supabase.");
          } else {
             setErrorEngagements(`Erreur Supabase : ${error.message}`);
          }
        } else if (eng) {
          setEngagements(eng);
        }
      } catch (err: any) {
        setErrorEngagements(`Erreur : ${err.message}`);
      } finally {
        setLoadingEngagements(false);
      }
    }

    fetchStats();
    fetchEngagements();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-300 pb-4">Tableau de bord - Audit Immo</h1>
      
      {/* PREMIER BLOC : COMPTES BANCAIRES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Flux financiers par compte</h2>
        <p className="text-gray-500 mb-6 text-sm">Comparaison des encaissements et décaissements sur la période</p>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500">Chargement des données bancaires...</div>
        ) : errorDiagnostic ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 font-mono text-sm">
            ⚠️ {errorDiagnostic}
          </div>
        ) : data.length === 0 ? (
          <div className="p-4 text-gray-500 text-center italic">Aucune donnée bancaire à afficher.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-200 font-bold">Compte Bancaire</th>
                  <th className="px-6 py-4 border-b border-gray-200 font-bold text-right">Total Encaissé</th>
                  <th className="px-6 py-4 border-b border-gray-200 font-bold text-right">Total Décaissé</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 border-b border-gray-100 font-medium text-gray-900">
                      {row.account_name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-right text-emerald-600 font-bold whitespace-nowrap">
                      {Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(row.total_encaisse)}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-100 text-right text-red-600 font-bold whitespace-nowrap">
                      {Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(row.total_decaisse_positif)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DEUXIÈME BLOC : ENGAGEMENTS FUTURS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Calendrier des engagements à venir</h2>
        <p className="text-gray-500 mb-6 text-sm">Appels de fonds et placements prévus</p>

        {loadingEngagements ? (
          <div className="h-32 flex items-center justify-center text-gray-500">Recherche des échéances...</div>
        ) : errorEngagements ? (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-md text-orange-800 font-mono text-sm">
            ℹ️ Info : {errorEngagements}
          </div>
        ) : engagements.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
            <span className="text-2xl mb-2">📅</span>
            <p>Aucun engagement futur enregistré pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200 font-bold w-32">Date d'échéance</th>
                  <th className="px-6 py-4 border-b border-slate-200 font-bold">Description</th>
                  <th className="px-6 py-4 border-b border-slate-200 font-bold">Compte cible</th>
                  <th className="px-6 py-4 border-b border-slate-200 font-bold text-right">Montant prévu</th>
                </tr>
              </thead>
              <tbody>
                {engagements.map((eng, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-b border-slate-100 font-medium text-slate-800">
                      {new Date(eng.date_echeance).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-100 text-slate-600">
                      {eng.description}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-100 text-slate-500 italic">
                      {eng.compte_cible || "Non défini"}
                    </td>
                    <td className="px-6 py-4 border-b border-slate-100 text-right text-orange-600 font-bold whitespace-nowrap">
                      {Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Math.abs(eng.montant))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
