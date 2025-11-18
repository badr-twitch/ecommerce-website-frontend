import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, formatPrice } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { paymentService } from '../services/paymentService';

const MembershipPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useContext(AuthContext);

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState(null);
  const [autoRenewPreference, setAutoRenewPreference] = useState(true);
  const [paymentError, setPaymentError] = useState('');

  const selectedPaymentMethod = paymentMethods.find(
    (method) => method.id === selectedPaymentMethodId,
  );

  const loadPaymentMethods = useCallback(async () => {
    if (!isAuthenticated) {
      setPaymentMethods([]);
      return [];
    }

    setPaymentMethodsLoading(true);
    setPaymentError('');

    try {
      const response = await paymentService.getPaymentMethods();
      if (response.success) {
        const methods = response.paymentMethods || [];
        setPaymentMethods(methods);
        return methods;
      }

      setPaymentError('Impossible de charger vos méthodes de paiement.');
      return [];
    } catch (loadError) {
      console.error('❌ Error loading membership payment methods:', loadError);
      setPaymentError('Impossible de charger vos méthodes de paiement.');
      return [];
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, [isAuthenticated]);

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

  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentMethods();
    } else {
      setPaymentMethods([]);
    }
  }, [isAuthenticated, loadPaymentMethods]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour rejoindre UMOD Prime');
      navigate('/login', { state: { from: '/membership' } });
      return;
    }

    const methods =
      paymentMethods.length > 0 ? paymentMethods : await loadPaymentMethods();

    const availableMethods = (methods || []).filter((method) => method?.isActive !== false);

    if (!availableMethods.length) {
      toast.error('Ajoutez une méthode de paiement pour activer UMOD Prime');
      navigate('/profile', { state: { openPaymentTab: true } });
      return;
    }

    const defaultMethod = availableMethods.find((method) => method.isDefault) || availableMethods[0];

    setSelectedPaymentMethodId(defaultMethod?.id || null);
    setAutoRenewPreference(true);
    setPaymentError('');
    setPaymentModalOpen(true);
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

  const handleClosePaymentModal = () => {
    if (!subscribing) {
      setPaymentModalOpen(false);
      setPaymentError('');
    }
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPaymentMethodId) {
      toast.error('Sélectionnez une méthode de paiement pour continuer');
      return;
    }

    setSubscribing(true);

    try {
      const response = await membershipAPI.subscribe({
        paymentMethodId: selectedPaymentMethodId,
        autoRenew: autoRenewPreference,
      });

      if (response.data.success) {
        toast.success(
          response.data.message ||
            'Bienvenue dans UMOD Prime ! Votre carte a été débitée avec succès.',
        );
        setStatus(response.data.data);
        setPaymentModalOpen(false);

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

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  UMOD Prime
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Confirmer l’activation</h2>
              </div>
              <button
                onClick={handleClosePaymentModal}
                disabled={subscribing}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5 px-6 py-6">
              <p className="text-sm text-slate-600">
                Votre carte sera débitée de{' '}
                {plan ? formatPrice(plan.price, plan.currency) : '69,99 DH'} pour activer UMOD Prime
                immédiatement.
              </p>

              {paymentError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {paymentError}
                </div>
              )}

              {paymentMethodsLoading ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Chargement des méthodes de paiement…
                </div>
              ) : paymentMethods.length ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        selectedPaymentMethodId === method.id
                          ? 'border-blue-500 bg-blue-50/70'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="membership-payment-method"
                          value={method.id}
                          checked={selectedPaymentMethodId === method.id}
                          onChange={() => setSelectedPaymentMethodId(method.id)}
                          disabled={subscribing}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {(method.brand || method.type || 'Carte').toUpperCase()} •••• {method.last4}
                          </p>
                          <p className="text-xs text-slate-500">
                            Exp. {method.expiry} — {method.cardholderName}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                          Par défaut
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Aucune méthode de paiement active. Ajoutez une carte avant de poursuivre.
                </div>
              )}

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={autoRenewPreference}
                  onChange={(event) => setAutoRenewPreference(event.target.checked)}
                  disabled={subscribing}
                  className="mt-1 text-blue-500 focus:ring-blue-500"
                />
                <span>
                  Activer le renouvellement automatique chaque mois. Vous pourrez modifier ce réglage à tout
                  moment depuis votre profil.
                </span>
              </label>

              {selectedPaymentMethod && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Paiement avec {selectedPaymentMethod.brand || selectedPaymentMethod.type || 'votre carte'} se
                  terminant par {selectedPaymentMethod.last4}. Transaction sécurisée via notre partenaire
                  de paiement.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setPaymentError('');
                  navigate('/profile', { state: { openPaymentTab: true } });
                }}
                disabled={subscribing}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Gérer mes méthodes de paiement
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleClosePaymentModal}
                  disabled={subscribing}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSubscription}
                  disabled={subscribing || !selectedPaymentMethodId || !paymentMethods.length}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscribing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Activation…
                    </>
                  ) : (
                    <>Payer {plan ? formatPrice(plan.price, plan.currency) : '69,99 DH'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;

