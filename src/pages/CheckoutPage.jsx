import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import ShippingForm from '../components/checkout/ShippingForm';
import ShippingOptions from '../components/checkout/ShippingOptions';
import OrderSummary from '../components/checkout/OrderSummary';
import PaymentForm from '../components/checkout/PaymentForm';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    company: '',
    notes: ''
  });
  
  const [shippingMethod, setShippingMethod] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (data) => {
    setShippingData(data);
    setCurrentStep(2);
  };

  const handleShippingMethodSelect = (method) => {
    setShippingMethod(method);
    setCurrentStep(3);
  };

  const handlePaymentSubmit = async (data) => {
    setPaymentData(data);
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with your payment processor
      console.log('Processing order:', {
        items: cartItems,
        shipping: shippingData,
        shippingMethod,
        payment: data,
        total: total + (shippingMethod?.price || 0)
      });
      
      // Clear cart and redirect to success page
      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getShippingCost = () => {
    return shippingMethod?.price || 0;
  };

  const getTotalWithShipping = () => {
    return total + getShippingCost();
  };

  const steps = [
    { id: 1, name: 'Livraison', status: currentStep >= 1 ? 'current' : 'upcoming' },
    { id: 2, name: 'Expédition', status: currentStep >= 2 ? 'current' : 'upcoming' },
    { id: 3, name: 'Paiement', status: currentStep >= 3 ? 'current' : 'upcoming' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Finaliser votre commande</h1>
          
          {/* Progress Steps */}
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center justify-center space-x-8">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className="relative">
                  {stepIdx !== steps.length - 1 ? (
                    <div className="absolute top-4 left-8 -ml-px mt-0.5 h-0.5 w-16 bg-gray-300" />
                  ) : null}
                  <div className="relative flex items-center">
                    <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.status === 'current' 
                        ? 'border-blue-600 bg-blue-600 text-white' 
                        : step.status === 'complete'
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}>
                      <span className="text-sm font-medium">{step.id}</span>
                    </div>
                    <span className={`ml-4 text-sm font-medium ${
                      step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
              {currentStep === 1 && (
                <ShippingForm 
                  initialData={shippingData}
                  onSubmit={handleShippingSubmit}
                />
              )}
              
              {currentStep === 2 && (
                <ShippingOptions 
                  shippingData={shippingData}
                  onSelect={handleShippingMethodSelect}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              
              {currentStep === 3 && (
                <PaymentForm 
                  total={getTotalWithShipping()}
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setCurrentStep(2)}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary 
              items={cartItems}
              subtotal={total}
              shippingCost={getShippingCost()}
              total={getTotalWithShipping()}
              shippingMethod={shippingMethod}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 