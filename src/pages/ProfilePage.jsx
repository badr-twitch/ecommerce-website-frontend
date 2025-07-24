import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AddPaymentModal from '../components/profile/AddPaymentModal';
import AddAddressModal from '../components/profile/AddAddressModal';
import ProfilePhotoUpload from '../components/profile/ProfilePhotoUpload';
import { paymentService } from '../services/paymentService';
import { shippingService } from '../services/shippingService';
import userService from '../services/userService';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });

  // Profile editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || user.fullName || '',
        email: user.email || '',
        photoURL: user.photoURL || user.profilePhoto || ''
      });
    }
  }, [user]);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Account settings state
  const [accountSettings, setAccountSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    orderUpdates: true,
    newsletter: false
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Shipping addresses state
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loadingShippingAddresses, setLoadingShippingAddresses] = useState(false);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Load payment methods and shipping addresses on component mount
  useEffect(() => {
    if (user) {
      loadPaymentMethods();
      loadShippingAddresses();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentService.getPaymentMethods();
      setPaymentMethods(response.paymentMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Erreur lors du chargement des méthodes de paiement');
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const loadShippingAddresses = async () => {
    try {
      setLoadingShippingAddresses(true);
      const response = await shippingService.getShippingAddresses();
      setShippingAddresses(response.shippingAddresses);
    } catch (error) {
      console.error('Error loading shipping addresses:', error);
      setError('Erreur lors du chargement des adresses de livraison');
    } finally {
      setLoadingShippingAddresses(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      if (result.success) {
        setSuccess('Profil mis à jour avec succès !');
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setSuccess('Mot de passe modifié avec succès !');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      setError('Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setError('Erreur lors de la déconnexion');
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      setError('Mot de passe requis pour supprimer le compte');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const result = await userService.deleteAccount(deletePassword);
      
      if (result.success) {
        // Logout and redirect
        await logout();
        navigate('/');
      } else {
        setError(result.message || 'Erreur lors de la suppression du compte');
      }
    } catch (error) {
      setError('Erreur lors de la suppression du compte: ' + error.message);
      console.error('Error deleting user account:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const handleAddPaymentMethod = async (paymentData) => {
    try {
      await paymentService.addPaymentMethod(paymentData);
      await loadPaymentMethods(); // Reload from database
      setShowAddPayment(false);
      setSuccess('Méthode de paiement ajoutée avec succès !');
    } catch (error) {
      setError('Erreur lors de l\'ajout de la méthode de paiement');
    }
  };

  const handleAddShippingAddress = async (addressData) => {
    try {
      await shippingService.addShippingAddress(addressData);
      await loadShippingAddresses(); // Reload from database
      setShowAddAddress(false);
      setSuccess('Adresse de livraison ajoutée avec succès !');
    } catch (error) {
      setError('Erreur lors de l\'ajout de l\'adresse de livraison');
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?')) {
      try {
        await paymentService.deletePaymentMethod(id);
        await loadPaymentMethods(); // Reload from database
        setSuccess('Méthode de paiement supprimée avec succès !');
      } catch (error) {
        setError('Erreur lors de la suppression de la méthode de paiement');
      }
    }
  };

  const handleDeleteShippingAddress = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette adresse de livraison ?')) {
      try {
        await shippingService.deleteShippingAddress(id);
        await loadShippingAddresses(); // Reload from database
        setSuccess('Adresse de livraison supprimée avec succès !');
      } catch (error) {
        setError('Erreur lors de la suppression de l\'adresse de livraison');
      }
    }
  };

  const handleSetDefaultPayment = async (id) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      await loadPaymentMethods(); // Reload from database
      setSuccess('Méthode de paiement par défaut mise à jour !');
    } catch (error) {
      setError('Erreur lors de la mise à jour de la méthode de paiement par défaut');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await shippingService.setDefaultShippingAddress(id);
      await loadShippingAddresses(); // Reload from database
      setSuccess('Adresse de livraison par défaut mise à jour !');
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'adresse de livraison par défaut');
    }
  };

  const handleEditShippingAddress = (address) => {
    setEditingAddress(address);
    setShowAddAddress(true);
  };

  const handleUpdateShippingAddress = async (addressData) => {
    if (editingAddress) {
      try {
        await shippingService.updateShippingAddress(editingAddress.id, addressData);
        await loadShippingAddresses(); // Reload from database
        setEditingAddress(null);
        setShowAddAddress(false);
        setSuccess('Adresse de livraison mise à jour avec succès !');
      } catch (error) {
        setError('Erreur lors de la mise à jour de l\'adresse de livraison');
      }
    }
  };

  // Profile name editing functions
  const handleEditName = () => {
    setTempDisplayName(profileData.displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (tempDisplayName.trim() === '') {
      setError('Le nom ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        displayName: tempDisplayName.trim()
      });

      if (result.success) {
        setProfileData({ ...profileData, displayName: tempDisplayName.trim() });
        setIsEditingName(false);
        setSuccess('Nom mis à jour avec succès !');
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du nom');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du nom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempDisplayName('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Accès refusé
              </h2>
              <p className="text-gray-600 mb-6">
                Vous devez être connecté pour accéder à cette page.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
          <p className="mt-2 text-gray-600">
            Gérez vos informations personnelles, paiements et adresses de livraison
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sécurité
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paiements
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'addresses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Adresses
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paramètres
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet
                        </label>
                        <div className="flex items-center space-x-2">
                          {isEditingName ? (
                            <>
                              <input
                                type="text"
                                value={tempDisplayName}
                                onChange={(e) => setTempDisplayName(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Entrez votre nom complet"
                              />
                              <button
                                type="button"
                                onClick={handleSaveName}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEditName}
                                disabled={isLoading}
                                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={profileData.displayName}
                                disabled
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
                                placeholder="Aucun nom défini"
                              />
                              <button
                                type="button"
                                onClick={handleEditName}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
                              >
                                ✏️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <ProfilePhotoUpload
                        currentPhotoURL={profileData.photoURL}
                        onPhotoChange={(url) => setProfileData({...profileData, photoURL: url})}
                        isLoading={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                    </button>
                    {isEditingName && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={handleSaveName}
                          disabled={isLoading}
                          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
                        </button>
                        <button
                          onClick={handleCancelEditName}
                          disabled={isLoading}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-xl transition-all duration-300"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Méthodes de paiement</h2>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    + Ajouter une carte
                  </button>
                </div>
                
                <div className="space-y-4">
                  {loadingPaymentMethods ? (
                    <div className="text-center py-8">Chargement des méthodes de paiement...</div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">💳</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune méthode de paiement</h3>
                      <p className="text-gray-600 mb-4">Ajoutez une carte pour des achats plus rapides</p>
                      <button
                        onClick={() => setShowAddPayment(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300"
                      >
                        Ajouter une carte
                      </button>
                    </div>
                  ) : (
                    paymentMethods.map((payment) => (
                      <div key={payment.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">💳</div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {payment.cardholderName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                •••• •••• •••• {payment.last4} - Expire {payment.expiry}
                              </p>
                              {payment.isDefault && (
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                                  Par défaut
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!payment.isDefault && (
                              <button
                                onClick={() => handleSetDefaultPayment(payment.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Définir par défaut
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePaymentMethod(payment.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Adresses de livraison</h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    + Ajouter une adresse
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingShippingAddresses ? (
                    <div className="text-center py-8">Chargement des adresses de livraison...</div>
                  ) : shippingAddresses.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <div className="text-4xl mb-4">🏠</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune adresse de livraison</h3>
                      <p className="text-gray-600 mb-4">Ajoutez une adresse pour des achats plus rapides</p>
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300"
                      >
                        Ajouter une adresse
                      </button>
                    </div>
                  ) : (
                    shippingAddresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">{address.name}</h3>
                              {address.isDefault && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.postalCode} {address.city}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.country}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.phone}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Définir par défaut
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteShippingAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Supprimer
                            </button>
                            <button
                              onClick={() => handleEditShippingAddress(address)}
                              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres du compte</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Notifications par email</h3>
                        <p className="text-sm text-gray-600">Recevoir les notifications importantes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.emailNotifications}
                        onChange={(e) => setAccountSettings({...accountSettings, emailNotifications: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Emails marketing</h3>
                        <p className="text-sm text-gray-600">Recevoir les offres et promotions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.marketingEmails}
                        onChange={(e) => setAccountSettings({...accountSettings, marketingEmails: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Mises à jour de commande</h3>
                        <p className="text-sm text-gray-600">Notifications sur le statut des commandes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.orderUpdates}
                        onChange={(e) => setAccountSettings({...accountSettings, orderUpdates: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Newsletter</h3>
                        <p className="text-sm text-gray-600">Recevoir notre newsletter mensuelle</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={accountSettings.newsletter}
                        onChange={(e) => setAccountSettings({...accountSettings, newsletter: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions du compte</h2>
                  <div className="space-y-4">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                    >
                      <h3 className="font-medium text-gray-900">Se déconnecter</h3>
                      <p className="text-sm text-gray-600">Fermer votre session</p>
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full text-left px-4 py-3 border border-red-300 rounded-xl hover:bg-red-50 transition-colors duration-300"
                    >
                      <h3 className="font-medium text-red-900">Supprimer le compte</h3>
                      <p className="text-sm text-red-600">Cette action est irréversible</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
                      <AddPaymentModal
                  isOpen={showAddPayment}
                  onClose={() => setShowAddPayment(false)}
                  onAdd={handleAddPaymentMethod}
                />
      
      <AddAddressModal
        isOpen={showAddAddress}
        onClose={() => {
          setShowAddAddress(false);
          setEditingAddress(null);
        }}
        onAdd={handleAddShippingAddress}
        editingAddress={editingAddress}
        onUpdate={handleUpdateShippingAddress}
      />

      {/* Delete Account Password Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-4">
              Pour des raisons de sécurité, veuillez entrer votre mot de passe pour confirmer la suppression de votre compte.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setError('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-300"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 