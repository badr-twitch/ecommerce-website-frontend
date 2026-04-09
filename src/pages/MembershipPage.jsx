import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { membershipAPI, formatPrice } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Unlock, Zap, ShieldCheck, Gift, Sparkles, PartyPopper } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import LoyaltyDashboard from '../components/membership/LoyaltyDashboard';
import SeasonalBanner from '../components/membership/SeasonalBanner';
import GiftMembershipModal from '../components/membership/GiftMembershipModal';

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
  const [selectedPlanKey, setSelectedPlanKey] = useState('monthly');
  const [giftModalOpen, setGiftModalOpen] = useState(false);

  const selectedPlanConfig = plan?.plans?.[selectedPlanKey] || null;
  const monthlyPlan = plan?.plans?.monthly;
  const annualPlan = plan?.plans?.annual;

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
        planId: selectedPlanConfig?.id,
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
        <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
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
          <div className="absolute -top-32 -right-40 w-96 h-96 bg-primary-500/20 blur-3xl rounded-full"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-500/20 blur-3xl rounded-full"></div>
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
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                    L’abonnement qui révolutionne votre shopping au Maroc
                  </span>
                </h1>
                <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-2xl">
                  Un abonnement exclusif pensé pour le marché marocain : livraison express, conciergerie 7j/7,
                  offres VIP et protection premium pour chacun de vos achats.
                </p>

                {/* Plan Toggle */}
                <div className="mt-10 max-w-xl">
                  <div className="flex items-center justify-center sm:justify-start gap-2 p-1 rounded-full bg-white/10 border border-white/10 w-fit">
                    <button
                      onClick={() => setSelectedPlanKey('monthly')}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                        selectedPlanKey === 'monthly'
                          ? 'bg-white text-slate-900 shadow-md'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Mensuel
                    </button>
                    <button
                      onClick={() => setSelectedPlanKey('annual')}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition relative ${
                        selectedPlanKey === 'annual'
                          ? 'bg-white text-slate-900 shadow-md'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Annuel
                      {annualPlan?.savings && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-[10px] font-bold text-white shadow-lg">
                          -{Math.round(annualPlan.savings)} DH
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur">
                      <p className="text-sm text-white/60 uppercase tracking-wide">
                        {selectedPlanKey === 'annual' ? 'Tarif annuel' : 'Tarif mensuel'}
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {selectedPlanConfig ? formatPrice(selectedPlanConfig.price, selectedPlanConfig.currency) : '69,99 DH'}
                        <span className="ml-2 text-base text-white/50 font-normal">
                          / {selectedPlanKey === 'annual' ? 'an' : 'mois'}
                        </span>
                      </p>
                      {selectedPlanKey === 'annual' && monthlyPlan && (
                        <p className="mt-1 text-sm text-green-400">
                          soit {formatPrice(Math.round(annualPlan.price / 12 * 100) / 100, 'MAD')}/mois au lieu de {formatPrice(monthlyPlan.price, 'MAD')}
                        </p>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-white/10 backdrop-blur">
                      <p className="text-sm text-white/70">Essai satisfait ou remboursé</p>
                      <p className="mt-2 text-lg font-semibold">Remboursement garanti sous 30 jours</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-4">
                  {status?.membershipStatus === 'active' ? (
                    <button
                      onClick={handleManageMembership}
                      className="px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition transform"
                    >
                      Gestion de mon abonnement
                    </button>
                  ) : (
                    <button
                      onClick={handleSubscribe}
                      disabled={subscribing}
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 font-semibold shadow-xl shadow-primary-500/40 hover:-translate-y-1 transition transform disabled:opacity-60"
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
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/40 to-secondary-500/40 blur-3xl"></div>
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

                    <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border border-white/10">
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
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/20"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-2xl"></div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-2xl">
                      {perk.icon}
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{perk.title}</h3>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed">{perk.description}</p>
                    {perk.title === 'Support client 24/7' && (
                      <a
                        href="https://wa.me/212522000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-400/30 text-green-400 text-sm font-medium hover:bg-green-500/30 transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.79 23.329l4.47-1.474A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.588-5.932-1.614l-.425-.252-2.652.875.868-2.578-.278-.44A9.79 9.79 0 012.182 12c0-5.415 4.403-9.818 9.818-9.818S21.818 6.585 21.818 12 17.415 21.818 12 21.818z"/>
                        </svg>
                        Contacter via WhatsApp
                      </a>
                    )}
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

          {/* Seasonal Offers */}
          <section className="mt-24">
            <SeasonalBanner />
          </section>

          {/* Loyalty + Gift */}
          {isAuthenticated && (
            <section className="mt-24 grid md:grid-cols-2 gap-6">
              <LoyaltyDashboard />
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Offrir UMOD Prime</h3>
                  <p className="text-sm text-white/60">
                    Faites plaisir à vos proches avec un abonnement UMOD Prime. Choisissez le plan et envoyez un code cadeau.
                  </p>
                </div>
                <button
                  onClick={() => setGiftModalOpen(true)}
                  className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary-500 to-pink-500 text-white font-semibold hover:opacity-90 transition w-full"
                >
                  🎁 Offrir un abonnement
                </button>
              </div>
            </section>
          )}

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
                    <span className="text-lg font-medium text-white group-open:text-primary-200">{faq.question}</span>
                    <span className="text-2xl text-white/40 group-open:rotate-45 transition">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-white/60 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="mt-24 mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl border border-white/10 bg-gradient-to-r from-primary-600/30 to-secondary-500/30 backdrop-blur px-8 py-12 shadow-2xl shadow-primary-500/10">
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

      <GiftMembershipModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        plans={plan?.plans}
      />

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
                <span className="font-semibold">{selectedPlanConfig ? formatPrice(selectedPlanConfig.price, selectedPlanConfig.currency) : '69,99 DH'}</span>{' '}
                pour activer UMOD Prime ({selectedPlanConfig?.billingCycle || 'Mensuel'}) immédiatement.
              </p>

              {paymentError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {paymentError}
                </div>
              )}

              {paymentMethodsLoading ? (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                  Chargement des méthodes de paiement…
                </div>
              ) : paymentMethods.length ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        selectedPaymentMethodId === method.id
                          ? 'border-primary-500 bg-primary-50/70'
                          : 'border-slate-200 hover:border-primary-300'
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
                          className="text-primary-500 focus:ring-primary-500"
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
                        <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-600">
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
                  className="mt-1 text-primary-500 focus:ring-primary-500"
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
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {subscribing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Activation…
                    </>
                  ) : (
                    <>Payer {selectedPlanConfig ? formatPrice(selectedPlanConfig.price, selectedPlanConfig.currency) : '69,99 DH'}</>
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

