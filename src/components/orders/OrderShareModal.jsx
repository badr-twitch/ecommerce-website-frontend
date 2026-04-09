import React, { useState } from 'react';
import { X, Link2, Check, Share2, Gift, Package, Truck } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SHARE_TYPES = [
  {
    key: 'status',
    label: 'Statut uniquement',
    description: 'Partage le statut de livraison sans les produits ni les prix',
    icon: Truck
  },
  {
    key: 'products',
    label: 'Produits + Statut',
    description: 'Partage les produits commandés avec leurs prix et le statut',
    icon: Package
  },
  {
    key: 'gift',
    label: 'Reçu cadeau',
    description: 'Partage les produits sans les prix — parfait pour les cadeaux',
    icon: Gift
  }
];

const OrderShareModal = ({ order, isOpen, onClose }) => {
  const [shareType, setShareType] = useState('products');
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data } = await ordersAPI.shareOrder(order.id, { shareType });
      setShareUrl(data.shareUrl);
    } catch (error) {
      toast.error('Erreur lors de la génération du lien');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le lien');
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      shareType === 'gift'
        ? `J'ai un cadeau pour toi ! Regarde ici : ${shareUrl}`
        : `Regarde ma commande #${order.orderNumber} : ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleClose = () => {
    setShareUrl('');
    setCopied(false);
    setShareType('products');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-secondary-600">
          <div className="flex items-center gap-2 text-white">
            <Share2 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Partager la commande</h3>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order ref */}
          <p className="text-sm text-gray-500">
            Commande <span className="font-medium text-gray-900">#{order.orderNumber}</span>
          </p>

          {/* Share type selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type de partage</label>
            <div className="space-y-2">
              {SHARE_TYPES.map((type) => {
                const Icon = type.icon;
                const selected = shareType === type.key;
                return (
                  <button
                    key={type.key}
                    onClick={() => { setShareType(type.key); setShareUrl(''); }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${selected ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm font-medium ${selected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate / Share URL */}
          {!shareUrl ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4" />
                  Générer le lien
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              {/* URL display */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none outline-none text-gray-700 truncate"
                />
                <button
                  onClick={handleCopy}
                  className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
                    copied ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                </button>
              </div>

              {/* Share buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Ce lien expire dans 7 jours
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderShareModal;
