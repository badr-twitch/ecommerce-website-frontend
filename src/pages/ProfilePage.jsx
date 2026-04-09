import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { auth } from '../config/firebase';
import AddPaymentModal from '../components/profile/AddPaymentModal';
import AddAddressModal from '../components/profile/AddAddressModal';
import ProfilePhotoUpload from '../components/profile/ProfilePhotoUpload';
import { OrderSummary } from '../components/orders';
import { paymentService } from '../services/paymentService';
import { shippingService } from '../services/shippingService';
import userService from '../services/userService';
import { useOrders } from '../hooks/useOrders';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Package } from 'lucide-react';
import api, { membershipAPI } from '../services/api';
import MembershipManageModal from '../components/membership/MembershipManageModal';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Orders hook
  const { orders: userOrders, loading: ordersLoading } = useOrders();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    phone: '',
    clientType: 'particulier',
    // Business fields
    companyName: '',
    siret: '',
    vatNumber: '',
    billingAddress: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'France'
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
        photoURL: user.photoURL || user.profilePhoto || '',
        phone: user.phone || '',
        clientType: user.clientType || 'particulier',
        companyName: user.companyName || '',
        siret: user.siret || '',
        vatNumber: user.vatNumber || '',
        billingAddress: user.billingAddress || '',
        billingCity: user.billingCity || '',
        billingPostalCode: user.billingPostalCode || '',
        billingCountry: user.billingCountry || 'France'
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
  const [savingSettings, setSavingSettings] = useState(false);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Shipping addresses state
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [loadingShippingAddresses, setLoadingShippingAddresses] = useState(false);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
const [membershipModalOpen, setMembershipModalOpen] = useState(false);
const [membershipData, setMembershipData] = useState(null);
const [membershipPlanData, setMembershipPlanData] = useState(null);
const [membershipLoading, setMembershipLoading] = useState(false);
const [membershipActionLoading, setMembershipActionLoading] = useState(false);
const [membershipError, setMembershipError] = useState('');
  useEffect(() => {
    console.log('🔁 ProfilePage - membershipModalOpen changed:', membershipModalOpen);
  }, [membershipModalOpen]);

const currentMembership = membershipData || {
  membershipStatus: user?.membershipStatus || 'none',
  membershipPlan: user?.membershipPlan || 'umod-prime',
  membershipPrice: user?.membershipPrice ?? null,
  membershipCurrency: user?.membershipCurrency || 'MAD',
  membershipActivatedAt: user?.membershipActivatedAt || null,
  membershipExpiresAt: user?.membershipExpiresAt || null,
  membershipAutoRenew: user?.membershipAutoRenew ?? true,
};

const membershipStatus = currentMembership.membershipStatus || 'none';
const membershipActivatedAt = currentMembership.membershipActivatedAt ? new Date(currentMembership.membershipActivatedAt) : null;
const membershipExpiresAt = currentMembership.membershipExpiresAt ? new Date(currentMembership.membershipExpiresAt) : null;
const membershipPrice =
  currentMembership.membershipPrice !== undefined && currentMembership.membershipPrice !== null
    ? currentMembership.membershipPrice
    : membershipPlanData?.price ?? null;
const membershipCurrency = currentMembership.membershipCurrency || membershipPlanData?.currency || 'MAD';
const membershipPlanName =
  currentMembership.membershipPlan === 'umod-prime'
    ? 'UMOD Prime'
    : currentMembership.membershipPlan || 'UMOD Prime';
const membershipPriceDisplay =
  membershipPrice !== undefined && membershipPrice !== null
    ? new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: membershipCurrency,
      }).format(Number(membershipPrice))
    : null;
