import React, { useState } from 'react';

const AddPaymentModal = ({ isOpen, onClose, onAdd }) => {
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
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      const paymentData = {
        type: 'visa', // You could detect this based on card number
        last4: cardNumber.slice(-4),
        expiry: formData.expiryDate,
        cardholderName: formData.cardName
      };
      onAdd(paymentData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ajouter une carte</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de carte *
              </label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength="19"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  errors.cardNumber && touched.cardNumber 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && touched.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            {/* Card Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom sur la carte *
              </label>
              <input
                type="text"
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="text"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de sécurité *
                </label>
                <input
                  type="text"
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

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Ajouter la carte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal; 