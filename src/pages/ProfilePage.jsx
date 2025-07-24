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
      setError('Erreur lors de la mise à jour du profil: ' + error.message);
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
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setSuccess('Mot de passe modifié avec succès !');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error || 'Erreur lors de la modification du mot de passe');
      }
    } catch (error) {
      setError('Erreur lors de la modification du mot de passe: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setError('Erreur lors de la déconnexion: ' + error.message);
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
    try {
      setIsLoading(true);
      const result = await updateProfile({
        displayName: tempDisplayName
      });

      if (result.success) {
        setProfileData(prev => ({ ...prev, displayName: tempDisplayName }));
        setIsEditingName(false);
        setSuccess('Nom mis à jour avec succès !');
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du nom');
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du nom: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempDisplayName(profileData.displayName);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à votre profil.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Mon Profil</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et paramètres</p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sécurité
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paiement
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shipping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Livraison
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paramètres
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error and Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <ProfilePhotoUpload
                    currentPhotoURL={profileData.photoURL}
                    onPhotoUpdate={(newPhotoURL) => {
                      setProfileData(prev => ({ ...prev, photoURL: newPhotoURL }));
                    }}
                  />
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                    
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom d'affichage
                        </label>
                        {isEditingName ? (
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              id="displayName"
                              value={tempDisplayName}
                              onChange={(e) => setTempDisplayName(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={handleSaveName}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                              Sauvegarder
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditName}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">
                              {profileData.displayName || 'Non défini'}
                            </span>
                            <button
                              type="button"
                              onClick={handleEditName}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Modifier
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Mise à jour...' : 'Mettre à jour le profil'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                      minLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                      minLength="6"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </form>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Méthodes de paiement</h2>
                  <button
                    onClick={() => setShowAddPayment(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter une méthode
                  </button>
                </div>

                {loadingPaymentMethods ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Chargement des méthodes de paiement...</p>
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aucune méthode de paiement enregistrée</p>
                    <button
                      onClick={() => setShowAddPayment(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter votre première méthode
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {method.cardType || 'CARTE'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              •••• •••• •••• {method.last4}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expire {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Par défaut
                            </span>
                          )}
                          {!method.isDefault && (
                            <button
                              onClick={() => handleSetDefaultPayment(method.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Définir par défaut
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Adresses de livraison</h2>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ajouter une adresse
                  </button>
                </div>

                {loadingShippingAddresses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Chargement des adresses...</p>
                  </div>
                ) : shippingAddresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Aucune adresse de livraison enregistrée</p>
                    <button
                      onClick={() => setShowAddAddress(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Ajouter votre première adresse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shippingAddresses.map((address) => (
                      <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {address.firstName} {address.lastName}
                              </h3>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Par défaut
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">
                              {address.streetAddress}
                            </p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.postalCode}
                            </p>
                            <p className="text-gray-600">
                              {address.country}
                            </p>
                            {address.phone && (
                              <p className="text-gray-600">
                                Tél: {address.phone}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Définir par défaut
                              </button>
                            )}
                            <button
                              onClick={() => handleEditShippingAddress(address)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteShippingAddress(address.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Paramètres du compte</h2>
                
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
              Pour des raisons de sécurité, veuillez entrer votre mot de passe pour commencer le processus de suppression.
            </p>
            
            <input
              type="password"
              name="delete-account-password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
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