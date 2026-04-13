import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Commandes',
      questions: [
        {
          q: 'Comment passer une commande ?',
          a: 'Parcourez nos catégories (soins de visage, soins de corps, soins capillaires, parfums, maquillage, packages), ajoutez les produits au panier, puis finalisez au checkout. Vous recevez un email de confirmation dès la validation de votre commande.'
        },
        {
          q: 'Puis-je modifier ou annuler ma commande ?',
          a: 'Tant que votre commande n\'est pas préparée, nous pouvons souvent la modifier ou l\'annuler. Contactez-nous le plus vite possible via la page Contact en précisant votre numéro de commande.'
        },
        {
          q: 'Comment suivre ma commande ?',
          a: 'Une fois expédiée, un email de suivi vous est envoyé. Vous pouvez aussi retrouver l\'état de votre commande à tout moment dans votre compte, rubrique « Mes commandes ».'
        },
        {
          q: 'Quels modes de paiement acceptez-vous ?',
          a: 'Vous pouvez régler votre commande en paiement à la livraison (en espèces à la réception) ou par carte bancaire en ligne. Les paiements en ligne sont traités de manière sécurisée.'
        }
      ]
    },
    {
      category: 'Livraison',
      questions: [
        {
          q: 'Où livrez-vous ?',
          a: 'Nous livrons partout au Maroc, dans toutes les grandes villes et régions du Royaume.'
        },
        {
          q: 'Quels sont les délais de livraison ?',
          a: 'La livraison standard prend en général 2 à 5 jours ouvrés, selon votre ville et la disponibilité des produits commandés.'
        },
        {
          q: 'Quels sont les frais de livraison ?',
          a: 'La livraison est gratuite à partir de 300 DH d\'achat. En-dessous de ce montant, les frais de livraison sont indiqués clairement au moment du checkout.'
        },
        {
          q: 'Que faire si mon colis est endommagé ?',
          a: 'Si votre colis arrive visiblement abîmé, refusez-le à la livraison ou prenez des photos avant ouverture, puis contactez-nous sous 48h. Nous organisons un remplacement ou un remboursement selon le cas.'
        }
      ]
    },
    {
      category: 'Retours & Remboursements',
      questions: [
        {
          q: 'Quelle est votre politique de retour ?',
          a: 'Pour des raisons d\'hygiène, nous acceptons les retours uniquement sur les produits non ouverts, non utilisés et en parfait état, dans leur emballage d\'origine. Le retour doit être signalé dans les 7 jours suivant la réception.'
        },
        {
          q: 'Certains produits ne sont-ils pas retournables ?',
          a: 'Oui. Tout produit dont le scellé ou l\'opercule d\'hygiène a été retiré ne peut plus être repris. Certains articles peuvent également être non retournables pour des raisons sanitaires, même s\'ils paraissent intacts.'
        },
        {
          q: 'Comment demander un retour ?',
          a: 'Contactez-nous via la page Contact en indiquant votre numéro de commande et la raison du retour. Nous revenons vers vous avec la marche à suivre.'
        },
        {
          q: 'Quand serai-je remboursé(e) ?',
          a: 'Dès réception et vérification du retour, nous déclenchons le remboursement sur votre moyen de paiement initial. Pour un paiement à la livraison, nous convenons ensemble du mode de remboursement adapté.'
        }
      ]
    },
    {
      category: 'Mon compte',
      questions: [
        {
          q: 'Comment créer un compte ?',
          a: 'Cliquez sur « Inscription » en haut de la page, complétez vos informations et validez. La création de compte est gratuite et vous permet de suivre vos commandes et de gérer votre wishlist.'
        },
        {
          q: 'Puis-je commander sans compte ?',
          a: 'Un compte est nécessaire pour finaliser votre commande : il nous permet de sécuriser vos informations de livraison et de vous donner accès à votre historique et au suivi.'
        },
        {
          q: 'J\'ai oublié mon mot de passe, que faire ?',
          a: 'Cliquez sur « Mot de passe oublié » depuis la page de connexion. Vous recevrez un email avec un lien pour le réinitialiser.'
        },
        {
          q: 'Comment mettre à jour mon adresse ou mon numéro ?',
          a: 'Rendez-vous dans votre profil, rubrique « Mes informations » ou « Mes adresses ». Vos modifications sont prises en compte immédiatement pour les prochaines commandes.'
        }
      ]
    },
    {
      category: 'Produits',
      questions: [
        {
          q: 'Vos produits sont-ils authentiques ?',
          a: 'Oui. UMOD est une boutique multi-marques : nous sélectionnons nos fournisseurs avec soin pour garantir l\'authenticité et la qualité de chaque produit proposé.'
        },
        {
          q: 'Comment savoir si un produit est en stock ?',
          a: 'Le statut de stock est indiqué sur chaque fiche produit. Si un article est en rupture, la fiche affiche clairement l\'information ; vous pouvez nous contacter pour être prévenu(e) dès son retour.'
        },
        {
          q: 'Les photos des produits sont-elles fidèles ?',
          a: 'Nous faisons notre maximum pour que les visuels reflètent le produit réel. L\'affichage des couleurs peut toutefois légèrement varier selon votre écran, en particulier pour les teintes de maquillage.'
        },
        {
          q: 'Puis-je demander conseil avant d\'acheter ?',
          a: 'Bien sûr. Contactez-nous via la page Contact en décrivant votre type de peau, de cheveux ou vos préférences : nous vous orienterons vers les produits les plus adaptés.'
        }
      ]
    },
    {
      category: 'Contact & autres',
      questions: [
        {
          q: 'Comment contacter le service client ?',
          a: 'Vous pouvez nous joindre via le formulaire de la page Contact, par email ou par téléphone (coordonnées affichées en bas de chaque page). Nous répondons du lundi au samedi.'
        },
        {
          q: 'Livrez-vous hors du Maroc ?',
          a: 'Pour le moment, nous livrons uniquement à l\'intérieur du Maroc.'
        },
        {
          q: 'Comment signaler un problème sur le site ?',
          a: 'Si vous rencontrez un problème technique, contactez-nous via la page Contact en décrivant la situation et en joignant une capture d\'écran si possible. Nous revenons vers vous rapidement.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-secondary-600/90 to-pink-600/90"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Questions Fréquentes
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses à vos questions
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white mr-4">
                    {categoryIndex + 1}
                  </span>
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.questions.map((faq, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div
                        key={questionIndex}
                        className="border border-gray-200/60 rounded-xl overflow-hidden hover:border-primary-300 transition-all duration-200 bg-white/60 backdrop-blur-sm"
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-primary-50/30 transition-colors duration-200 cursor-pointer"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.q}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-primary-600 flex-shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                          <div className="px-6 py-4 bg-primary-50/30 border-t border-gray-100">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Vous avez encore des questions ?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !
            </p>
            <Link 
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-600 hover:bg-primary-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Phone className="w-5 h-5 inline mr-1" /> Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;

