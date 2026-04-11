import React, { useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { membershipAPI } from '../../services/api';
import toast from 'react-hot-toast';
import useModal from '../../hooks/useModal';

const statusLabels = {
  active: 'Actif',
  cancelled: 'Renouvellement arrêté',
  expired: 'Expiré',
  pending: 'En attente',
  none: 'Inactif',
};

const statusDescriptions = {
  active: "Votre abonnement UMOD Prime est actif. Vous profitez de tous les avantages premium.",
  cancelled:
    "Le renouvellement automatique est suspendu. Vous gardez l’accès aux avantages jusqu’à la date d’expiration.",
  expired: "Votre abonnement est expiré. Réactivez-le pour bénéficier à nouveau des avantages premium.",
  pending:
    "Nous confirmons actuellement l’activation de votre abonnement. Vous recevrez un e-mail dès qu’il sera opérationnel.",
  none: "Vous n’êtes pas encore abonné. Rejoignez UMOD Prime et profitez d’avantages exclusifs.",
};

const MembershipManageModal = ({
  isOpen,
  onClose,
  status = {},
  plan,
  loading = false,
  statusLoading = false,
  onCancel,
  onSubscribe,
  onRefresh,
}) => {
  const {
    membershipStatus = 'none',
    membershipActivatedAt,
    membershipExpiresAt,
    membershipAutoRenew = true,
  } = status;

  useModal(isOpen, onClose);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [autoRenewToggling, setAutoRenewToggling] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const statusLabel = statusLabels[membershipStatus] || statusLabels.none;
  const description = statusDescriptions[membershipStatus] || statusDescriptions.none;

  // Can refund within 30 days of activation
  const canRefund = membershipActivatedAt && membershipStatus !== 'none' &&
    (Date.now() - new Date(membershipActivatedAt).getTime()) < 30 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    console.log('🔁 MembershipManageModal - isOpen changed:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      console.log('🔍 MembershipManageModal - status data:', status);
      console.log('🔍 MembershipManageModal - plan data:', plan);
      console.log('🔍 MembershipManageModal - loading flags:', { loading, statusLoading });
    }
  }, [isOpen, status, plan, loading, statusLoading]);

  // Load transactions when modal opens
  useEffect(() => {
    if (isOpen && membershipStatus !== 'none') {
      setTxLoading(true);
      membershipAPI.getTransactions()
        .then(({ data }) => setTransactions(data.data || []))
        .catch(() => {})
        .finally(() => setTxLoading(false));
    }
  }, [isOpen, membershipStatus]);

  const handleToggleAutoRenew = async () => {
    setAutoRenewToggling(true);
    try {
      await membershipAPI.toggleAutoRenew();
      toast.success('Renouvellement automatique modifié');
      if (onRefresh) onRefresh();
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setAutoRenewToggling(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir demander un remboursement ? Votre abonnement sera annulé immédiatement.')) return;
    setRefunding(true);
    try {
      await membershipAPI.refund();
      toast.success('Remboursement effectué');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du remboursement');
    } finally {
      setRefunding(false);
    }
  };

  const TX_TYPE_LABELS = {
    subscription: 'Souscription',
    renewal: 'Renouvellement',
    cancellation: 'Annulation',
    refund: 'Remboursement',
    expiration: 'Expiration',
  };

  const benefits = useMemo(() => {
    if (plan?.perks?.length) {
      return plan.perks;
    }
    return [
      {
        title: 'Livraison express illimitée',
        description: 'Expéditions prioritaires partout au Maroc sans minimum d’achat.',
        icon: '🚚',
      },
      {
        title: 'Conciergerie shopping 7j/7',
        description: 'Un expert UMOD vous accompagne via WhatsApp et téléphone.',
        icon: '🤝',
      },
      {
        title: 'Offres VIP',
        description: 'Accès anticipé aux ventes privées et cadeaux exclusifs.',
        icon: '🎁',
      },
    ];
  }, [plan]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">UMOD Prime</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Gérer mon abonnement</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Fermer"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-600">
                  {statusLabel}
                </span>
                {statusLoading && (
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="h-2 w-2 animate-ping rounded-full bg-primary-500/80" />
                    Actualisation…
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-slate-600">{description}</p>

              <dl className="mt-4 grid gap-4 rounded-xl border border-slate-200/70 bg-white p-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Plan</dt>
                  <dd className="mt-1 font-medium text-slate-900">{plan?.name || 'UMOD Prime'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Prix</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {plan
                      ? new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: plan.currency || 'MAD',
                        }).format(plan.price || 69.99)
                      : '69,99 DH'}{' '}
                    / mois
                  </dd>
                </div>
                {membershipActivatedAt && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Activé le</dt>
                    <dd className="mt-1">
                      {new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(membershipActivatedAt))}
                    </dd>
                  </div>
                )}
                {membershipExpiresAt && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      {membershipStatus === 'active' ? 'Renouvellement' : 'Expiration'}
                    </dt>
                    <dd className="mt-1">
                      {new Intl.DateTimeFormat('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      }).format(new Date(membershipExpiresAt))}
                    </dd>
                  </div>
                )}
                {membershipStatus === 'active' && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-400">Renouvellement automatique</dt>
                    <dd className="mt-1 text-slate-700">
                      {membershipAutoRenew
                        ? 'Activé – votre abonnement sera renouvelé automatiquement.'
                        : 'Désactivé – votre abonnement restera actif jusqu’à la date d’expiration.'}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Avantages inclus</h3>
                {typeof onRefresh === 'function' && (
                  <button
                    onClick={onRefresh}
                    disabled={statusLoading || loading}
                    className="text-xs font-semibold text-primary-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Actualiser
                  </button>
                )}
              </div>
              <ul className="space-y-3">
                {benefits.map((perk) => (
                  <li
                    key={perk.title}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-slate-50/80 p-4"
                  >
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-lg">
                      {perk.icon || '✨'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{perk.title}</p>
                      {perk.description && <p className="text-xs text-slate-600">{perk.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5">
            <div className="space-y-3 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-900">Prochaines actions</p>
              {membershipStatus === 'active' ? (
                <>
                  <p>
                    Gérez votre renouvellement automatique ou modifiez votre abonnement en quelques clics. Vous gardez
                    vos avantages jusqu’à la fin de la période en cours.
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                    <p>Besoin d’aide ? Notre conciergerie est disponible 7j/7.</p>
                    <a
                      href="https://wa.me/212522000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600 transition"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp Concierge
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Rejoignez UMOD Prime et profitez immédiatement de la livraison express, d’un concierge shopping dédié
                    et d’offres exclusives pour le marché marocain.
                  </p>
                  <p className="rounded-xl border border-primary-200 bg-primary-50 p-3 text-primary-700">
                    Activation instantanée, sans engagement. Satisfait ou remboursé sous 30 jours.
                  </p>
                </>
              )}
            </div>

            {/* Auto-renew toggle */}
            {['active', 'cancelled'].includes(membershipStatus) && (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                <span className="text-sm text-slate-700">Renouvellement auto</span>
                <button
                  onClick={handleToggleAutoRenew}
                  disabled={autoRenewToggling}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    membershipAutoRenew ? 'bg-primary-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    membershipAutoRenew ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            )}

            <div className="space-y-3">
              {membershipStatus === 'active' || membershipStatus === 'cancelled' ? (
                <>
                  {membershipStatus === 'active' && (
                    <button
                      onClick={onCancel}
                      disabled={loading || !onCancel}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Traitement…' : 'Suspendre le renouvellement'}
                    </button>
                  )}
                  {membershipStatus === 'cancelled' && (
                    <button
                      onClick={onSubscribe}
                      disabled={loading || !onSubscribe}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition hover:shadow-primary-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? 'Activation…' : 'Réactiver UMOD Prime'}
                    </button>
                  )}
                  {canRefund && (
                    <button
                      onClick={handleRefund}
                      disabled={refunding}
                      className="w-full rounded-full border border-red-300 px-5 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {refunding ? 'Remboursement…' : 'Demander un remboursement (garantie 30j)'}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Fermer
                  </button>
                </>
              ) : membershipStatus === 'expired' ? (
                <>
                  <button
                    onClick={onSubscribe}
                    disabled={loading || !onSubscribe}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition hover:shadow-primary-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Activation…' : 'Réactiver UMOD Prime'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Fermer
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSubscribe}
                    disabled={loading || !onSubscribe}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/40 transition hover:shadow-primary-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Activation…' : 'Activer UMOD Prime'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Peut-être plus tard
                  </button>
                </>
              )}
            </div>

            {/* Transaction History */}
            {transactions.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Historique</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-slate-700">{TX_TYPE_LABELS[tx.type] || tx.type}</span>
                        <span className="text-slate-400 ml-2">
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      {tx.amount > 0 && (
                        <span className={`font-medium ${tx.type === 'refund' ? 'text-green-600' : 'text-slate-700'}`}>
                          {tx.type === 'refund' ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} {tx.currency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
              En activant UMOD Prime, vous acceptez nos conditions d’abonnement. Annulation en un clic depuis votre
              espace client. Pour toute question, contactez-nous sur support@umod.ma.
            </div>
          </aside>
        </div>
        </div>
      </div>
    </div>
  );
};

MembershipManageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  status: PropTypes.shape({
    membershipStatus: PropTypes.string,
    membershipActivatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    membershipExpiresAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    membershipAutoRenew: PropTypes.bool,
  }),
  plan: PropTypes.shape({
    name: PropTypes.string,
    price: PropTypes.number,
    currency: PropTypes.string,
    perks: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
  }),
  loading: PropTypes.bool,
  statusLoading: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubscribe: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default MembershipManageModal;

