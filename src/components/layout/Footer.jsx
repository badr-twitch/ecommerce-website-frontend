import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6 group">
              <div className="relative">
                <img 
                  src="/LOGO.png" 
                  alt="UMOD Logo" 
                  className="h-16 w-auto transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">UMOD</h3>
                <p className="text-blue-200 text-sm">Votre boutique en ligne française</p>
              </div>
            </div>
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              Votre boutique en ligne française de confiance. Nous proposons une large gamme de produits 
              de qualité avec un service client exceptionnel et une expérience d'achat moderne.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "📘", href: "#", label: "Facebook" },
                { icon: "🐦", href: "#", label: "Twitter" },
                { icon: "📷", href: "#", label: "Instagram" }
              ].map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl hover:bg-white/20 hover:scale-110 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <span className="group-hover:scale-110 transition-transform duration-300">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🔗</span>
              Liens rapides
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Accueil", icon: "🏠" },
                { to: "/products", label: "Produits", icon: "🛍️" },
                { to: "/categories", label: "Catégories", icon: "📂" },
                { to: "/about", label: "À propos", icon: "ℹ️" },
                { to: "/contact", label: "Contact", icon: "📞" }
              ].map((item) => (
                <li key={item.to}>
                  <Link 
                    to={item.to} 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">🛎️</span>
              Service client
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/help", label: "Aide", icon: "❓" },
                { to: "/shipping", label: "Livraison", icon: "🚚" },
                { to: "/returns", label: "Retours", icon: "↩️" },
                { to: "/faq", label: "FAQ", icon: "💬" },
                { to: "/terms", label: "Conditions", icon: "📋" }
              ].map((item) => (
                <li key={item.to}>
                  <Link 
                    to={item.to} 
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📧", label: "Email", value: "contact@umod.fr" },
              { icon: "📞", label: "Téléphone", value: "+33 1 23 45 67 89" },
              { icon: "📍", label: "Adresse", value: "Paris, France" }
            ].map((contact) => (
              <div key={contact.label} className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                  {contact.icon}
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">{contact.label}</p>
                  <p className="text-white font-semibold">{contact.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">UMOD</span>. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Conçu avec ❤️ pour une expérience d'achat exceptionnelle
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 