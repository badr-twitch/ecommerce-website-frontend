import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Trash2, Send, RefreshCw, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Volume2 } from 'lucide-react';
import { adminNotificationsAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const NOTIFICATION_TYPES = {
  order_new: 'Nouvelle commande',
  order_status_change: 'Changement statut',
  order_high_value: 'Commande haute valeur',
  inventory_low_stock: 'Stock faible',
  inventory_out_of_stock: 'Rupture de stock',
  inventory_restored: 'Stock restauré',
  user_registration: 'Inscription',
  user_vip_login: 'Connexion VIP',
  user_verification: 'Vérification',
  revenue_milestone: 'Revenu',
  system_error: 'Erreur système',
  system_performance: 'Performance',
  payment_failure: 'Paiement échoué',
  refund_request: 'Remboursement',
  membership: 'Abonnement'
};

const PRIORITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  low: 'bg-green-100 text-green-800'
};

const AdminNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRead, setFilterRead] = useState('');

  // Send form
  const [sendForm, setSendForm] = useState({
    mode: 'broadcast',
    userId: '',
    type: 'system_error',
    title: '',
    message: '',
    priority: 'medium'
  });

  const loadStats = useCallback(async () => {
    try {
      const res = await adminNotificationsAPI.getStats();
      if (res.data?.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const loadNotifications = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const params = { limit: pagination.limit, offset };
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;
      if (filterRead) params.isRead = filterRead;

      const res = await adminNotificationsAPI.getAll(params);
      if (res.data?.success) {
        setNotifications(res.data.data);
        setPagination(res.data.pagination);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterPriority, filterRead, pagination.limit]);

  useEffect(() => {
    loadStats();
    loadNotifications(0);
  }, [loadStats, loadNotifications]);

  const handleDelete = async (id) => {
    try {
      await adminNotificationsAPI.deleteOne(id);
      toast.success('Notification supprimée');
      loadNotifications(pagination.offset);
      loadStats();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await adminNotificationsAPI.bulkDelete([...selectedIds]);
      toast.success(`${selectedIds.size} notification(s) supprimée(s)`);
      setSelectedIds(new Set());
      loadNotifications(0);
      loadStats();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!sendForm.title || !sendForm.message) {
      toast.error('Titre et message requis');
      return;
    }

    try {
      const payload = {
        type: sendForm.type,
        title: sendForm.title,
        message: sendForm.message,
        priority: sendForm.priority
      };

      if (sendForm.mode === 'user') {
        payload.userId = sendForm.userId;
        await adminNotificationsAPI.sendToUser(payload);
        toast.success('Notification envoyée');
      } else {
        await adminNotificationsAPI.broadcast(payload);
        toast.success('Notification diffusée');
      }

      setSendForm({ ...sendForm, title: '', message: '', userId: '' });
      loadNotifications(0);
      loadStats();
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleCleanup = async () => {
    try {
      const res = await adminNotificationsAPI.cleanup();
      if (res.data?.success) {
        const d = res.data.data;
        toast.success(`Nettoyage: ${d.expiredDeleted} expirées, ${d.oldReadDeleted} anciennes, ${d.archived} archivées`);
        loadNotifications(0);
        loadStats();
      }
    } catch {
      toast.error('Erreur lors du nettoyage');
    }
  };

  const handleTestAll = async () => {
    try {
      await adminNotificationsAPI.testAll();
      toast.success('Notifications de test créées');
      loadNotifications(0);
      loadStats();
    } catch {
      toast.error('Erreur lors du test');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'dashboard', label: 'Tableau de bord' },
          { id: 'list', label: 'Notifications' },
          { id: 'send', label: 'Envoyer' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} color="blue" />
            <StatCard label="Non lues" value={stats.unread} color="red" />
            <StatCard label="Dernières 24h" value={stats.last24Hours} color="green" />
            <StatCard label="Critiques" value={stats.byPriority.critical} color="orange" />
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Par priorité</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(stats.byPriority).map(([key, val]) => (
                <div key={key} className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[key]}`}>
                    {key}
                  </span>
                  <p className="text-2xl font-bold mt-2">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Par type</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.byType).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{NOTIFICATION_TYPES[key] || key}</span>
                  <span className="text-lg font-bold">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button onClick={handleTestAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Tester toutes les notifications
            </button>
            <button onClick={handleCleanup} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Nettoyage
            </button>
          </div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg border border-gray-200">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={filterType} onChange={e => { setFilterType(e.target.value); }} className="border rounded-md px-3 py-1.5 text-sm">
              <option value="">Tous les types</option>
              {Object.entries(NOTIFICATION_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); }} className="border rounded-md px-3 py-1.5 text-sm">
              <option value="">Toutes priorités</option>
              <option value="critical">Critique</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            <select value={filterRead} onChange={e => { setFilterRead(e.target.value); }} className="border rounded-md px-3 py-1.5 text-sm">
              <option value="">Toutes</option>
              <option value="false">Non lues</option>
              <option value="true">Lues</option>
            </select>
            <button onClick={() => loadNotifications(0)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              Filtrer
            </button>

            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer ({selectedIds.size})
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left">
                    <input type="checkbox" checked={selectedIds.size === notifications.length && notifications.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Priorité</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">Chargement...</td></tr>
                ) : notifications.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-500">Aucune notification</td></tr>
                ) : notifications.map(n => (
                  <tr key={n.id} className={`hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                    <td className="p-3">
                      <input type="checkbox" checked={selectedIds.has(n.id)} onChange={() => toggleSelect(n.id)} className="rounded" />
                    </td>
                    <td className="p-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{NOTIFICATION_TYPES[n.type] || n.type}</span>
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{n.message}</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_COLORS[n.priority]}`}>
                        {n.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      {n.isRead ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleDelete(n.id)} className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{pagination.total} notification(s) au total</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadNotifications(pagination.offset - pagination.limit)}
                  disabled={currentPage <= 1}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">Page {currentPage} / {totalPages}</span>
                <button
                  onClick={() => loadNotifications(pagination.offset + pagination.limit)}
                  disabled={currentPage >= totalPages}
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send Tab */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-6">Envoyer une notification</h3>
          <form onSubmit={handleSend} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="broadcast" checked={sendForm.mode === 'broadcast'} onChange={e => setSendForm({ ...sendForm, mode: e.target.value })} />
                  <span className="text-sm">Diffusion (tous)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" value="user" checked={sendForm.mode === 'user'} onChange={e => setSendForm({ ...sendForm, mode: e.target.value })} />
                  <span className="text-sm">Utilisateur spécifique</span>
                </label>
              </div>
            </div>

            {sendForm.mode === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Utilisateur</label>
                <input
                  type="text"
                  value={sendForm.userId}
                  onChange={e => setSendForm({ ...sendForm, userId: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="UUID de l'utilisateur"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={sendForm.type} onChange={e => setSendForm({ ...sendForm, type: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                {Object.entries(NOTIFICATION_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select value={sendForm.priority} onChange={e => setSendForm({ ...sendForm, priority: e.target.value })} className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={sendForm.title}
                onChange={e => setSendForm({ ...sendForm, title: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Titre de la notification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={sendForm.message}
                onChange={e => setSendForm({ ...sendForm, message: e.target.value })}
                rows={3}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="Contenu du message"
              />
            </div>

            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
              <Send className="w-4 h-4" />
              {sendForm.mode === 'broadcast' ? 'Diffuser' : 'Envoyer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200'
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default AdminNotificationsPage;
