import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Home, ShoppingBag, FolderOpen, Info, Phone, Package, HelpCircle, Truck, RotateCcw, MessageCircle, FileText, Link2, Headphones, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-secondary-900/20 to-primary-900/10"></div>

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
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">UMOD</h3>
                <p className="text-primary-200 text-sm">Votre boutique en ligne</p>
              </div>
            </div>
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              Votre boutique en ligne de confiance. Nous proposons une large gamme de produits
              de qualité avec un service client exceptionnel et une expérience d'achat moderne.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Link2 className="w-5 h-5 mr-2 text-primary-400" />
              Liens rapides
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Accueil", icon: Home },
                { to: "/products", label: "Produits", icon: ShoppingBag },
                { to: "/categories", label: "Catégories", icon: FolderOpen },
                { to: "/about", label: "À propos", icon: Info },
                { to: "/contact", label: "Contact", icon: Phone }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group cursor-pointer focus-visible:text-white focus-visible:outline-none"
                  >
                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors duration-300" />
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Headphones className="w-5 h-5 mr-2 text-primary-400" />
              Service client
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/track-order", label: "Suivre ma commande", icon: Package },
                { to: "/help", label: "Aide", icon: HelpCircle },
                { to: "/shipping", label: "Livraison", icon: Truck },
                { to: "/returns", label: "Retours", icon: RotateCcw },
                { to: "/faq", label: "FAQ", icon: MessageCircle },
                { to: "/terms", label: "Conditions", icon: FileText }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 group cursor-pointer focus-visible:text-white focus-visible:outline-none"
                  >
                    <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors duration-300" />
                    <span className="relative">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 transition-all duration-300 group-hover:w-full"></span>
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
              { icon: Mail, label: "Email", value: "contact@umod.fr" },
              { icon: Phone, label: "Téléphone", value: "+33 1 23 45 67 89" },
              { icon: MapPin, label: "Adresse", value: "Paris, France" }
            ].map((contact) => (
              <div key={contact.label} className="flex items-center space-x-4 group">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <contact.icon className="w-5 h-5 text-primary-300" />
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
            © {new Date().getFullYear()} <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent font-bold">UMOD</span>. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Conçu pour une expérience d'achat exceptionnelle
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
