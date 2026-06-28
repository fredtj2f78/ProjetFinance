"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDiagnostic, setErrorDiagnostic] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: stats, error } = await supabase
          .from('stats_par_compte')
          .select('*');

        if (error) {
          setErrorDiagnostic(`Erreur Supabase : ${error.message}`);
        } else if (stats) {
          if (stats.length === 0) {
            setErrorDiagnostic("La vue a renvoyé 0 ligne. Vérifiez que vous êtes connecté.");
          } else {
            const formattedStats = stats.map((row: any) => ({
              ...row,
              total_decaisse_positif: Math.abs(row.total_decaisse)
            }));
            setData(formattedStats);
          }
        }
      } catch (err: any) {
        setErrorDiagnostic(`Erreur : ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b border-gray-300 pb-4">Tableau de bord - Audit Immo</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Flux financiers par compte</h2>
        <p className="text-gray-500 mb-6 text-sm">Comparaison des encaissements et décaissements sur toute la période</p>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-500">Chargement des données bancaires...</div>
        ) : errorDiagnostic ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 font-mono text-sm">
            ⚠️ {errorDiagnostic}
          </div>
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
    </div>
  );
}
