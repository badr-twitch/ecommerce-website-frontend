import React, { useState } from 'react';
import useModal from '../../hooks/useModal';
import { CANONICAL_COUNTRY, normalizeMoroccanPhone } from '../../utils/morocco';

const AddAddressModal = ({ isOpen, onClose, onAdd, editingAddress, onUpdate }) => {
  useModal(isOpen, onClose);
  const [formData, setFormData] = useState({
    name: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: CANONICAL_COUNTRY,
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingAddress) {
      setFormData({
        name: editingAddress.name || '',
        firstName: editingAddress.firstName || '',
        lastName: editingAddress.lastName || '',
        address: editingAddress.address || '',
        city: editingAddress.city || '',
        postalCode: editingAddress.postalCode || '',
        country: CANONICAL_COUNTRY,
        phone: editingAddress.phone || ''
      });
    } else {
      setFormData({
        name: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: CANONICAL_COUNTRY,
        phone: ''
      });
    }
    setErrors({});
    setTouched({});
  }, [editingAddress]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom de l\'adresse est requis';
        return '';
      
      case 'firstName':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Le nom de famille est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';
      
      case 'address':
        if (!value.trim()) return 'L\'adresse est requise';
        if (value.trim().length < 10) return 'L\'adresse doit contenir au moins 10 caractères';
        return '';
      
      case 'city':
        if (!value.trim()) return 'La ville est requise';
        return '';
      
      case 'postalCode':
        if (!value.trim()) return 'Le code postal est requis';
        if (!/^[0-9]{5}$/.test(value.trim())) return 'Le code postal doit contenir 5 chiffres';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Le numéro de téléphone est requis';
        if (!normalizeMoroccanPhone(value).valid) {
          return 'Numéro marocain invalide (ex. 06 12 34 56 78 ou +212 6 12 34 56 78)';
        }
        return '';
      
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (touched[name]) {
      const fieldError = validateField(name, value);
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

    ['name', 'firstName', 'lastName', 'address', 'city', 'postalCode', 'phone'].forEach(field => {
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
      // Normalise the phone to +212… on save. Country is already pinned to the
      // canonical Moroccan value; the backend enforces both again.
      const phoneResult = normalizeMoroccanPhone(formData.phone);
      const payload = {
        ...formData,
        country: CANONICAL_COUNTRY,
        phone: phoneResult.valid ? phoneResult.normalized : formData.phone,
      };
      if (editingAddress) {
        onUpdate(payload);
      } else {
        onAdd(payload);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: CANONICAL_COUNTRY,
      phone: ''
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in" role="dialog" aria-modal="true">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingAddress ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Fermer"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'adresse *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.name && touched.name ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Domicile, Bureau, etc."
              />
              {errors.name && touched.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.firstName && touched.firstName ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Prénom"
                />
                {errors.firstName && touched.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de famille *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.lastName && touched.lastName ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Nom"
                />
                {errors.lastName && touched.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone — Moroccan numbers only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone (Maroc) *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input ${errors.phone && touched.phone ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="06 12 34 56 78 ou +212 6 12 34 56 78"
                autoComplete="tel-national"
                inputMode="tel"
              />
              {errors.phone && touched.phone ? (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Numéro marocain uniquement — mobile (06/07) ou fixe (05).
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input resize-none ${errors.address && touched.address ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Numéro, rue, appartement..."
              />
              {errors.address && touched.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.city && touched.city ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Casablanca"
                />
                {errors.city && touched.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input ${errors.postalCode && touched.postalCode ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="20000"
                  inputMode="numeric"
                />
                {errors.postalCode && touched.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>
            </div>

            {/* Country — locked to Morocco (our only delivery zone) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <input
                type="text"
                name="country"
                value={CANONICAL_COUNTRY}
                readOnly
                aria-readonly="true"
                className="input bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Livraison disponible uniquement au Maroc.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-outline flex-1"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                {editingAddress ? 'Modifier l\'adresse' : 'Ajouter l\'adresse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAddressModal; 