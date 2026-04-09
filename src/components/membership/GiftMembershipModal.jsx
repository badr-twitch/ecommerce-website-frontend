import React, { useState } from 'react';
import { membershipAPI } from '../../services/api';
import toast from 'react-hot-toast';

const GiftMembershipModal = ({ isOpen, onClose, plans }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('umod-prime-monthly');
  const [sending, setSending] = useState(false);
  const [giftResult, setGiftResult] = useState(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      toast.error('Entrez l\'email du destinataire');
      return;
    }

    setSending(true);
    try {
      const res = await membershipAPI.purchaseGift({
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim(),
        personalMessage: personalMessage.trim(),
        planId: selectedPlan
      });

      if (res.data?.success) {
        setGiftResult(res.data.data);
        toast.success('Carte cadeau envoyée !');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi du cadeau');
    } finally {
      setSending(false);
    }
  };

  const handleCopyCode = () => {
    if (giftResult?.code) {
      navigator.clipboard.writeText(giftResult.code);
      toast.success('Code copié !');
    }
  };

  const handleClose = () => {
    setRecipientEmail('');
    setRecipientName('');
    setPersonalMessage('');
    setGiftResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-secondary-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Offrir UMOD Prime</h2>
            <p className="text-sm text-white/80">Faites plaisir avec un abonnement premium</p>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white text-xl">
            ✕
          </button>
        </div>

        <div className="p-6">
          {giftResult ? (
            <div className="text-center space-y-4">
              <div className="text-5xl">🎉</div>
              <h3 className="text-xl font-bold text-gray-900">Cadeau créé !</h3>
              <p className="text-gray-600">
                Partagez ce code avec <strong>{recipientEmail}</strong>
              </p>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4">
                <p className="text-3xl font-mono font-bold text-secondary-600 tracking-widest">
                  {giftResult.code}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-6 py-2 bg-secondary-600 text-white rounded-full font-medium hover:bg-secondary-700 transition"
              >
                Copier le code
              </button>
              <p className="text-xs text-gray-500">
                Valable jusqu'au {new Date(giftResult.expiresAt).toLocaleDateString('fr-FR')}
              </p>
              <button
                onClick={handleClose}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan à offrir</label>
                <div className="grid grid-cols-2 gap-3">
                  {plans && Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 rounded-xl border-2 text-left transition ${
                        selectedPlan === plan.id
                          ? 'border-secondary-500 bg-secondary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{plan.billingCycle}</p>
                      <p className="text-lg font-bold text-secondary-600">{plan.price} DH</p>
                      {plan.badge && (
                        <span className="text-xs text-green-600 font-medium">{plan.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email du destinataire *</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="ami@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du destinataire</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Prénom"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message personnel</label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Joyeux anniversaire ! Profite bien de UMOD Prime..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !recipientEmail.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-secondary-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {sending ? 'Envoi...' : 'Offrir le cadeau'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftMembershipModal;
