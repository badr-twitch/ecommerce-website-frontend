import React, { useContext } from 'react';
import { WishlistContext } from '../contexts/WishlistContext';

const WishlistButton = ({ product, className = '', size = 'md' }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, isLoading } = useContext(WishlistContext);

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = async () => {
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl'
  };

  const baseClasses = `flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 ${
    sizeClasses[size]
  }`;

  const wishlistedClasses = `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
  const notWishlistedClasses = `${baseClasses} bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300`;

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={isLoading}
      className={`${isWishlisted ? wishlistedClasses : notWishlistedClasses} ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={isWishlisted ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
    >
      {isLoading ? (
        <span className="animate-spin">⏳</span>
      ) : isWishlisted ? (
        <span>💝</span>
      ) : (
        <span>🤍</span>
      )}
    </button>
  );
};

export default WishlistButton; 