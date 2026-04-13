import React, { useState } from 'react';
import { MapPin, User, Mail, Phone, Building2, Truck } from 'lucide-react';
import { CANONICAL_COUNTRY, normalizeMoroccanPhone } from '../../utils/morocco';

const ShippingForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    country: CANONICAL_COUNTRY,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        return '';

      case 'lastName':
        if (!value.trim()) return 'Le nom de famille est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';

      case 'email':
        if (!value.trim()) return 'L\'adresse email est requise';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'L\'adresse email n\'est pas valide';
        return '';

      case 'phone':
        if (!value.trim()) return 'Le numéro de téléphone est requis';
        if (!normalizeMoroccanPhone(value).valid) {
          return 'Numéro marocain invalide (ex. 06 12 34 56 78 ou +212 6 12 34 56 78)';
        }
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

    ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'].forEach(field => {
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
      // Normalise the phone to +212… and pin country to the canonical value.
      // Backend enforces both again on order creation.
      const phoneResult = normalizeMoroccanPhone(formData.phone);
      onSubmit({
        ...formData,
        country: CANONICAL_COUNTRY,
        phone: phoneResult.valid ? phoneResult.normalized : formData.phone,
      });
    }
  };

  const inputClass = (fieldName) =>
    `input ${errors[fieldName] && touched[fieldName] ? 'border-red-300 focus:border-red-500' : ''}`;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200/50 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Informations de livraison</h2>
            <p className="text-gray-500 text-sm">Veuillez fournir vos informations de livraison</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('firstName')}
              placeholder="Votre prénom"
            />
            {errors.firstName && touched.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de famille *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('lastName')}
              placeholder="Votre nom"
            />
            {errors.lastName && touched.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('email')}
              placeholder="votre@email.com"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone (Maroc) *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('phone')}
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
        </div>

        {/* Company (Optional) */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            Entreprise (optionnel)
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input"
            placeholder="Nom de votre entreprise"
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Adresse de livraison *
          </label>
          <textarea
            id="address"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Ville *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('city')}
              placeholder="Casablanca"
            />
            {errors.city && touched.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
              Code postal *
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass('postalCode')}
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
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Pays
          </label>
          <input
            type="text"
            id="country"
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

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes de livraison (optionnel)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="input resize-none"
            placeholder="Instructions spéciales pour la livraison..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="btn-primary w-full cursor-pointer"
          >
            Continuer vers l'expédition
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;
