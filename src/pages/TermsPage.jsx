import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';

const TermsPage = () => {
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
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-secondary-600/90 to-pink-600/90"></div>
        
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
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Conditions d'Utilisation
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 border border-gray-200/50">
            
            {/* Introduction */}
            <div className="border-b border-gray-200 pb-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                Bienvenue sur UMOD. En accédant et en utilisant notre site web, vous acceptez d'être lié par les présentes 
                conditions d'utilisation. Veuillez les lire attentivement avant d'utiliser nos services.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">1</span>
                Acceptation des conditions
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  En utilisant le site UMOD, vous reconnaissez avoir lu, compris et accepté d'être lié par ces conditions 
                  d'utilisation ainsi que par notre politique de confidentialité. Si vous n'acceptez pas ces conditions, 
                  veuillez ne pas utiliser notre site.
                </p>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet 
                  dès leur publication sur cette page. Il est de votre responsabilité de consulter régulièrement cette page 
                  pour prendre connaissance des éventuelles modifications.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">2</span>
                Utilisation du site
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Utilisation autorisée :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Naviguer et consulter les produits disponibles</li>
                    <li>Effectuer des achats en ligne</li>
                    <li>Créer un compte utilisateur</li>
                    <li>Partager des avis et commentaires sur les produits</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Utilisation interdite :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Utiliser le site à des fins illégales ou frauduleuses</li>
                    <li>Tenter d'accéder à des zones restreintes du site</li>
                    <li>Transmettre des virus, codes malveillants ou tout autre élément nuisible</li>
                    <li>Copier, reproduire ou exploiter le contenu sans autorisation</li>
                    <li>Utiliser des robots, scripts automatisés ou des méthodes similaires</li>
                    <li>Harceler, menacer ou nuire à d'autres utilisateurs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">3</span>
                Compte utilisateur
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Pour effectuer des achats sur notre site, vous devez créer un compte utilisateur. Vous êtes responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                  <li>Fournir des informations exactes, complètes et à jour</li>
                  <li>Notifier immédiatement toute utilisation non autorisée de votre compte</li>
                  <li>Être responsable de toutes les activités effectuées sous votre compte</li>
                </ul>
                <p className="mt-4 bg-primary-50 p-4 rounded-lg border-l-4 border-primary-500">
                  <strong>Note importante :</strong> Nous nous réservons le droit de suspendre ou de fermer votre compte 
                  en cas de violation de ces conditions ou de comportement suspect.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">4</span>
                Commandes et paiements
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Processus de commande :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Toutes les commandes sont soumises à notre acceptation</li>
                    <li>Nous nous réservons le droit de refuser ou d'annuler toute commande</li>
                    <li>Les prix sont indiqués en euros (EUR) ou dirhams marocains (MAD) selon votre localisation</li>
                    <li>Les prix peuvent être modifiés à tout moment sans préavis</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Paiement :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Les paiements sont traités de manière sécurisée via nos prestataires de paiement</li>
                    <li>Nous acceptons les cartes bancaires et autres méthodes de paiement indiquées sur le site</li>
                    <li>Votre commande ne sera traitée qu'après confirmation du paiement</li>
                    <li>En cas de problème de paiement, votre commande peut être annulée</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">5</span>
                Livraison et retours
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Les informations détaillées concernant la livraison et les retours sont disponibles sur nos pages dédiées. 
                  En résumé :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Les délais de livraison sont indicatifs et peuvent varier</li>
                  <li>Les frais de livraison sont indiqués lors du processus de commande</li>
                  <li>Vous disposez d'un droit de rétractation conformément à la législation en vigueur</li>
                  <li>Les produits retournés doivent être dans leur état d'origine</li>
                </ul>
                <p className="mt-4">
                  Pour plus d'informations, consultez nos pages{' '}
                  <Link to="/shipping" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    Livraison
                  </Link>
                  {' '}et{' '}
                  <Link to="/returns" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    Retours
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">6</span>
                Propriété intellectuelle
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Tous les contenus présents sur le site UMOD (textes, images, logos, graphismes, etc.) sont la propriété 
                  exclusive d'UMOD ou de ses partenaires et sont protégés par les lois sur la propriété intellectuelle.
                </p>
                <p>
                  Vous vous engagez à ne pas :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Reproduire, copier ou utiliser le contenu sans autorisation</li>
                  <li>Modifier, adapter ou créer des œuvres dérivées</li>
                  <li>Utiliser le contenu à des fins commerciales</li>
                  <li>Supprimer ou modifier les mentions de propriété intellectuelle</li>
                </ul>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">7</span>
                Limitation de responsabilité
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Dans les limites autorisées par la loi, UMOD ne pourra être tenu responsable de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dommages directs ou indirects résultant de l'utilisation du site</li>
                  <li>Pertes de données ou d'informations</li>
                  <li>Interruptions de service ou erreurs techniques</li>
                  <li>Dommages résultant de l'utilisation de produits achetés sur le site</li>
                </ul>
                <p className="mt-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  <strong>Important :</strong> Nous nous efforçons de maintenir le site accessible 24/7, mais nous ne 
                  garantissons pas une disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance 
                  ou raisons techniques.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">8</span>
                Liens externes
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Notre site peut contenir des liens vers des sites web tiers. Ces liens sont fournis uniquement pour 
                  votre commodité. Nous n'avons aucun contrôle sur le contenu de ces sites et n'assumons aucune 
                  responsabilité concernant leur contenu, leurs politiques de confidentialité ou leurs pratiques.
                </p>
                <p>
                  L'inclusion d'un lien ne constitue pas une approbation du site lié par UMOD.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">9</span>
                Protection des données
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Le traitement de vos données personnelles est régi par notre{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    Politique de Confidentialité
                  </Link>
                  . En utilisant notre site, vous acceptez le traitement de vos données conformément à cette politique.
                </p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">10</span>
                Droit applicable et juridiction
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Les présentes conditions d'utilisation sont régies par le droit français. Tout litige relatif à 
                  l'interprétation ou à l'exécution de ces conditions sera de la compétence exclusive des tribunaux français.
                </p>
                <p>
                  Conformément à la législation européenne, vous pouvez également recourir à une plateforme de règlement 
                  en ligne des litiges pour résoudre un différend avec nous.
                </p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">11</span>
                Modifications des conditions
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>
                  Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. Les modifications 
                  prendront effet dès leur publication sur cette page. Il est de votre responsabilité de consulter 
                  régulièrement cette page pour prendre connaissance des éventuelles modifications.
                </p>
                <p>
                  Votre utilisation continue du site après la publication de modifications constitue votre acceptation 
                  des nouvelles conditions.
                </p>
              </div>
            </div>

            {/* Section 12 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-lg">12</span>
                Contact
              </h2>
              <div className="pl-16 space-y-3 text-gray-700">
                <p>Pour toute question concernant ces conditions d'utilisation, contactez-nous :</p>
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 rounded-lg mt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-primary-600" />
                      <strong>Email :</strong>{' '}
                      <a href="mailto:legal@umod.fr" className="text-primary-600 hover:text-primary-700 font-semibold ml-2">
                        legal@umod.fr
                      </a>
                    </li>
                    <li className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-primary-600" />
                      <strong>Téléphone :</strong>{' '}
                      <span className="ml-2">+33 1 23 45 67 89</span>
                    </li>
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 flex-shrink-0 text-primary-600" />
                      <div>
                        <strong>Adresse :</strong>
                        <p className="ml-2">UMOD<br />Paris, France</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link 
                to="/" 
                className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ← Retour à l'accueil
              </Link>
              <Link 
                to="/privacy" 
                className="px-8 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                Politique de Confidentialité →
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;

