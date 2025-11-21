import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🔒 Politique de Confidentialité
            </h1>
            <p className="text-xl text-blue-100">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <div className="border-b border-gray-200 pb-8">
              <p className="text-gray-700 leading-relaxed">
                Chez UMOD, nous accordons une grande importance à la protection de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons 
                vos informations lorsque vous utilisez notre site web et nos services.
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">1️⃣</span>
                Informations que nous collectons
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informations personnelles :</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Nom et prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Numéro de téléphone</li>
                    <li>Adresse postale (pour la livraison)</li>
                    <li>Informations de paiement (traitées de manière sécurisée)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informations techniques :</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Adresse IP</li>
                    <li>Type de navigateur et version</li>
                    <li>Pages visitées et durée de visite</li>
                    <li>Données de navigation et préférences</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">2️⃣</span>
                Comment nous utilisons vos informations
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Nous utilisons vos données personnelles pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Traiter vos commandes :</strong> Gérer vos achats, traiter les paiements et organiser les livraisons</li>
                  <li><strong>Améliorer nos services :</strong> Analyser l'utilisation du site pour optimiser l'expérience utilisateur</li>
                  <li><strong>Communication :</strong> Vous envoyer des confirmations de commande, mises à jour et informations importantes</li>
                  <li><strong>Marketing :</strong> Vous informer de nos offres spéciales et nouveaux produits (avec votre consentement)</li>
                  <li><strong>Sécurité :</strong> Détecter et prévenir la fraude et les activités suspectes</li>
                  <li><strong>Support client :</strong> Répondre à vos questions et résoudre vos problèmes</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">3️⃣</span>
                Partage de vos informations
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement avec :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Prestataires de services :</strong> Sociétés de livraison, processeurs de paiement, services d'hébergement</li>
                  <li><strong>Obligations légales :</strong> Lorsque requis par la loi ou pour protéger nos droits</li>
                  <li><strong>Avec votre consentement :</strong> Dans tous les autres cas, uniquement avec votre autorisation explicite</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <strong>Note importante :</strong> Tous nos partenaires sont tenus de respecter des normes strictes de confidentialité 
                  et de sécurité des données.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">4️⃣</span>
                Sécurité de vos données
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Chiffrement SSL/TLS pour toutes les transmissions de données</li>
                  <li>Stockage sécurisé des informations sensibles</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Surveillance régulière des systèmes de sécurité</li>
                  <li>Mises à jour régulières de nos systèmes de protection</li>
                </ul>
              </div>
            </div>

            {/* Section 5 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">5️⃣</span>
                Vos droits
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos informations inexactes</li>
                  <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Vous pouvez récupérer vos données dans un format structuré</li>
                  <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données</li>
                  <li><strong>Droit de limitation :</strong> Vous pouvez demander la limitation du traitement</li>
                </ul>
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous à :{' '}
                  <a href="mailto:privacy@umod.fr" className="text-blue-600 hover:text-blue-700 font-semibold">
                    privacy@umod.fr
                  </a>
                </p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">6️⃣</span>
                Cookies et technologies similaires
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance :</strong> Pour analyser l'utilisation du site</li>
                  <li><strong>Cookies de fonctionnalité :</strong> Pour mémoriser vos préférences</li>
                  <li><strong>Cookies marketing :</strong> Pour personnaliser les publicités (avec votre consentement)</li>
                </ul>
                <p className="mt-4">
                  Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">7️⃣</span>
                Conservation des données
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>
                  Nous conservons vos données personnelles uniquement aussi longtemps que nécessaire pour les finalités 
                  pour lesquelles elles ont été collectées, ou conformément aux obligations légales applicables.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Données de commande : Conservées pendant la durée légale de conservation des factures</li>
                  <li>Données de compte : Conservées tant que votre compte est actif</li>
                  <li>Données marketing : Conservées jusqu'à ce que vous vous désinscriviez</li>
                </ul>
              </div>
            </div>

            {/* Section 8 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">8️⃣</span>
                Modifications de cette politique
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>
                  Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                  Toute modification sera publiée sur cette page avec une date de mise à jour révisée. 
                  Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">9️⃣</span>
                Contact
              </h2>
              <div className="pl-10 space-y-3 text-gray-700">
                <p>Pour toute question concernant cette politique de confidentialité ou le traitement de vos données, contactez-nous :</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mt-4">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="mr-3">📧</span>
                      <strong>Email :</strong>{' '}
                      <a href="mailto:privacy@umod.fr" className="text-blue-600 hover:text-blue-700 font-semibold ml-2">
                        privacy@umod.fr
                      </a>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-3">📞</span>
                      <strong>Téléphone :</strong>{' '}
                      <span className="ml-2">+33 1 23 45 67 89</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-3">📍</span>
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
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ← Retour à l'accueil
              </Link>
              <Link 
                to="/terms" 
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-300"
              >
                Conditions d'utilisation →
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;

