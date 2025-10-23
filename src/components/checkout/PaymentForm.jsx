import React, { useState } from 'react';

const PaymentForm = ({ total, onSubmit, onBack, isProcessing }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'cardNumber': {
        if (!value.trim()) return 'Le numéro de carte est requis';
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) return 'Le numéro de carte doit contenir 16 chiffres';
        return '';
      }
      
      case 'cardName':
        if (!value.trim()) return 'Le nom sur la carte est requis';
        if (value.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères';
        return '';
      
      case 'expiryDate': {
        if (!value.trim()) return 'La date d\'expiration est requise';
        if (!/^\d{2}\/\d{2}$/.test(value)) return 'Format: MM/YY';
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(month) < 1 || parseInt(month) > 12) return 'Mois invalide';
        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          return 'Carte expirée';
        }
        return '';
      }
      
      case 'cvv':
        if (!value.trim()) return 'Le code CVV est requis';
        if (!/^\d{3,4}$/.test(value)) return 'Le CVV doit contenir 3 ou 4 chiffres';
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });

    if (touched[name]) {
      const fieldError = validateField(name, formattedValue);
      setErrors({
        ...errors,
        [name]: fieldError
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    const fieldError = validateField(name, value);
    setErrors({
      ...errors,
      [name]: fieldError
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'generic';
  };

  const cardType = getCardType(formData.cardNumber);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement</h2>
        <p className="text-gray-600">Sécurisé par cryptage SSL</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement acceptées</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm text-gray-600">Visa</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm text-gray-600">Mastercard</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm text-gray-600">American Express</span>
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de carte *
          </label>
          <div className="relative">
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="19"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 pr-12 ${
                errors.cardNumber && touched.cardNumber 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="1234 5678 9012 3456"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xl">
                {cardType === 'visa' && '💳'}
                {cardType === 'mastercard' && '💳'}
                {cardType === 'amex' && '💳'}
                {cardType === 'generic' && '💳'}
              </span>
            </div>
          </div>
          {errors.cardNumber && touched.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Name */}
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
            Nom sur la carte *
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={formData.cardName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
              errors.cardName && touched.cardName 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
            }`}
            placeholder="JOHN DOE"
          />
          {errors.cardName && touched.cardName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
          )}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration *
            </label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="5"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                errors.expiryDate && touched.expiryDate 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="MM/YY"
            />
            {errors.expiryDate && touched.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              Code de sécurité *
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="4"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                errors.cvv && touched.cvv 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="123"
            />
            {errors.cvv && touched.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="text-xl">🔒</div>
            <div>
              <h4 className="font-medium text-gray-900">Paiement sécurisé</h4>
              <p className="text-sm text-gray-600">
                Vos données sont protégées par un cryptage SSL
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            J'accepte les <a href="#" className="text-blue-600 hover:text-blue-700">conditions générales</a> et la{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">politique de confidentialité</a>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </div>
            ) : (
              `Payer ${total.toFixed(2)} DH`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 