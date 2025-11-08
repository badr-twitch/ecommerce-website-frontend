import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, formatPrice } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const MembershipPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useContext(AuthContext);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const [planResult, statusResult] = await Promise.allSettled([
          membershipAPI.getPlan(),
          isAuthenticated ? membershipAPI.getStatus() : Promise.resolve(null),
        ]);

        if (planResult.status === 'fulfilled' && planResult.value?.data?.success) {
          setPlan(planResult.value.data.data);
        }

        if (statusResult?.status === 'fulfilled' && statusResult.value?.data?.success) {
          setStatus(statusResult.value.data.data);
        }
      } catch (fetchError) {
        console.error('❌ Error loading membership plan:', fetchError);
        setError('Impossible de charger l’abonnement pour le moment. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour rejoindre UMOD Prime');
      navigate('/login', { state: { from: '/membership' } });
      return;
    }

    setSubscribing(true);
    try {
      const response = await membershipAPI.subscribe();
      if (response.data.success) {
        toast.success(response.data.message || 'Bienvenue dans UMOD Prime !');
        setStatus(response.data.data);

        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
      }
    } catch (subscribeError) {
      console.error('❌ Membership subscription error:', subscribeError);
      toast.error(subscribeError.response?.data?.error || 'Impossible d’activer l’abonnement');
    } finally {
      setSubscribing(false);
    }
  };

  const handleManageMembership = () => {
    console.log('🔍 MembershipPage - Gestion de mon abonnement clicked');
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour gérer votre abonnement');
      navigate('/login', { state: { from: '/membership', redirectToMembershipModal: true } });
      return;
    }

    navigate('/profile', { state: { openMembershipModal: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-red-500/10 border border-red-500/40 text-red-100 rounded-3xl p-8 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-semibold mb-3">Oups !</h1>
          <p className="text-red-50/80">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center px-5 py-3 text-sm font-semibold rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-40 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-indigo-500/10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pb-24">
          {/* Hero */}
          <section className="pt-24">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm tracking-wide uppercase">
                  Nouvelle expérience premium
                </span>
                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  UMOD Prime
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    L’abonnement qui révolutionne votre shopping au Maroc
                  </span>
                </h1>
                <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
                  Un abonnement exclusif pensé pour le marché marocain : livraison express, conciergerie 7j/7,
                  offres VIP et protection premium pour chacun de vos achats.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur">
                    <p className="text-sm text-white/60 uppercase tracking-wide">Tarif unique</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {plan ? formatPrice(plan.price, plan.currency) : '69,99 DH'}
                      <span className="ml-2 text-base text-white/50 font-normal">/ mois</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 backdrop-blur">
                    <p className="text-sm text-white/70">Essai satisfait ou remboursé</p>
                    <p className="mt-2 text-lg font-semibold">Remboursement garanti sous 30 jours</p>
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-4">
                  {status?.membershipStatus === 'active' ? (
                    <button
                      onClick={handleManageMembership}
                      className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-xl shadow-blue-500/30 hover:-translate-y-1 transition transform"
                    >
                      Gestion de mon abonnement
                    </button>
                  ) : (
                    <button
                      onClick={handleSubscribe}
                      disabled={subscribing}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 font-semibold shadow-xl shadow-blue-500/40 hover:-translate-y-1 transition transform disabled:opacity-60"
                    >
                      {subscribing ? 'Activation en cours...' : 'Rejoindre UMOD Prime'}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition"
                  >
                    Explorer les produits
                  </button>
                </div>

                <div className="mt-6 flex items-center space-x-4 text-sm text-white/50">
                  <span className="flex items-center">
                    <span className="mr-2">🔓</span> Sans engagement
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <span className="mr-2">⚡</span> Activation immédiate
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <span className="mr-2">🛡️</span> Paiements sécurisés
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-purple-500/40 blur-3xl"></div>
                  <div className="relative bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold mb-6 text-white">Avantages exclusifs inclus :</h2>

                    <div className="space-y-4">
                      {plan?.perks?.slice(0, 4).map((perk) => (
                        <div
                          key={perk.title}
                          className="flex items-start space-x-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition"
                        >
                          <div className="text-3xl">{perk.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{perk.title}</h3>
                            <p className="text-white/60 text-sm leading-relaxed">{perk.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
                      <p className="text-sm text-white/70">
                        + {plan?.perks?.length || 6} avantages premium pensés pour vos achats au Maroc
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits grid */}
          <section className="mt-24">
            <div className="grid md:grid-cols-3 gap-6">
              {plan?.perks?.map((perk) => (
                <div
                  key={perk.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl"></div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-2xl">
                      {perk.icon}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{perk.title}</h3>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed">{perk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bonuses */}
          <section className="mt-24 bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur">
            <h2 className="text-3xl font-semibold text-white">Bonus de bienvenue 🎉</h2>
            <p className="mt-3 text-white/60 max-w-3xl">
              Dès votre inscription, profitez d’avantages exclusifs qui vous font gagner du temps et de l’argent sur
              chaque commande.
            </p>
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {plan?.bonuses?.map((bonus) => (
                <div key={bonus} className="flex items-start space-x-3 p-4 rounded-2xl bg-white/10 border border-white/10">
                  <span className="text-lg">✨</span>
                  <p className="text-white/80 text-sm leading-relaxed">{bonus}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-24">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-semibold text-white">Questions fréquentes</h2>
              <p className="mt-3 text-white/60">
                Une équipe dédiée basée à Casablanca répond à toutes vos questions 24/7.
              </p>
            </div>
            <div className="mt-10 space-y-4">
              {plan?.faqs?.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition"
                >
                  <summary className="cursor-pointer list-none px-6 py-5 flex items-center justify-between">
                    <span className="text-lg font-medium text-white group-open:text-blue-200">{faq.question}</span>
                    <span className="text-2xl text-white/40 group-open:rotate-45 transition">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-white/60 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-24 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/30 to-purple-500/30 backdrop-blur px-8 py-12 shadow-2xl shadow-blue-500/10">
              <div>
                <h2 className="text-3xl font-semibold">Prêt à vivre une expérience UMOD sans limites ?</h2>
                <p className="mt-3 text-white/70 max-w-2xl">
                  Rejoignez la communauté des membres premium et profitez d’un service pensé pour le rythme de vie au
                  Maroc. Annulation en un clic, aucune mauvaise surprise.
                </p>
              </div>
              {status?.membershipStatus === 'active' ? (
                <button
                  onClick={handleManageMembership}
                  className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-xl shadow-white/20 hover:-translate-y-1 transition transform"
                >
                  Gérer mon abonnement
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-xl shadow-white/20 hover:-translate-y-1 transition transform disabled:opacity-60"
                >
                  {subscribing ? 'Activation en cours...' : 'Activer UMOD Prime'}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MembershipPage;

