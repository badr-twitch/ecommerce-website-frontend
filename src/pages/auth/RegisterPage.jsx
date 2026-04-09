import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Mail, Lock, User as UserIcon, Building2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    clientType: 'particulier',
    // Business fields (for professionnel)
    companyName: '',
    siret: '',
    vatNumber: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'France'
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const { register, signInWithGoogle, signInWithFacebook } = useContext(AuthContext);
  const navigate = useNavigate();

  // Real-time validation
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) return 'Le prénom ne peut contenir que des lettres';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Le nom de famille est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) return 'Le nom ne peut contenir que des lettres';
        return '';
      
      case 'email':
        if (!value.trim()) return 'L\'adresse email est requise';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'L\'adresse email n\'est pas valide';
        return '';
      
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/(?=.*[a-z])/.test(value)) return 'Le mot de passe doit contenir au moins une lettre minuscule';
        if (!/(?=.*[A-Z])/.test(value)) return 'Le mot de passe doit contenir au moins une lettre majuscule';
        if (!/(?=.*\d)/.test(value)) return 'Le mot de passe doit contenir au moins un chiffre';
        if (!/(?=.*[@$!%*?&])/.test(value)) return 'Le mot de passe doit contenir au moins un caractère spécial';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'La confirmation du mot de passe est requise';
        if (value !== formData.password) return 'Les mots de passe ne correspondent pas';
        return '';
      
      case 'companyName':
        if (formData.clientType === 'professionnel' && !value.trim()) {
          return 'Le nom de l\'entreprise est requis';
        }
        return '';
      
      case 'siret':
        if (formData.clientType === 'professionnel') {
          if (!value.trim()) return 'Le numéro SIRET est requis';
          if (!/^\d{14}$/.test(value.replace(/\s/g, ''))) {
            return 'Le SIRET doit contenir exactement 14 chiffres';
          }
        }
        return '';
      
      case 'vatNumber':
        // Optional field, no validation needed
        return '';
      
      case 'billingAddress':
        if (formData.clientType === 'professionnel' && !value.trim()) {
          return 'L\'adresse de facturation est requise';
        }
        return '';
      
      case 'billingCity':
        if (formData.clientType === 'professionnel' && !value.trim()) {
          return 'La ville de facturation est requise';
        }
        return '';
      
      case 'billingPostalCode':
        if (formData.clientType === 'professionnel' && !value.trim()) {
          return 'Le code postal de facturation est requis';
        }
        if (value && !/^\d{5}$/.test(value.replace(/\s/g, ''))) {
          return 'Le code postal doit contenir 5 chiffres';
        }
        return '';
      
      default:
        return '';
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 8) return 'weak';
    if (password.length < 10) return 'medium';
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Special handling for clientType change
    if (name === 'clientType') {
      setFormData({
        ...formData,
        [name]: newValue,
        // Clear business fields if switching to particulier
        ...(newValue === 'particulier' ? {
          companyName: '',
          siret: '',
          vatNumber: '',
          billingAddress: '',
          billingCity: '',
          billingPostalCode: '',
          billingCountry: 'France'
        } : {})
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue
      });
    }

    // Real-time validation
    if (touched[name]) {
      const fieldError = validateField(name, newValue);
      setErrors({
        ...errors,
        [name]: fieldError
      });
    }

    // Check password strength
    if (name === 'password') {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        clientType: formData.clientType
      };

      // Add business fields if professionnel
      if (formData.clientType === 'professionnel') {
        registerData.companyName = formData.companyName.trim();
        registerData.siret = formData.siret.replace(/\s/g, '');
        registerData.vatNumber = formData.vatNumber.trim() || null;
        registerData.billingAddress = formData.billingAddress.trim();
        registerData.billingCity = formData.billingCity.trim();
        registerData.billingPostalCode = formData.billingPostalCode.replace(/\s/g, '');
        registerData.billingCountry = formData.billingCountry || 'France';
      }

      const result = await register(registerData);

      if (result.success) {
        navigate('/verify-email');
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erreur lors de l\'inscription avec Google');
      }
    } catch (error) {
      setError('Erreur lors de l\'inscription avec Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signInWithFacebook();
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erreur lors de l\'inscription avec Facebook');
      }
    } catch (error) {
      setError('Erreur lors de l\'inscription avec Facebook');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-secondary-700 via-primary-800 to-primary-900">
        <div className="gradient-orb w-[400px] h-[400px] bg-secondary-400/30 top-20 -left-20 animate-float" />
        <div className="gradient-orb w-[300px] h-[300px] bg-primary-400/25 bottom-32 right-10 animate-float-slow" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20">
          <div className="mb-8">
            <img src="/LOGO.png" alt="UMOD" className="h-14 w-auto brightness-0 invert opacity-90" />
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Rejoignez <br />
            <span className="text-secondary-200">la communaute</span>
          </h2>
          <p className="text-primary-200/80 text-lg leading-relaxed max-w-md">
            Creez votre compte pour profiter d'une experience d'achat personnalisee et d'offres exclusives.
          </p>
          <div className="mt-12 space-y-4">
            {[
              { icon: ShieldCheck, text: "Donnees 100% protegees" },
              { icon: UserIcon, text: "Compte personnel ou professionnel" },
              { icon: ArrowRight, text: "Inscription en 2 minutes" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-white/80" />
                </div>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12 bg-white overflow-y-auto">
        <div className="max-w-lg w-full mx-auto">
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/LOGO.png" alt="UMOD" className="h-12 w-auto" />
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Creer votre compte</h1>
            <p className="text-gray-500">
              Deja inscrit ?{' '}
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Client Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                  formData.clientType === 'particulier'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="clientType"
                    value="particulier"
                    checked={formData.clientType === 'particulier'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">👤</span>
                    <span className="text-sm font-semibold text-gray-900">Particulier</span>
                    <span className="text-xs text-gray-500 mt-1">Achat personnel</span>
                  </div>
                </label>
                <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                  formData.clientType === 'professionnel'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="clientType"
                    value="professionnel"
                    checked={formData.clientType === 'professionnel'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">🏢</span>
                    <span className="text-sm font-semibold text-gray-900">Professionnel</span>
                    <span className="text-xs text-gray-500 mt-1">Achat entreprise</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                      errors.firstName && touched.firstName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom de famille
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                      errors.lastName && touched.lastName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                    errors.email && touched.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="votre@email.com"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                    errors.password && touched.password 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Votre mot de passe"
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                        Force du mot de passe: {getPasswordStrengthText(passwordStrength)}
                      </span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      <div className={`h-1 flex-1 rounded-full ${
                        passwordStrength === 'weak' ? 'bg-red-500' : 
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full ${
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`h-1 flex-1 rounded-full ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </div>
                  </div>
                )}
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                    errors.confirmPassword && touched.confirmPassword 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirmez votre mot de passe"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Business Fields (only for professionnel) */}
            {formData.clientType === 'professionnel' && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                  <h3 className="text-sm font-semibold text-primary-900 mb-2 flex items-center">
                    <span className="mr-2">🏢</span>
                    Informations professionnelles
                  </h3>
                  <p className="text-xs text-primary-700">
                    Les champs marqués d'un astérisque (*) sont obligatoires pour les comptes professionnels.
                  </p>
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nom de l'entreprise <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                        errors.companyName && touched.companyName
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Nom de votre entreprise"
                    />
                    {errors.companyName && touched.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                {/* SIRET */}
                <div>
                  <label htmlFor="siret" className="block text-sm font-medium text-gray-700">
                    Numéro SIRET <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="siret"
                      name="siret"
                      type="text"
                      value={formData.siret}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                        handleChange({ ...e, target: { ...e.target, value } });
                      }}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                        errors.siret && touched.siret
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="12345678901234"
                      maxLength={14}
                    />
                    {errors.siret && touched.siret && (
                      <p className="mt-1 text-sm text-red-600">{errors.siret}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">14 chiffres (sans espaces)</p>
                  </div>
                </div>

                {/* VAT Number */}
                <div>
                  <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                    Numéro TVA (optionnel)
                  </label>
                  <div className="mt-1">
                    <input
                      id="vatNumber"
                      name="vatNumber"
                      type="text"
                      value={formData.vatNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300"
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">
                    Adresse de facturation <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <input
                      id="billingAddress"
                      name="billingAddress"
                      type="text"
                      value={formData.billingAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                        errors.billingAddress && touched.billingAddress
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Numéro et nom de rue"
                    />
                    {errors.billingAddress && touched.billingAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.billingAddress}</p>
                    )}
                  </div>
                </div>

                {/* Billing City and Postal Code */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="billingCity"
                        name="billingCity"
                        type="text"
                        value={formData.billingCity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                          errors.billingCity && touched.billingCity
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Ville"
                      />
                      {errors.billingCity && touched.billingCity && (
                        <p className="mt-1 text-sm text-red-600">{errors.billingCity}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700">
                      Code postal <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        id="billingPostalCode"
                        name="billingPostalCode"
                        type="text"
                        value={formData.billingPostalCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                          handleChange({ ...e, target: { ...e.target, value } });
                        }}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 border-2 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300 ${
                          errors.billingPostalCode && touched.billingPostalCode
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="75001"
                        maxLength={5}
                      />
                      {errors.billingPostalCode && touched.billingPostalCode && (
                        <p className="mt-1 text-sm text-red-600">{errors.billingPostalCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Country */}
                <div>
                  <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700">
                    Pays
                  </label>
                  <div className="mt-1">
                    <select
                      id="billingCountry"
                      name="billingCountry"
                      value={formData.billingCountry}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:border-primary-500 focus:outline-none sm:text-sm transition-all duration-300"
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                J'accepte les{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                  conditions d'utilisation
                </Link>
              </label>
            </div>
            {!formData.acceptTerms && touched.acceptTerms && (
              <p className="text-sm text-red-600">Vous devez accepter les conditions d'utilisation</p>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-glow-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Inscription en cours...
                  </>
                ) : (
                  <>
                    Creer mon compte
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Login */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-400">Ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
              </svg>
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 