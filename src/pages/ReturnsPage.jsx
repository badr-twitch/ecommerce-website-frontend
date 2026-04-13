import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle, XCircle, RefreshCw, Banknote, AlertTriangle, Phone, ShieldAlert } from 'lucide-react';

const ReturnsPage = () => {
  const returnSteps = [
    { step: 1, title: 'Contactez-nous', description: 'Écrivez-nous dans les 7 jours suivant la réception pour signaler votre demande de retour.' },
    { step: 2, title: 'Validation', description: 'Nous vérifions ensemble l\'éligibilité du produit et les conditions du retour.' },
    { step: 3, title: 'Renvoi du colis', description: 'Vous nous renvoyez le produit dans son emballage d\'origine, non ouvert et non utilisé.' },
    { step: 4, title: 'Contrôle', description: 'À réception, nous inspectons le produit pour confirmer qu\'il est en parfait état.' },
    { step: 5, title: 'Remboursement', description: 'Le remboursement est déclenché sur votre moyen de paiement initial.' }
  ];

  const returnConditions = [
    {
      icon: CheckCircle,
      title: 'Produits éligibles',
      items: [
        'Produits non ouverts et non utilisés',
        'Emballage et scellés d\'origine intacts',
        'Tous les accessoires et notices inclus',
        'Retour signalé dans les 7 jours après réception'
      ]
    },
    {
      icon: XCircle,
      title: 'Produits non retournables',
      items: [
        'Produits ouverts, utilisés ou testés',
        'Articles dont le scellé d\'hygiène est retiré',
        'Produits abîmés par le client',
        'Certains articles pour raisons d\'hygiène (maquillage appliqué, rouges à lèvres ouverts, soins en pot ouverts, etc.)'
      ]
    }
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
      <section className="relative overflow-hidden py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-700/90"></div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 mx-auto transform hover:scale-110 transition-transform duration-300 shadow-2xl">
                <RotateCcw className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Retours & remboursements
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Une politique simple, adaptée aux produits cosmétiques
            </p>
          </div>
        </div>
      </section>

      {/* Policy Overview */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                  7 jours
                </div>
                <div className="text-gray-600 font-medium">
                  Délai pour signaler un retour
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                  Non ouvert
                </div>
                <div className="text-gray-600 font-medium">
                  Produit dans son état d'origine
                </div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                  Sécurisé
                </div>
                <div className="text-gray-600 font-medium">
                  Remboursement après contrôle
                </div>
              </div>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Les cosmétiques sont des produits sensibles : pour des raisons
                d'hygiène et de sécurité, nous acceptons uniquement les retours de
                produits <strong>non ouverts, non utilisés et en parfait état</strong>,
                dans leur emballage d'origine avec tous les scellés intacts.
              </p>
              <p>
                Vous disposez de <strong>7 jours calendaires</strong> à compter de la
                réception de votre commande pour nous signaler votre demande de retour.
                Passé ce délai, le retour ne pourra plus être accepté.
              </p>
              <p className="text-sm text-gray-500 italic">
                {/* TODO : valider avec le business si certains produits (parfums scellés,
                    coffrets non ouverts) peuvent faire exception ou non. */}
                Certains articles peuvent ne pas être retournables pour des raisons
                d'hygiène, même non ouverts. Cette information est précisée sur la fiche produit le cas échéant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Steps */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-primary-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-4">
              Comment retourner un produit
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une procédure claire en 5 étapes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {returnSteps.map((item, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg text-center transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {returnConditions.map((condition, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50"
              >
                <div className="flex items-center mb-6">
                  <condition.icon className="w-10 h-10 mr-4 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {condition.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {condition.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start text-gray-700">
                      <span className="mr-2 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hygiene & Refund Info */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200/50 space-y-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-6">
              Hygiène, remboursement & cas particuliers
            </h2>

            <div className="space-y-6 text-gray-700">
              <div className="bg-pink-50 p-6 rounded-xl border-l-4 border-pink-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2" />
                  Règles d'hygiène
                </h3>
                <p>
                  Tout produit dont le scellé, l'opercule ou l'emballage d'hygiène a été
                  retiré ne peut plus être repris, pour des raisons sanitaires. Merci
                  de vérifier votre commande avant d'ouvrir les produits.
                </p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl border-l-4 border-primary-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Échange
                </h3>
                <p>
                  Un échange peut être envisagé uniquement si le produit reçu est
                  différent de celui commandé, ou s'il présente un défaut à la
                  réception. Contactez-nous avec des photos via la page{' '}
                  <Link to="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">Contact</Link>.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <Banknote className="w-5 h-5 mr-2" />
                  Remboursement
                </h3>
                <p>
                  Une fois le retour réceptionné et contrôlé, le remboursement est
                  effectué sur votre moyen de paiement initial. Pour une commande
                  réglée à la livraison, nous conviendrons avec vous du mode de
                  remboursement le plus adapté.
                </p>
              </div>

              <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Produit défectueux ou erreur de préparation
                </h3>
                <p>
                  Si vous recevez un produit abîmé, défectueux ou différent de celui
                  commandé, contactez-nous dans les 48h suivant la réception avec des
                  photos. Nous prenons en charge le traitement de A à Z, sans frais
                  supplémentaires de votre côté.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Besoin d'aide pour un retour ?</h2>
            <p className="text-xl text-primary-100 mb-8">
              Notre équipe vous accompagne pas à pas dans votre demande.
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

export default ReturnsPage;
