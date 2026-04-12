import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  Home,
  AlertCircle
} from 'lucide-react';
import DeliveryCountdown from './DeliveryCountdown';

const OrderStatus = ({ order, className = '' }) => {
  const navigate = useNavigate();
  const getStatusSteps = () => {
    const steps = [
      {
        key: 'pending',
        label: 'Commande reçue',
        description: 'Votre commande a été reçue et est en attente de confirmation',
        icon: Clock,
        completed: true
      },
      {
        key: 'confirmed',
        label: 'Commande confirmée',
        description: 'Votre commande a été confirmée et est en cours de préparation',
        icon: CheckCircle,
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order?.status)
      },
      {
        key: 'processing',
        label: 'En préparation',
        description: 'Votre commande est en cours de préparation et d\'emballage',
        icon: Package,
        completed: ['processing', 'shipped', 'delivered'].includes(order?.status)
      },
      {
        key: 'shipped',
        label: 'Expédiée',
        description: 'Votre commande a été expédiée et en route',
        icon: Truck,
        completed: ['shipped', 'delivered'].includes(order?.status)
      },
      {
        key: 'delivered',
        label: 'Livrée',
        description: 'Votre commande a été livrée avec succès',
        icon: Home,
        completed: order?.status === 'delivered'
      }
    ];

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    const currentStep = steps.find(step => step.key === order?.status);
    return steps.indexOf(currentStep);
  };

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  // Handle cancelled/refund_requested/refunded orders
  if (['cancelled', 'refund_requested', 'refunded'].includes(order?.status)) {
    const statusConfig = {
      cancelled: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', title: 'text-red-900', text: 'text-red-700', label: 'Commande annulée', desc: 'Votre commande a été annulée. Contactez le support pour plus d\'informations.' },
      refund_requested: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600', title: 'text-orange-900', text: 'text-orange-700', label: 'Remboursement demandé', desc: 'Votre demande de remboursement est en cours d\'examen par notre équipe. Réponse sous 48h.' },
      refunded: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', title: 'text-red-900', text: 'text-red-700', label: 'Commande remboursée', desc: 'Votre commande a été remboursée. Le remboursement sera traité selon votre méthode de paiement.' },
    };
    const cfg = statusConfig[order.status];
    return (
      <div className={`${cfg.bg} border ${cfg.border} rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className={`h-6 w-6 ${cfg.icon}`} />
          <div>
            <h3 className={`text-sm font-medium ${cfg.title}`}>
              {cfg.label}
            </h3>
            <p className={`text-sm ${cfg.text}`}>
              {order.refundRejectionReason
                ? `Votre demande de remboursement a été rejetée : ${order.refundRejectionReason}`
                : cfg.desc
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Suivi de votre commande</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
          <div 
            className="absolute top-0 left-0 w-full bg-indigo-500 transition-all duration-500 ease-in-out"
            style={{ 
              height: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCurrentStep = step.key === order?.status;
            const isCompleted = step.completed;
            const isFuture = index > currentStepIndex;

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Step Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-indigo-500 text-white shadow-lg' 
                    : isCurrentStep
                    ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium transition-colors duration-300 ${
                    isCompleted 
                      ? 'text-indigo-900' 
                      : isCurrentStep
                      ? 'text-indigo-700'
                      : 'text-gray-500'
                  }`}>
                    {step.label}
                  </div>
                  <p className={`text-sm transition-colors duration-300 ${
                    isCompleted 
                      ? 'text-indigo-700' 
                      : isCurrentStep
                      ? 'text-indigo-600'
                      : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Current Step Indicator */}
                  {isCurrentStep && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Clock className="h-3 w-3 mr-1 animate-pulse" />
                      En cours
                    </div>
                  )}
                  
                  {/* Step Timestamp */}
                  {order && step.key === order.status && (
                    <p className="text-xs text-gray-500 mt-1">
                      {step.key === 'pending' && `Reçue le ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`}
                      {step.key === 'confirmed' && order.confirmedAt && `Confirmée le ${new Date(order.confirmedAt).toLocaleDateString('fr-FR')}`}
                      {step.key === 'processing' && order.processingAt && `En préparation depuis le ${new Date(order.processingAt).toLocaleDateString('fr-FR')}`}
                      {step.key === 'shipped' && order.shippedAt && `Expédiée le ${new Date(order.shippedAt).toLocaleDateString('fr-FR')}`}
                      {step.key === 'delivered' && order.deliveredAt && `Livrée le ${new Date(order.deliveredAt).toLocaleDateString('fr-FR')}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Information */}
      {order?.trackingNumber && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="font-medium text-indigo-900">
                  Numéro de suivi: {order.trackingNumber}
                </p>
                <p className="text-sm text-indigo-700">
                  Suivez votre colis en temps réel
                </p>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/track-order?order=${order.orderNumber}&email=${order.customerEmail}`)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Suivre le colis
            </button>
          </div>
        </div>
      )}

      {order?.estimatedDeliveryDate && order?.status === 'shipped' && (
        <div className="mt-4">
          <DeliveryCountdown
            estimatedDeliveryDate={order.estimatedDeliveryDate}
            shippedAt={order.shippedAt}
          />
        </div>
      )}

      {order?.estimatedDeliveryDate && order?.status !== 'shipped' && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Livraison estimée: <span className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString('fr-FR')}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
