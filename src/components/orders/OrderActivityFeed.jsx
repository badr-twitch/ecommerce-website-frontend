import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Shield,
  User,
  Settings
} from 'lucide-react';
import { ordersAPI } from '../../services/api';

const STATUS_META = {
  pending:    { label: 'Commande reçue',      icon: Clock,        color: 'bg-yellow-500' },
  confirmed:  { label: 'Confirmée',           icon: CheckCircle,  color: 'bg-primary-500' },
  processing: { label: 'En préparation',      icon: Package,      color: 'bg-indigo-500' },
  shipped:    { label: 'Expédiée',            icon: Truck,        color: 'bg-secondary-500' },
  delivered:  { label: 'Livrée',              icon: Home,         color: 'bg-green-500' },
  cancelled:  { label: 'Annulée',             icon: XCircle,      color: 'bg-red-500' },
  refunded:   { label: 'Remboursée',          icon: RefreshCw,    color: 'bg-orange-500' },
};

const ROLE_META = {
  customer: { label: 'Vous',           icon: User,     color: 'text-indigo-600' },
  admin:    { label: 'Administrateur',  icon: Shield,   color: 'text-red-600' },
  system:   { label: 'Système',         icon: Settings,  color: 'text-gray-500' },
};

const OrderActivityFeed = ({ orderId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchHistory = async () => {
      try {
        const { data } = await ordersAPI.getHistory(orderId);
        setEvents(data.history || []);
      } catch {
        // Silently fail — the compact OrderStatus still shows
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Historique de la commande</h3>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {events.map((event, index) => {
            const statusInfo = STATUS_META[event.newStatus] || STATUS_META.pending;
            const roleInfo = ROLE_META[event.changedByRole] || ROLE_META.system;
            const StatusIcon = statusInfo.icon;
            const isLatest = index === 0;

            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${statusInfo.color} ${
                  isLatest ? 'ring-4 ring-offset-2 ring-indigo-100' : ''
                }`}>
                  <StatusIcon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {event.previousStatus
                        ? `${STATUS_META[event.previousStatus]?.label || event.previousStatus} → ${statusInfo.label}`
                        : statusInfo.label
                      }
                    </p>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}{' '}
                      {new Date(event.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>

                  {/* Actor */}
                  <p className={`text-xs mt-0.5 ${roleInfo.color}`}>
                    Par {event.changedByName || roleInfo.label}
                  </p>

                  {/* Reason */}
                  {event.reason && (
                    <div className="mt-1.5 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                      <p className="text-xs text-gray-600 italic">"{event.reason}"</p>
                    </div>
                  )}

                  {isLatest && (
                    <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Statut actuel
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderActivityFeed;
