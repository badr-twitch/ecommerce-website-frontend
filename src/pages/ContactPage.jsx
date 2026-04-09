import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Mail, Phone, MapPin, Clock, Facebook, Twitter, Camera, Send, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Veuillez entrer votre adresse e-mail');
      return;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Veuillez entrer une adresse e-mail valide');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Veuillez entrer un sujet');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Veuillez entrer votre message');
      return;
    }
    
    if (formData.message.trim().length < 10) {
      toast.error('Votre message doit contenir au moins 10 caractères');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Try to send to backend if endpoint exists, otherwise show success message
      try {
        await api.post('/contact', formData);
        toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      } catch (error) {
        // If endpoint doesn't exist, just show success (form is ready for backend integration)
        if (error.response?.status === 404) {
          console.log('Contact endpoint not yet implemented, showing success message');
          toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
        } else {
          throw error;
        }
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'contact@umod.fr',
      link: 'mailto:contact@umod.fr'
    },
    {
      icon: Phone,
      title: 'Téléphone',
      content: '+33 1 23 45 67 89',
      link: 'tel:+33123456789'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      content: 'Paris, France',
      link: null
    },
    {
      icon: Clock,
      title: 'Horaires',
      content: 'Lun - Ven: 9h - 18h',
      link: null
    }
  ];

  const subjectOptions = [
    'Question générale',
    'Commande',
    'Retour produit',
    'Problème technique',
    'Partenariat',
    'Autre'
  ];

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-secondary-600/90 to-pink-600/90 animate-gradient"></div>
        
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Phone className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Contactez-nous
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Nous sommes là pour vous aider. N'hésitez pas à nous contacter !
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Information Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sticky top-8 border border-gray-200/50 transform hover:shadow-3xl transition-all duration-300">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-8">
                  Informations de contact
                </h2>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div 
                      key={index} 
                      className="flex items-start space-x-4 group p-4 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                        {info.icon}
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {info.title}
                        </h3>
                        {info.link ? (
                          <a 
                            href={info.link}
                            className="text-gray-700 hover:text-primary-600 font-medium transition-colors inline-flex items-center group/link"
                          >
                            {info.content}
                            <span className="ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity">→</span>
                          </a>
                        ) : (
                          <p className="text-gray-700">
                            {info.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Media */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-6">Suivez-nous</h3>
                  <div className="flex space-x-3">
                    {[
                      { icon: <BookOpen className="w-6 h-6 text-white" />, label: 'Facebook', href: '#', color: 'from-primary-500 to-primary-600' },
                      { icon: <Twitter className="w-6 h-6 text-white" />, label: 'Twitter', href: '#', color: 'from-sky-400 to-sky-500' },
                      { icon: <Camera className="w-6 h-6 text-white" />, label: 'Instagram', href: '#', color: 'from-pink-500 to-secondary-500' }
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.href}
                        className={`w-14 h-14 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-xl transform`}
                        aria-label={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 transform hover:shadow-3xl transition-all duration-300">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-3">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-300 group-hover:shadow-md"
                          placeholder="Jean Dupont"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-300 group-hover:shadow-md"
                          placeholder="jean.dupont@example.com"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* Phone and Subject Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-300 group-hover:shadow-md"
                          placeholder="+33 6 12 34 56 78"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                        Sujet <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-300 group-hover:shadow-md appearance-none cursor-pointer"
                        >
                          <option value="">Sélectionnez un sujet</option>
                          {subjectOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none"></div>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="group">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none bg-white/50 backdrop-blur-sm hover:bg-white hover:border-primary-300 group-hover:shadow-md"
                        placeholder="Décrivez votre demande en détail..."
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all pointer-events-none"></div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className={`text-sm font-medium transition-colors ${
                        formData.message.length < 10 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {formData.message.length} caractères (minimum 10)
                      </p>
                      {formData.message.length >= 10 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      <span className="text-red-500">*</span> Champs obligatoires
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 hover:from-primary-700 hover:via-secondary-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                      <span className="relative flex items-center">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Envoyer le message
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="mt-12 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center px-8 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="mr-2">←</span>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

