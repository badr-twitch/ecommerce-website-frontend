import React, { useState, useEffect } from 'react';
import { Truck, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const DeliveryCountdown = ({ estimatedDeliveryDate, shippedAt }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!estimatedDeliveryDate) return null;

  const estimated = new Date(estimatedDeliveryDate);
  const shipped = shippedAt ? new Date(shippedAt) : new Date();

  const totalDuration = estimated - shipped;
  const elapsed = now - shipped;
  const remaining = estimated - now;

  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  const isOverdue = remaining < 0;
  const isToday = estimated.toDateString() === now.toDateString();
  const isDelivered = progress >= 100 && !isOverdue;

  // Calculate remaining time
  const absDiff = Math.abs(remaining);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // SVG circle parameters
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusColor = () => {
    if (isOverdue) return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    if (isToday) return { stroke: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    if (progress > 75) return { stroke: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    return { stroke: '#3b82f6', bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200' };
  };

  const colors = getStatusColor();

  const getStatusMessage = () => {
    if (isOverdue) {
      return `En retard de ${days > 0 ? `${days}j ` : ''}${hours}h`;
    }
    if (isToday) {
      return 'Livraison prévue aujourd\'hui !';
    }
    if (days === 0) {
      return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    if (days === 1) {
      return 'Livraison demain';
    }
    return `Dans ${days} jour${days > 1 ? 's' : ''}, ${hours}h`;
  };

  const StatusIcon = isOverdue ? AlertTriangle : isToday ? CheckCircle : isDelivered ? CheckCircle : Truck;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 flex items-center gap-4`}>
      {/* Circular progress */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-bold ${colors.text}`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <StatusIcon className={`h-4 w-4 ${colors.text}`} />
          <span className={`text-sm font-semibold ${colors.text}`}>
            {getStatusMessage()}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Livraison estimée: {estimated.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </p>
        {shippedAt && (
          <p className="text-xs text-gray-400 mt-0.5">
            Expédié le {new Date(shippedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DeliveryCountdown;