const membershipStatusLabelMap = {
  active: 'Actif',
  cancelled: 'Renouvellement arrêté',
  expired: 'Expiré',
  pending: 'En attente',
  none: 'Inactif',
};
const membershipBadgeClasses = {
  active: 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/30',
  cancelled: 'bg-amber-400/10 text-amber-200 border border-amber-300/30',
  expired: 'bg-rose-500/10 text-rose-100 border border-rose-400/40',
  pending: 'bg-blue-500/10 text-blue-100 border border-blue-400/30',
  none: 'bg-white/10 text-white/60 border border-white/10',
};
const membershipStatusLabel = membershipStatusLabelMap[membershipStatus] || membershipStatusLabelMap.none;
const membershipBadgeClass = membershipBadgeClasses[membershipStatus] || membershipBadgeClasses.none;

  const formatMembershipDate = (date) => {
    if (!date) return 'Non défini';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Non défini';
    }
  };

  const fallbackMembershipPerks = [
    {
      title: 'Livraison express illimitée',
      description: 'Expédition prioritaire partout au Maroc sans minimum d’achat.',
    },
    {
      title: 'Conciergerie shopping 7j/7',
      description: 'Un expert UMOD vous accompagne sur WhatsApp et téléphone.',
    },
    {
      title: 'Offres et ventes privées',
      description: 'Accès anticipé aux drops, remises supplémentaires et cadeaux exclusifs.',
    },
    {
      title: 'Retours simplifiés',
      description: 'Échanges gratuits pendant 60 jours avec prise en charge à domicile.',
    },
  ];

  const displayedMembershipPerks =
    membershipPlanData?.perks && membershipPlanData.perks.length > 0
      ? membershipPlanData.perks
      : fallbackMembershipPerks;

  const loadMembershipPlan = useCallback(async () => {
    console.log('🔍 ProfilePage - Loading membership plan');
    try {
      const response = await membershipAPI.getPlan();
      if (response.data?.success) {
        console.log('✅ ProfilePage - Membership plan loaded');
        setMembershipPlanData(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error loading membership plan:', error);
    }
  }, []);

  const loadMembershipData = useCallback(
    async (showToast = false) => {
      if (!user) {
        setMembershipData(null);
        return;
      }

      try {
        setMembershipLoading(true);
        console.log('🔍 ProfilePage - Loading membership status');
        setMembershipError('');
        const response = await membershipAPI.getStatus();

        if (response.data?.success) {
          setMembershipData(response.data.data);
        } else {
          setMembershipData({
            membershipStatus: 'none',
            membershipPlan: 'umod-prime',
            membershipAutoRenew: true,
          });
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('⚠️ ProfilePage - Membership status 404');
          setMembershipData({
            membershipStatus: 'none',
            membershipPlan: 'umod-prime',
            membershipAutoRenew: true,
          });
        } else {
          console.error('❌ Error loading membership status:', error);
          const message = error.response?.data?.error || 'Impossible de charger votre abonnement';
          setMembershipError(message);
          if (showToast) {
            toast.error(message);
          }
        }
      } finally {
        setMembershipLoading(false);
      }
    },
    [user]
  );

  const handleMembershipRefresh = useCallback(() => loadMembershipData(true), [loadMembershipData]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentService.getPaymentMethods();
      const methods = response.paymentMethods || [];
      setPaymentMethods(methods);
      return methods;
    } catch (error) {
      console.error('❌ ProfilePage - Error loading payment methods:', error);
      toast.error('Erreur lors du chargement des méthodes de paiement');
      return [];
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  const handleMembershipModalOpen = useCallback(async () => {
    if (!user) {
      toast.error('Connectez-vous pour gérer votre abonnement');
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    console.log('🔍 ProfilePage - Opening membership modal (before set state)');
    setMembershipModalOpen(true);
    console.log('🔍 ProfilePage - membershipModalOpen state should be true (right after set)');
    setTimeout(() => {
      console.log('⏳ ProfilePage - membershipModalOpen state (deferred):', true);
    }, 0);
    setMembershipError('');

    try {
      await loadMembershipData(true);
    } catch (error) {
      // loadMembershipData already gère les erreurs et les toasts
    }
  }, [user, navigate, loadMembershipData]);

  const handleMembershipModalClose = useCallback(() => {
    if (!membershipActionLoading) {
      setMembershipModalOpen(false);
    }
  }, [membershipActionLoading]);

  const handleMembershipCancel = useCallback(async () => {
    try {
      setMembershipActionLoading(true);
      console.log('🔄 ProfilePage - Cancelling membership auto-renew');
      const response = await membershipAPI.cancel();
      if (response.data?.success) {
        console.log('✅ ProfilePage - Membership auto-renew cancelled');
        toast.success(response.data.message || 'Renouvellement automatique suspendu.');
        await loadMembershipData();
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
      } else {
        console.warn('⚠️ ProfilePage - Membership cancel failed', response.data);
        toast.error(response.data?.error || 'Impossible de suspendre le renouvellement.');
      }
    } catch (error) {
      console.error('❌ ProfilePage - Error cancelling membership:', error);
      toast.error(error.response?.data?.error || 'Impossible de suspendre le renouvellement.');
    } finally {
      setMembershipActionLoading(false);
    }
  }, [loadMembershipData, refreshUser]);

  const handleMembershipSubscribe = useCallback(async () => {
    try {
      setMembershipActionLoading(true);
      console.log('🔄 ProfilePage - Preparing membership subscription with payment');

      let methods = paymentMethods.filter((method) => method?.isActive !== false);

      if (!methods.length) {
        const fetched = await loadPaymentMethods();
        methods = (fetched || []).filter((method) => method?.isActive !== false);
      }

      if (!methods.length) {
        toast.error('Ajoutez une méthode de paiement pour activer UMOD Prime');
        setActiveTab('payment');
        setShowAddPayment(true);
        setMembershipActionLoading(false);
        return;
      }

      const defaultMethod = methods.find((method) => method.isDefault) || methods[0];

      console.log('🔄 ProfilePage - Subscribing to membership with payment method:', defaultMethod.id);
      const response = await membershipAPI.subscribe({
        paymentMethodId: defaultMethod.id,
        autoRenew: true,
      });

      if (response.data?.success) {
        console.log('✅ ProfilePage - Membership subscription activated');
        toast.success(
          response.data.message ||
            `UMOD Prime activé ! Carte terminant par ${defaultMethod.last4} débitée avec succès.`,
        );
        await loadMembershipData();
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
      } else {
        console.warn('⚠️ ProfilePage - Membership subscription failed', response.data);
        toast.error(response.data?.error || 'Impossible d’activer l’abonnement.');
      }
    } catch (error) {
      console.error('❌ ProfilePage - Error subscribing membership:', error);
      toast.error(error.response?.data?.error || 'Impossible d’activer l’abonnement.');
    } finally {
      setMembershipActionLoading(false);
    }
  }, [paymentMethods, loadPaymentMethods, loadMembershipData, refreshUser]);

  useEffect(() => {
    loadMembershipPlan();
  }, [loadMembershipPlan]);

  useEffect(() => {
    loadMembershipData();
  }, [loadMembershipData]);

  useEffect(() => {
    if (location.state?.openMembershipModal || location.state?.openPaymentTab) {
      if (location.state?.openMembershipModal) {
        console.log('🔍 ProfilePage - location state requests membership modal');
        handleMembershipModalOpen();
      }

      if (location.state?.openPaymentTab) {
        console.log('🔍 ProfilePage - location state requests payment tab');
        setActiveTab('payment');
        loadPaymentMethods();

        if (location.state.openPaymentTab === 'add') {
          setShowAddPayment(true);
        }
      }

      const { openMembershipModal, openPaymentTab, ...restState } = location.state;
      navigate(location.pathname, { replace: true, state: restState });
    }
  }, [location.state, location.pathname, handleMembershipModalOpen, navigate, loadPaymentMethods]);

  // Phone verification states
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isSettingNewPhone, setIsSettingNewPhone] = useState(false);
  const [currentPhoneVerified, setCurrentPhoneVerified] = useState(false);
  const [newPhoneOtpSent, setNewPhoneOtpSent] = useState(false);
  const [newPhoneVerificationCode, setNewPhoneVerificationCode] = useState('');

  // Load payment methods and shipping addresses on component mount
  useEffect(() => {
    if (user) {
      console.log('🔍 ProfilePage - user detected, triggering initial payment methods load');
      loadPaymentMethods();
      loadShippingAddresses();
    }
  }, [user, loadPaymentMethods]);

  // Initialize notification settings from user data
  useEffect(() => {
    if (user?.notificationSettings) {
      setAccountSettings({
        emailNotifications: user.notificationSettings.emailNotifications ?? true,
        marketingEmails: user.notificationSettings.marketingEmails ?? false,
        orderUpdates: user.notificationSettings.orderUpdates ?? true,
        newsletter: user.notificationSettings.newsletter ?? false
      });
    }
  }, [user]);

  const loadShippingAddresses = async () => {
    try {
      setLoadingShippingAddresses(true);
      const response = await shippingService.getShippingAddresses();
      setShippingAddresses(response.shippingAddresses);
    } catch (error) {
      console.error('Error loading shipping addresses:', error);
      toast.error('Erreur lors du chargement des adresses de livraison');
    } finally {
      setLoadingShippingAddresses(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Check if user is trying to add a phone number for the first time
    if (profileData.phone && !user?.phone) {
      // First-time phone addition requires SMS verification
      setIsLoading(false);
      setNewPhoneNumber(profileData.phone);
      setShowPhoneVerification(true);
      toast.info('Vérification SMS requise pour ajouter un numéro de téléphone');
      return;
    }

    // Validate phone number if provided
    if (profileData.phone && profileData.phone.length < 10) {
      toast.error('Le numéro de téléphone doit contenir au moins 10 chiffres');
      setIsLoading(false);
      return;
    }

    try {
      // Remove phone from update data - phone changes require SMS verification
      const updateData = {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        clientType: profileData.clientType
      };

      // Add business fields if professionnel
      if (profileData.clientType === 'professionnel') {
        // Validate required business fields
        if (!profileData.companyName || !profileData.companyName.trim()) {
          toast.error('Le nom de l\'entreprise est requis pour les clients professionnels');
          setIsLoading(false);
          return;
        }
        if (!profileData.siret || profileData.siret.length !== 14) {
          toast.error('Le numéro SIRET est requis et doit contenir 14 chiffres');
          setIsLoading(false);
          return;
        }

        updateData.companyName = profileData.companyName.trim();
        updateData.siret = profileData.siret.replace(/\s/g, '');
        updateData.vatNumber = profileData.vatNumber?.trim() || null;
        updateData.billingAddress = profileData.billingAddress?.trim() || null;
        updateData.billingCity = profileData.billingCity?.trim() || null;
        updateData.billingPostalCode = profileData.billingPostalCode?.replace(/\s/g, '') || null;
        updateData.billingCountry = profileData.billingCountry || 'France';
      } else {
        // Clear business fields if switching to particulier
        updateData.companyName = null;
        updateData.siret = null;
        updateData.vatNumber = null;
        updateData.billingAddress = null;
        updateData.billingCity = null;
        updateData.billingPostalCode = null;
        updateData.billingCountry = 'France';
      }

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('Profil mis à jour avec succès !');
        if (result.user) {
          // Update local user state if returned
          if (typeof refreshUser === 'function') {
            await refreshUser();
          }
        }
      } else {
        // If error mentions SMS verification, show phone verification modal
        if (result.error && result.error.includes('SMS')) {
          if (profileData.phone) {
            setNewPhoneNumber(profileData.phone);
            setShowPhoneVerification(true);
          }
        }
        toast.error(result.error || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        toast.success('Mot de passe modifié avec succès !');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Erreur lors de la modification du mot de passe');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    try {
      setSavingSettings(true);
      await api.put('/auth/notification-preferences', accountSettings);
      toast.success('Préférences de notification sauvegardées');
      await refreshUser();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des préférences');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) {
      toast.error('Mot de passe requis pour supprimer le compte');
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await userService.deleteAccount(deletePassword);
      
      if (result.success) {
        // Logout and redirect
        await logout();
        navigate('/');
      } else {
        toast.error(result.message || 'Erreur lors de la suppression du compte');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du compte: ' + error.message);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      await loadPaymentMethods(); // Reload from Stripe
      setShowAddPayment(false);
      toast.success('Méthode de paiement ajoutée avec succès !');
    } catch (error) {
      toast.error('Erreur lors du chargement des méthodes de paiement');
    }
  };

  const handleAddShippingAddress = async (addressData) => {
    try {
      await shippingService.addShippingAddress(addressData);
      await loadShippingAddresses(); // Reload from database
      setShowAddAddress(false);
      toast.success('Adresse de livraison ajoutée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'adresse de livraison');
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-gray-800">Confirmer la suppression</div>
          <div className="text-gray-600">Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
      });
    });

    if (confirmed) {
      try {
        await paymentService.deletePaymentMethod(id);
        await loadPaymentMethods(); // Reload from database
        toast.success('Méthode de paiement supprimée avec succès !');
      } catch (error) {
        toast.error('Erreur lors de la suppression de la méthode de paiement');
      }
    }
  };

  const handleDeleteShippingAddress = async (id) => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div className="font-semibold text-gray-800">Confirmer la suppression</div>
          <div className="text-gray-600">Êtes-vous sûr de vouloir supprimer cette adresse de livraison ?</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
      });
    });

    if (confirmed) {
      try {
        await shippingService.deleteShippingAddress(id);
        await loadShippingAddresses(); // Reload from database
        toast.success('Adresse de livraison supprimée avec succès !');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'adresse de livraison');
      }
    }
  };

  const handleSetDefaultPayment = async (id) => {
    try {
      await paymentService.setDefaultPaymentMethod(id);
      await loadPaymentMethods(); // Reload from database
      toast.success('Méthode de paiement par défaut mise à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la méthode de paiement par défaut');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await shippingService.setDefaultShippingAddress(id);
      await loadShippingAddresses(); // Reload from database
      toast.success('Adresse de livraison par défaut mise à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'adresse de livraison par défaut');
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
        toast.success('Adresse de livraison mise à jour avec succès !');
      } catch (error) {
        toast.error('Erreur lors de la mise à jour de l\'adresse de livraison');
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
        toast.success('Nom mis à jour avec succès !');
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour du nom');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du nom: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setTempDisplayName(profileData.displayName);
  };

  // Phone verification functions
  const handleSendPhoneVerification = async () => {
    try {
      setIsSendingVerification(true);

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-phone-verification`;
      const token = localStorage.getItem('token');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('SMS de vérification envoyé ! Vérifiez votre téléphone.');
        setShowPhoneVerification(true);
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du SMS de vérification');
      }
    } catch (error) {
      console.error('❌ Error sending phone verification:', error);
      toast.error('Erreur lors de l\'envoi du SMS de vérification');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyCurrentPhone = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Veuillez entrer un code de vérification valide (6 chiffres)');
      return;
    }

    try {
      setIsVerifyingCode(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-current-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationCode })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Numéro de téléphone actuel vérifié avec succès !');
        setCurrentPhoneVerified(true);
        setVerificationCode('');
      } else {
        toast.error(result.error || 'Erreur lors de la vérification du code');
      }
    } catch (error) {
      console.error('❌ Error verifying current phone:', error);
      toast.error('Erreur lors de la vérification du code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Send SMS verification for NEW phone number (first-time addition)
  const handleSendNewPhoneVerification = async () => {
    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      setIsSendingVerification(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-new-phone-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPhoneNumber })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('SMS de vérification envoyé ! Vérifiez votre téléphone.');
        // Don't close modal - user needs to enter code
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du SMS de vérification');
      }
    } catch (error) {
      console.error('Error sending new phone verification:', error);
      toast.error('Erreur lors de l\'envoi du SMS de vérification');
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Verify NEW phone number with code (first-time addition)
  const handleVerifyNewPhone = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Veuillez entrer un code de vérification valide (6 chiffres)');
      return;
    }

    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    try {
      setIsVerifyingCode(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-new-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationCode, newPhoneNumber })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Numéro de téléphone vérifié et enregistré avec succès !');
        setShowPhoneVerification(false);
        setVerificationCode('');
        setNewPhoneNumber('');
        
        // Refresh user data
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
        
        // Update profile data
        setProfileData(prev => ({ ...prev, phone: result.phone }));
      } else {
        toast.error(result.error || 'Code de vérification invalide');
      }
    } catch (error) {
      console.error('❌ Error verifying new phone:', error);
      toast.error('Erreur lors de la vérification du numéro de téléphone');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleSetNewPhone = async () => {
    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      toast.error('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      setIsSettingNewPhone(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/set-new-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPhoneNumber })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Code de vérification envoyé au nouveau numéro');
        setNewPhoneOtpSent(true);
        setNewPhoneVerificationCode('');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du code de vérification');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du code de vérification');
    } finally {
      setIsSettingNewPhone(false);
    }
  };

  const handleVerifyNewPhoneOtp = async () => {
    if (!newPhoneVerificationCode || newPhoneVerificationCode.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres');
      return;
    }

    try {
      setIsVerifyingCode(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-new-phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verificationCode: newPhoneVerificationCode,
          newPhoneNumber
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Numéro de téléphone mis à jour avec succès !');
        setProfileData({ ...profileData, phone: result.phone });
        setShowPhoneVerification(false);
        setNewPhoneNumber('');
        setCurrentPhoneVerified(false);
        setNewPhoneOtpSent(false);
        setNewPhoneVerificationCode('');

        if (auth.currentUser) {
          try {
            await auth.currentUser.getIdToken(true);
          } catch (error) {
            // Token refresh failed, non-critical
          }
        }

        await refreshUser();
      } else {
        toast.error(result.error || 'Code de vérification invalide');
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleRemovePhone = async () => {
    // First, send verification code for current phone
    try {
      setIsSendingVerification(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-phone-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Email de vérification envoyé ! Vérifiez votre boîte mail.');
        setShowPhoneVerification(true);
        // Set a flag to indicate this is for removal
        setNewPhoneNumber('REMOVE');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du SMS de vérification');
      }
    } catch (error) {
      console.error('❌ Error sending phone verification for removal:', error);
              toast.error('Erreur lors de l\'envoi du SMS de vérification');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleConfirmRemovePhone = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/remove-phone`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Numéro de téléphone supprimé avec succès !');
        setProfileData({ ...profileData, phone: '' });
        setShowPhoneVerification(false);
        setCurrentPhoneVerified(false);
        setNewPhoneNumber('');
        
        // Force refresh Firebase token to get updated custom claims
        if (auth.currentUser) {
          try {
            await auth.currentUser.getIdToken(true);
          } catch (error) {
            console.error('❌ Error refreshing Firebase token:', error);
          }
        }
        
        // Refresh user data
        window.location.reload();
      } else {
        toast.error(result.error || 'Erreur lors de la suppression du numéro de téléphone');
      }
    } catch (error) {
      console.error('❌ Error removing phone:', error);
      toast.error('Erreur lors de la suppression du numéro de téléphone');
    }
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
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mes Commandes
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
                    onPhotoChange={(newPhotoURL) => {
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

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Numéro de téléphone
                          {user?.phone && (
                            <span className="ml-2 text-xs text-green-600">✓ Configuré</span>
                          )}
                        </label>
                        
                        {user?.phone ? (
                          // Show current phone number with change/remove options (only if saved in database)
                          <div className="space-y-3">
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">
                              {user.phone}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleSendPhoneVerification}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                              >
                                Changer
                              </button>
                              <button
                                type="button"
                                onClick={handleRemovePhone}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              >
                                Supprimer
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">
                              La modification et suppression nécessitent une vérification de votre numéro actuel par SMS
                            </p>
                          </div>
                        ) : (
                          // Show phone input for first time setup
                          <div className="space-y-3">
                            <PhoneInput
                              international
                              defaultCountry="FR"
                              value={profileData.phone}
                              onChange={(value) => setProfileData({...profileData, phone: value || ''})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Entrez votre numéro de téléphone"
                            />
                            <p className="text-xs text-gray-500">
                              Format international recommandé (ex: +33 6 12 34 56 78)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Phone Verification Modal */}
                      {showPhoneVerification && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              {!user?.phone 
                                ? 'Ajouter un numéro de téléphone'
                                : newPhoneNumber === 'REMOVE' 
                                  ? 'Supprimer le numéro de téléphone' 
                                  : 'Modifier le numéro de téléphone'}
                            </h3>
                            
                            {!user?.phone ? (
                              // First-time phone addition flow
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-sm text-blue-800">
                                    <strong>Vérification SMS requise</strong>
                                  </p>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Un code de vérification sera envoyé au numéro que vous entrez pour confirmer que vous êtes bien le propriétaire
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Numéro de téléphone
                                  </label>
                                  <PhoneInput
                                    international
                                    defaultCountry="FR"
                                    value={newPhoneNumber}
                                    onChange={(value) => setNewPhoneNumber(value || '')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="+33 6 12 34 56 78"
                                  />
                                </div>
                                
                                {verificationCode ? (
                                  // Step 2: Enter verification code
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Code de vérification (6 chiffres)
                                    </label>
                                    <input
                                      type="text"
                                      value={verificationCode}
                                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                                      placeholder="000000"
                                      maxLength={6}
                                    />
                                    <div className="flex gap-2 mt-4">
                                      <button
                                        type="button"
                                        onClick={handleVerifyNewPhone}
                                        disabled={isVerifyingCode || verificationCode.length !== 6}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                      >
                                        {isVerifyingCode ? 'Vérification...' : 'Vérifier'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowPhoneVerification(false);
                                          setVerificationCode('');
                                          setNewPhoneNumber('');
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Step 1: Send verification SMS
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={handleSendNewPhoneVerification}
                                      disabled={isSendingVerification || !newPhoneNumber || newPhoneNumber.length < 10}
                                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {isSendingVerification ? 'Envoi...' : 'Envoyer le code SMS'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowPhoneVerification(false);
                                        setNewPhoneNumber('');
                                      }}
                                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : !currentPhoneVerified ? (
                              // Step 1: Verify current phone number (for change/remove)
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-sm text-blue-800">
                                    <strong>Étape 1 :</strong> Vérification de votre numéro de téléphone actuel
                                  </p>
                                  <p className="text-sm text-blue-700 mt-1">
                                    Un code de vérification a été envoyé par SMS à votre numéro <strong>{profileData.phone}</strong> pour confirmer que vous êtes bien le propriétaire
                                  </p>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code de vérification (6 chiffres)
                                  </label>
                                  <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Code envoyé par SMS
                                  </p>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={handleVerifyCurrentPhone}
                                    disabled={isVerifyingCode || verificationCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {isVerifyingCode ? 'Vérification...' : 'Vérifier le numéro actuel'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowPhoneVerification(false);
                                      setVerificationCode('');
                                      setNewPhoneNumber('');
                                      setCurrentPhoneVerified(false);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Step 2: After verification, show options
                              <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <p className="text-sm text-green-800">
                                    <strong>✓ Vérification réussie !</strong>
                                  </p>
                                  <p className="text-sm text-green-700 mt-1">
                                    Votre numéro de téléphone actuel a été vérifié. Vous pouvez maintenant le modifier ou le supprimer.
                                  </p>
                                </div>
                                
                                {newPhoneNumber === 'REMOVE' ? (
                                  // Remove phone option
                                  <div className="space-y-4">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                      <p className="text-sm text-red-800">
                                        <strong>Attention :</strong> Cette action supprimera définitivement votre numéro de téléphone.
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={handleConfirmRemovePhone}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                      >
                                        Confirmer la suppression
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowPhoneVerification(false);
                                          setVerificationCode('');
                                          setNewPhoneNumber('');
                                          setCurrentPhoneVerified(false);
                                        }}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Change phone option
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nouveau numéro de téléphone
                                      </label>
                                      <PhoneInput
                                        international
                                        defaultCountry="FR"
                                        value={newPhoneNumber}
                                        onChange={setNewPhoneNumber}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Entrez le nouveau numéro"
                                      />
                                    </div>
                                    {!newPhoneOtpSent ? (
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={handleSetNewPhone}
                                          disabled={isSettingNewPhone || !newPhoneNumber || newPhoneNumber.length < 10}
                                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                          {isSettingNewPhone ? 'Envoi du code...' : 'Envoyer le code de vérification'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setShowPhoneVerification(false);
                                            setVerificationCode('');
                                            setNewPhoneNumber('');
                                            setCurrentPhoneVerified(false);
                                          }}
                                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <p className="text-sm text-green-600">
                                          Un code de vérification a été envoyé au {newPhoneNumber}
                                        </p>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Code de vérification
                                          </label>
                                          <input
                                            type="text"
                                            value={newPhoneVerificationCode}
                                            onChange={(e) => setNewPhoneVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Entrez le code à 6 chiffres"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            maxLength={6}
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={handleVerifyNewPhoneOtp}
                                            disabled={isVerifyingCode || newPhoneVerificationCode.length !== 6}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                          >
                                            {isVerifyingCode ? 'Vérification...' : 'Vérifier et mettre à jour'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setShowPhoneVerification(false);
                                              setVerificationCode('');
                                              setNewPhoneNumber('');
                                              setCurrentPhoneVerified(false);
                                              setNewPhoneOtpSent(false);
                                              setNewPhoneVerificationCode('');
                                            }}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                          >
                                            Annuler
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Client Type Selection */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Type de compte <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                            profileData.clientType === 'particulier'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="clientType"
                              value="particulier"
                              checked={profileData.clientType === 'particulier'}
                              onChange={(e) => {
                                setProfileData({
                                  ...profileData,
                                  clientType: e.target.value,
                                  // Clear business fields if switching to particulier
                                  companyName: '',
                                  siret: '',
                                  vatNumber: '',
                                  billingAddress: '',
                                  billingCity: '',
                                  billingPostalCode: '',
                                  billingCountry: 'France'
                                });
                              }}
                              className="sr-only"
                            />
                            <div className="flex flex-col items-center text-center w-full">
                              <span className="text-2xl mb-2">👤</span>
                              <span className="text-sm font-semibold text-gray-900">Particulier</span>
                              <span className="text-xs text-gray-500 mt-1">Achat personnel</span>
                            </div>
                          </label>
                          <label className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 ${
                            profileData.clientType === 'professionnel'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="clientType"
                              value="professionnel"
                              checked={profileData.clientType === 'professionnel'}
                              onChange={(e) => setProfileData({...profileData, clientType: e.target.value})}
                              className="sr-only"
                            />
                            <div className="flex flex-col items-center text-center w-full">
                              <span className="text-2xl mb-2">🏢</span>
                              <span className="text-sm font-semibold text-gray-900">Professionnel</span>
                              <span className="text-xs text-gray-500 mt-1">Achat entreprise</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Business Fields (only for professionnel) */}
                      {profileData.clientType === 'professionnel' && (
                        <div className="pt-4 border-t border-gray-200 space-y-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                              <span className="mr-2">🏢</span>
                              Informations professionnelles
                            </h3>
                            <p className="text-xs text-blue-700">
                              Les champs marqués d'un astérisque (*) sont obligatoires pour les comptes professionnels.
                            </p>
                          </div>

                          {/* Company Name */}
                          <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                              Nom de l'entreprise <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              value={profileData.companyName}
                              onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Nom de votre entreprise"
                              required={profileData.clientType === 'professionnel'}
                            />
                          </div>

                          {/* SIRET */}
                          <div>
                            <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro SIRET <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="siret"
                              name="siret"
                              value={profileData.siret}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                                setProfileData({...profileData, siret: value});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="12345678901234"
                              maxLength={14}
                              required={profileData.clientType === 'professionnel'}
                            />
                            <p className="mt-1 text-xs text-gray-500">14 chiffres (sans espaces)</p>
                          </div>

                          {/* VAT Number */}
                          <div>
                            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Numéro TVA (optionnel)
                            </label>
                            <input
                              type="text"
                              id="vatNumber"
                              name="vatNumber"
                              value={profileData.vatNumber}
                              onChange={(e) => setProfileData({...profileData, vatNumber: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="FR12345678901"
                            />
                          </div>

                          {/* Billing Address */}
                          <div>
                            <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700 mb-1">
                              Adresse de facturation <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="billingAddress"
                              name="billingAddress"
                              value={profileData.billingAddress}
                              onChange={(e) => setProfileData({...profileData, billingAddress: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Numéro et nom de rue"
                              required={profileData.clientType === 'professionnel'}
                            />
                          </div>

                          {/* Billing City and Postal Code */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="billingCity" className="block text-sm font-medium text-gray-700 mb-1">
                                Ville <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="billingCity"
                                name="billingCity"
                                value={profileData.billingCity}
                                onChange={(e) => setProfileData({...profileData, billingCity: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ville"
                                required={profileData.clientType === 'professionnel'}
                              />
                            </div>

                            <div>
                              <label htmlFor="billingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                Code postal <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="billingPostalCode"
                                name="billingPostalCode"
                                value={profileData.billingPostalCode}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                                  setProfileData({...profileData, billingPostalCode: value});
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="75001"
                                maxLength={5}
                                required={profileData.clientType === 'professionnel'}
                              />
                            </div>
                          </div>

                          {/* Billing Country */}
                          <div>
                            <label htmlFor="billingCountry" className="block text-sm font-medium text-gray-700 mb-1">
                              Pays
                            </label>
                            <select
                              id="billingCountry"
                              name="billingCountry"
                              value={profileData.billingCountry}
                              onChange={(e) => setProfileData({...profileData, billingCountry: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="France">France</option>
                              <option value="Belgique">Belgique</option>
                              <option value="Suisse">Suisse</option>
                              <option value="Luxembourg">Luxembourg</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                        </div>
                      )}

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white shadow-xl">
                    <div className="absolute inset-0">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/40 blur-3xl rounded-full"></div>
                      <div className="absolute bottom-0 left-8 w-48 h-48 bg-purple-500/30 blur-3xl rounded-full"></div>
                    </div>
                    <div className="relative p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 border border-white/20 text-xs uppercase tracking-widest">
                            UMOD Prime
                          </span>
                          <h3 className="mt-4 text-2xl font-semibold">Votre abonnement premium</h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            membershipStatus === 'active'
                              ? 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/30'
                              : 'bg-white/10 text-white/60 border border-white/10'
                          }`}
                        >
                          {membershipStatus === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {membershipStatus === 'active' ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">🌟</div>
                            <div>
                              <p className="text-sm text-white/60">Plan actuel</p>
                              <p className="text-lg font-semibold">{membershipPlanName}</p>
                            </div>
                          </div>
                          <p className="text-sm text-white/70">
                            {currentMembership.membershipAutoRenew === false
                              ? `Le renouvellement automatique est désactivé. Votre abonnement restera actif jusqu’au ${formatMembershipDate(membershipExpiresAt)}.`
                              : 'Votre abonnement se renouvelle automatiquement chaque mois.'}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-4 text-sm text-white/70">
                            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                              <p className="uppercase tracking-wide text-xs text-white/50">Activé le</p>
                              <p className="mt-1 font-semibold">{formatMembershipDate(membershipActivatedAt)}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                              <p className="uppercase tracking-wide text-xs text-white/50">Renouvellement</p>
                              <p className="mt-1 font-semibold">{formatMembershipDate(membershipExpiresAt)}</p>
                            </div>
                          </div>
                          <ul className="space-y-2 text-sm text-white/70">
                            {displayedMembershipPerks.slice(0, 3).map((perk) => (
                              <li key={perk.title} className="flex items-center space-x-2">
                                <span className="text-lg text-emerald-300">✔</span>
                                <span>{perk.title}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={handleMembershipModalOpen}
                            disabled={membershipActionLoading}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white text-slate-900 font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                          >
                            {membershipActionLoading ? 'Ouverture...' : 'Gérer mon abonnement'}
                            <span>→</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/70">
                            {membershipPriceDisplay ? (
                              <p>
                                Bénéficiez de tous les avantages UMOD Prime pour{' '}
                                <span className="font-semibold text-white">{membershipPriceDisplay}</span>{' '}
                                par mois.
                              </p>
                            ) : (
                              <p>
                                Bénéficiez de la livraison express illimitée, d’un concierge shopping 7j/7 et d’offres exclusives pour
                                69,99 DH / mois.
                              </p>
                            )}
                          </div>
                          <ul className="space-y-2 text-sm text-white/70">
                            {displayedMembershipPerks.slice(0, 3).map((perk) => (
                              <li key={perk.title} className="flex items-start space-x-2">
                                <span className="text-lg">✨</span>
                                <div>
                                  <span className="font-medium">{perk.title}</span>
                                  {perk.description && (
                                    <p className="text-xs text-white/60">{perk.description}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={() => navigate('/membership')}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 font-semibold shadow-lg shadow-blue-500/40 hover:-translate-y-0.5 transition-transform"
                          >
                            Découvrir UMOD Prime
                            <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200/60 bg-white/80 backdrop-blur p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vos prochains avantages UMOD Prime</h3>
                    <p className="text-sm text-gray-600">
                      Consolidez votre expérience d’achat au Maroc avec un abonnement pensé pour la rapidité et la sécurité.
                    </p>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">🛡️</span>
                        <div>
                          <p className="font-medium text-gray-900">Protection colis premium</p>
                          <p className="text-gray-600">Assurance incluse et échanges gratuits pendant 60 jours.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">🎁</span>
                        <div>
                          <p className="font-medium text-gray-900">Cadeaux de bienvenue</p>
                          <p className="text-gray-600">Carte cadeau de 50 DH et accès aux masterclass UMOD.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">💎</span>
                        <div>
                          <p className="font-medium text-gray-900">Points fidélité boostés</p>
                          <p className="text-gray-600">Cumulez 2x plus de points pour débloquer des chèques cadeaux.</p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/membership')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-800 hover:bg-gray-100 transition"
                    >
                      En savoir plus sur UMOD Prime
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Mes Commandes</h2>
                  <Link
                    to="/orders"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Voir toutes les commandes
                  </Link>
                </div>
                
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Chargement des commandes...</p>
                  </div>
                ) : userOrders && userOrders.length > 0 ? (
                  <OrderSummary orders={userOrders} />
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Vous n'avez pas encore passé de commande.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/products"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Découvrir nos produits
                      </Link>
                    </div>
                  </div>
                )}
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
                          <div className="w-16 h-6 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600 uppercase">
                              {method.brand || 'CARTE'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              •••• •••• •••• {method.last4}
                            </p>
                            <p className="text-sm text-gray-600">
                              Expire {method.expiry || `${method.expiryMonth}/${method.expiryYear}`}
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
                              {address.address}
                            </p>
                            <p className="text-gray-600">
                              {address.city}, {address.postalCode}
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

                <div className="mt-4">
                  <button
                    onClick={handleSaveNotificationPreferences}
                    disabled={savingSettings}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-300"
                  >
                    {savingSettings ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                  </button>
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
      <MembershipManageModal
        isOpen={membershipModalOpen}
        onClose={handleMembershipModalClose}
        status={currentMembership}
        plan={membershipPlanData}
        loading={membershipActionLoading}
        statusLoading={membershipLoading}
        onCancel={handleMembershipCancel}
        onSubscribe={handleMembershipSubscribe}
        onRefresh={handleMembershipRefresh}
      />

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