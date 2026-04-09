import React, { useState, useEffect } from 'react';
import { membershipAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TIER_COLORS = {
  bronze: { bg: 'from-amber-600 to-orange-700', text: 'text-amber-400', border: 'border-amber-500/30' },
  silver: { bg: 'from-gray-400 to-gray-500', text: 'text-gray-300', border: 'border-gray-400/30' },
  gold: { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', border: 'border-yellow-400/30' },
  platinum: { bg: 'from-indigo-400 to-purple-500', text: 'text-purple-300', border: 'border-purple-400/30' }
};

const TIER_LABELS = {
  bronze: 'Bronze',
  silver: 'Argent',
  gold: 'Or',
  platinum: 'Platine'
};

const LoyaltyDashboard = () => {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    loadLoyalty();
  }, []);

  const loadLoyalty = async () => {
    try {
      const res = await membershipAPI.getLoyalty();
      if (res.data?.success) {
        setLoyalty(res.data.data);
      }
    } catch (err) {
      console.error('Error loading loyalty:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!loyalty || loyalty.redeemableVouchers < 1) return;
    setRedeeming(true);
    try {
      const res = await membershipAPI.redeemPoints(1000);
      if (res.data?.success) {
        toast.success(res.data.message);
        loadLoyalty();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la conversion');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="h-20 bg-white/10 rounded" />
      </div>
    );
  }

  if (!loyalty) return null;

  const tierColor = TIER_COLORS[loyalty.tier] || TIER_COLORS.bronze;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
      <h3 className="text-lg font-semibold text-white mb-4">Programme Fidélité</h3>

      {/* Tier & Points */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tierColor.bg} text-white text-sm font-bold`}>
            {loyalty.tier === 'platinum' ? '💎' : loyalty.tier === 'gold' ? '🥇' : loyalty.tier === 'silver' ? '🥈' : '🥉'}
            {TIER_LABELS[loyalty.tier]}
          </div>
          <p className="mt-2 text-3xl font-bold text-white">{loyalty.points.toLocaleString()}</p>
          <p className="text-sm text-white/60">points disponibles</p>
        </div>

        <div className="text-right">
          {loyalty.redeemableVouchers > 0 && (
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {redeeming ? 'Conversion...' : `Convertir 1000 pts → ${loyalty.voucherValue} DH`}
            </button>
          )}
        </div>
      </div>

      {/* Tier Progress */}
      {loyalty.nextTier && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{TIER_LABELS[loyalty.tier]}</span>
            <span>{TIER_LABELS[loyalty.nextTier]} ({loyalty.nextTierThreshold?.toLocaleString()} pts)</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${tierColor.bg} rounded-full transition-all duration-500`}
              style={{ width: `${loyalty.progressToNextTier}%` }}
            />
          </div>
          <p className="text-xs text-white/40 mt-1">
            {loyalty.totalEarned.toLocaleString()} / {loyalty.nextTierThreshold?.toLocaleString()} points cumulés
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-white/50">Total gagné</p>
          <p className="text-lg font-semibold text-white">{loyalty.totalEarned.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <p className="text-xs text-white/50">Bons disponibles</p>
          <p className="text-lg font-semibold text-white">
            {loyalty.redeemableVouchers} x {loyalty.voucherValue} DH
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;
