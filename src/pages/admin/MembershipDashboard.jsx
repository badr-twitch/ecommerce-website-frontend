import React, { useState, useEffect, useCallback } from 'react';
import { adminMembershipAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  active: { label: 'Actif', color: 'badge-success' },
  cancelled: { label: 'Annulé', color: 'badge-warning' },
  expired: { label: 'Expiré', color: 'badge-danger' },
  none: { label: 'Aucun', color: 'bg-gray-100 text-gray-600' }
};

const TX_TYPE_LABELS = {
  subscription: 'Souscription',
  renewal: 'Renouvellement',
  cancellation: 'Annulation',
  refund: 'Remboursement',
  expiration: 'Expiration'
};

const MembershipDashboard = () => {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [memberPage, setMemberPage] = useState(1);
  const [memberTotal, setMemberTotal] = useState(0);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminMembershipAPI.getStats();
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const res = await adminMembershipAPI.getMembers({
        page: memberPage,
        limit: 20,
        status: statusFilter,
        search: searchQuery || undefined
      });
      if (res.data?.success) {
        setMembers(res.data.data.members);
        setMemberTotal(res.data.data.total);
        setMemberTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Members error:', err);
    }
  }, [memberPage, statusFilter, searchQuery]);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await adminMembershipAPI.getTransactions({ page: txPage, limit: 30 });
      if (res.data?.success) {
        setTransactions(res.data.data.transactions);
        setTxTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Transactions error:', err);
    }
  }, [txPage]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadStats();
      setLoading(false);
    };
    init();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'members') loadMembers();
  }, [activeTab, loadMembers]);

  useEffect(() => {
    if (activeTab === 'transactions') loadTransactions();
  }, [activeTab, loadTransactions]);

  const handleAction = async (userId, action, extra = {}) => {
    setActionLoading(true);
    try {
      const res = await adminMembershipAPI.updateMember(userId, { action, ...extra });
      if (res.data?.success) {
        toast.success(res.data.message);
        loadMembers();
        loadStats();
        setSelectedMember(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h2>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Actifs" value={stats.active} color="text-green-600" />
          <StatCard label="Annulés" value={stats.cancelled} color="text-yellow-600" />
          <StatCard label="Expirés" value={stats.expired} color="text-red-600" />
          <StatCard label="Nouveaux (30j)" value={stats.newThisMonth} color="text-primary-600" />
          <StatCard label="Revenu (30j)" value={`${stats.monthlyRevenue?.toFixed(0)} DH`} color="text-purple-600" />
          <StatCard label="Taux de churn" value={`${stats.churnRate}%`} color="text-orange-600" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
            activeTab === 'members' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Membres ({memberTotal})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
            activeTab === 'transactions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setMemberPage(1); }}
              placeholder="Rechercher par nom ou email..."
              className="input w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setMemberPage(1); }}
              className="select"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>

          {/* Members Table */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Membre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Expire le</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Auto-renew</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Points</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map(member => {
                  const statusInfo = STATUS_LABELS[member.membershipStatus] || STATUS_LABELS.none;
                  return (
                    <tr key={member.id} className="hover:bg-primary-50/30 transition-colors duration-200">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {member.membershipPlan || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {member.membershipExpiresAt
                          ? new Date(member.membershipExpiresAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {member.membershipAutoRenew
                          ? <span className="text-green-600 text-xs font-medium">Oui</span>
                          : <span className="text-gray-400 text-xs">Non</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {(member.loyaltyPoints || 0).toLocaleString()}
                        <span className="ml-1 text-xs text-gray-400 capitalize">{member.loyaltyTier}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="text-primary-600 hover:text-primary-800 text-xs font-medium"
                        >
                          Gérer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {memberTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setMemberPage(p => Math.max(1, p - 1))}
                disabled={memberPage === 1}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {memberPage} / {memberTotalPages}
              </span>
              <button
                onClick={() => setMemberPage(p => Math.min(memberTotalPages, p + 1))}
                disabled={memberPage === memberTotalPages}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Membre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Montant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-primary-50/30 transition-colors duration-200">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}{' '}
                      <span className="text-gray-400">{new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-3">
                      {tx.user ? (
                        <span className="font-medium text-gray-900">{tx.user.firstName} {tx.user.lastName}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {TX_TYPE_LABELS[tx.type] || tx.type}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {tx.amount > 0 ? `${parseFloat(tx.amount).toFixed(2)} ${tx.currency}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${
                        tx.status === 'succeeded' ? 'badge-success' :
                        tx.status === 'refunded' ? 'badge-warning' :
                        tx.status === 'failed' ? 'badge-danger' : 'bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{tx.planId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {txTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setTxPage(p => Math.max(1, p - 1))}
                disabled={txPage === 1}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">Page {txPage} / {txTotalPages}</span>
              <button
                onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                disabled={txPage === txTotalPages}
                className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {/* Member Action Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="card-glass shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {selectedMember.firstName} {selectedMember.lastName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{selectedMember.email}</p>

            <div className="space-y-3">
              {selectedMember.membershipStatus !== 'active' && (
                <button
                  onClick={() => handleAction(selectedMember.id, 'activate')}
                  disabled={actionLoading}
                  className="btn-primary w-full !bg-green-600 !hover:bg-green-700 disabled:opacity-50"
                >
                  Activer (30 jours gratuits)
                </button>
              )}

              {(selectedMember.membershipStatus === 'active' || selectedMember.membershipStatus === 'cancelled') && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={extendDays}
                    onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)}
                    min={1}
                    className="input w-20"
                  />
                  <button
                    onClick={() => handleAction(selectedMember.id, 'extend', { daysToExtend: extendDays })}
                    disabled={actionLoading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Prolonger de {extendDays} jours
                  </button>
                </div>
              )}

              {selectedMember.membershipStatus === 'active' && (
                <button
                  onClick={() => handleAction(selectedMember.id, 'cancel')}
                  disabled={actionLoading}
                  className="btn-danger w-full !bg-yellow-500 !hover:bg-yellow-600 disabled:opacity-50"
                >
                  Annuler le renouvellement
                </button>
              )}

              {selectedMember.membershipStatus !== 'expired' && selectedMember.membershipStatus !== 'none' && (
                <button
                  onClick={() => handleAction(selectedMember.id, 'expire')}
                  disabled={actionLoading}
                  className="btn-danger w-full disabled:opacity-50"
                >
                  Forcer l'expiration
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="btn-outline w-full mt-4"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="card-hover p-4">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default MembershipDashboard;
