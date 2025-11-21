import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Commandes',
      questions: [
        {
          q: 'Comment passer une commande ?',
          a: 'Pour passer une commande, parcourez nos produits, ajoutez-les à votre panier, puis procédez au paiement. Vous recevrez une confirmation par email une fois votre commande validée.'
        },
        {
          q: 'Puis-je modifier ou annuler ma commande ?',
          a: 'Vous pouvez modifier ou annuler votre commande dans les 2 heures suivant la validation. Après ce délai, contactez notre service client qui fera de son mieux pour vous aider.'
        },
        {
          q: 'Comment suivre ma commande ?',
          a: 'Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pouvez également suivre votre commande depuis votre compte dans la section "Mes commandes".'
        },
        {
          q: 'Quels modes de paiement acceptez-vous ?',
          a: 'Nous acceptons les cartes bancaires (Visa, Mastercard, American Express), PayPal, et les virements bancaires. Tous les paiements sont sécurisés et cryptés.'
        }
      ]
    },
    {
      category: 'Livraison',
      questions: [
        {
          q: 'Quels sont les délais de livraison ?',
          a: 'Les délais de livraison varient selon votre localisation : 24-48h pour la France métropolitaine, 3-5 jours pour les DOM-TOM. Vous pouvez consulter les délais exacts lors du processus de commande.'
        },
        {
          q: 'Quels sont les frais de livraison ?',
          a: 'La livraison est gratuite pour les commandes supérieures à 50€ en France métropolitaine. Pour les commandes inférieures, les frais sont de 4,99€. Les membres UMOD Prime bénéficient de la livraison gratuite sur toutes les commandes.'
        },
        {
          q: 'Puis-je choisir le jour de livraison ?',
          a: 'Oui, lors du processus de commande, vous pouvez sélectionner une date de livraison parmi les créneaux disponibles dans votre région.'
        },
        {
          q: 'Que faire si mon colis est endommagé ?',
          a: 'Si votre colis arrive endommagé, contactez immédiatement notre service client avec des photos. Nous organiserons un remplacement ou un remboursement selon votre préférence.'
        }
      ]
    },
    {
      category: 'Retours & Remboursements',
      questions: [
        {
          q: 'Quelle est votre politique de retour ?',
          a: 'Vous disposez de 14 jours à compter de la réception pour retourner un article non utilisé et dans son emballage d\'origine. Les retours sont gratuits pour les membres UMOD Prime.'
        },
        {
          q: 'Comment retourner un article ?',
          a: 'Connectez-vous à votre compte, allez dans "Mes commandes", sélectionnez la commande concernée et cliquez sur "Retourner". Vous recevrez une étiquette de retour à imprimer.'
        },
        {
          q: 'Quand serai-je remboursé ?',
          a: 'Une fois le retour reçu et vérifié, le remboursement est effectué sous 5 à 10 jours ouvrés sur votre moyen de paiement initial.'
        },
        {
          q: 'Puis-je échanger un article ?',
          a: 'Oui, vous pouvez échanger un article contre une autre taille ou couleur. Contactez notre service client pour organiser l\'échange.'
        }
      ]
    },
    {
      category: 'Compte & Abonnement',
      questions: [
        {
          q: 'Comment créer un compte ?',
          a: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec vos informations et validez votre email. C\'est gratuit et prend moins de 2 minutes !'
        },
        {
          q: 'Qu\'est-ce que UMOD Prime ?',
          a: 'UMOD Prime est notre programme d\'abonnement qui offre la livraison gratuite sur toutes les commandes, des réductions exclusives, et un accès prioritaire aux nouveautés.'
        },
        {
          q: 'Comment annuler mon abonnement UMOD Prime ?',
          a: 'Vous pouvez annuler votre abonnement à tout moment depuis votre compte dans la section "Mon abonnement". L\'annulation prend effet à la fin de la période payée.'
        },
        {
          q: 'J\'ai oublié mon mot de passe, que faire ?',
          a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un email avec un lien pour réinitialiser votre mot de passe.'
        }
      ]
    },
    {
      category: 'Produits',
      questions: [
        {
          q: 'Comment savoir si un produit est en stock ?',
          a: 'Le statut du stock est indiqué sur chaque page produit. Si un article est en rupture, vous pouvez activer une alerte pour être notifié dès qu\'il sera à nouveau disponible.'
        },
        {
          q: 'Proposez-vous une garantie sur vos produits ?',
          a: 'Oui, tous nos produits bénéficient d\'une garantie constructeur. La durée varie selon le type de produit (généralement 1 à 2 ans). Les détails sont indiqués sur chaque fiche produit.'
        },
        {
          q: 'Puis-je voir les avis d\'autres clients ?',
          a: 'Absolument ! Chaque produit dispose d\'une section avis où vous pouvez lire les commentaires et notes des clients qui ont acheté le produit.'
        },
        {
          q: 'Les photos des produits sont-elles fidèles ?',
          a: 'Nous nous efforçons de fournir des photos les plus fidèles possible. Cependant, les couleurs peuvent légèrement varier selon votre écran. En cas de doute, n\'hésitez pas à nous contacter.'
        }
      ]
    },
    {
      category: 'Autres',
      questions: [
        {
          q: 'Comment contacter le service client ?',
          a: 'Vous pouvez nous contacter par email à contact@umod.fr, par téléphone au +33 1 23 45 67 89 (Lun-Ven, 9h-18h), ou via le formulaire de contact sur notre site.'
        },
        {
          q: 'Proposez-vous des programmes de fidélité ?',
          a: 'Oui ! En plus d\'UMOD Prime, nous avons un programme de points de fidélité. Vous gagnez des points à chaque achat que vous pouvez convertir en réductions.'
        },
        {
          q: 'Livrez-vous à l\'étranger ?',
          a: 'Actuellement, nous livrons uniquement en France métropolitaine et dans les DOM-TOM. Nous travaillons sur l\'extension de notre service à d\'autres pays européens.'
        },
        {
          q: 'Comment signaler un problème technique sur le site ?',
          a: 'Si vous rencontrez un problème technique, contactez-nous à support@umod.fr en décrivant le problème et en incluant une capture d\'écran si possible. Nous traiterons votre demande rapidement.'
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                💬
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Questions Fréquentes
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-4">
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
                        className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between bg-white/50 hover:bg-white transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.q}
                          </span>
                          <span className={`text-2xl text-blue-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Vous avez encore des questions ?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !
            </p>
            <Link 
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              📞 Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;

