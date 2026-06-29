import React from 'react';

export default function GuideInvestisseur() {
  const articles = [
    { title: "SCI à l'IS vs LMNP Réel", category: "Fiscalité", slug: "/guide-investisseur/sci-is-vs-lmnp-reel-2025" },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <a href="/app" className="text-blue-600 font-bold hover:underline">← Retour à Audit Immo</a>
      </div>
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Guide Investisseur : Analyses & Stratégies</h1>
        <p className="text-xl text-gray-600">Décryptez la fiscalité et optimisez vos cash-flows avec précision.</p>
      </header>

      <section className="bg-blue-50 p-8 rounded-2xl mb-16">
        <h2 className="text-2xl font-semibold mb-6">Par où commencer ?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
            <h3 className="font-bold mb-2">Calculer sa rentabilité</h3>
            <p className="text-sm text-gray-500 mb-4">Comprendre le rendement net net.</p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((art, index) => (
          <article key={index} className="border-b pb-6">
            <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">{art.category}</span>
            <h2 className="text-lg font-semibold my-2">{art.title}</h2>
            <a href={art.slug} className="text-sm font-semibold hover:underline">Lire l'analyse →</a>
          </article>
        ))}
      </section>
    </main>
  );
}
