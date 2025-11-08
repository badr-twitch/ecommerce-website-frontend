import React from 'react';
import { Link } from 'react-router-dom';

const MembershipHighlight = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-indigo-800 text-white shadow-2xl">
      <div className="absolute inset-0">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/40 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-6 w-80 h-80 bg-purple-500/30 blur-3xl rounded-full"></div>
      </div>
      <div className="relative px-6 py-12 lg:px-12 lg:py-16 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm uppercase tracking-wide">
            Nouveau • UMOD Prime
          </div>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold leading-tight">
            Transformez votre shopping au Maroc avec{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              l’abonnement UMOD Prime
            </span>
          </h2>
          <p className="mt-5 text-white/70 leading-relaxed">
            Profitez de la livraison express illimitée, d’un concierge shopping 7j/7, d’offres VIP et d’une protection
            premium sur chaque commande. Pensé spécialement pour nos clients marocains exigeants.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
            {[
              { label: 'Livraison express illimitée', icon: '⚡' },
              { label: 'Conciergerie shopping 24/7', icon: '🤝' },
              { label: 'Accès VIP aux ventes privées', icon: '🎟️' },
            ].map((item) => (
              <div key={item.label} className="flex items-center space-x-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 max-w-md w-full">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-2xl rounded-3xl"></div>
            <div className="relative rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 shadow-xl">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Abonnement mensuel</h3>
                  <p className="text-white/60 text-sm mt-1">Résiliable à tout moment, activation immédiate</p>
                </div>
                <span className="px-4 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-white/10 border border-white/20">
                  69,99 DH /mois
                </span>
              </header>
              <ul className="mt-6 space-y-3 text-white/70 text-sm">
                {[
                  'Assurance colis premium incluse',
                  'Retours offerts pendant 60 jours',
                  'Carte cadeau de bienvenue de 50 DH',
                  'Shopping personnalisé avec nos stylistes',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start space-x-3">
                    <span className="mt-1 text-base">✨</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Link
                  to="/membership"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg shadow-white/20 hover:-translate-y-1 transition-transform"
                >
                  Découvrir UMOD Prime
                </Link>
                <div className="text-xs text-white/50">
                  <p>30 jours satisfait ou remboursé</p>
                  <p>Aucun frais caché, annulation en un clic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipHighlight;

