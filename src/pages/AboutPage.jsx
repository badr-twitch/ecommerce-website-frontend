import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Leaf, Heart, Users, Info, ShoppingBag, Phone } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Authenticité',
      description: 'Nous travaillons avec des marques fiables pour vous garantir des produits authentiques et conformes.'
    },
    {
      icon: Sparkles,
      title: 'Sélection rigoureuse',
      description: 'Chaque référence est choisie pour son efficacité, sa qualité et son adéquation aux peaux et cheveux.'
    },
    {
      icon: Leaf,
      title: 'Adapté au Maroc',
      description: 'Des routines et des textures pensées pour le climat, les habitudes et les envies beauté d\'ici.'
    },
    {
      icon: Heart,
      title: 'Proche de vous',
      description: 'Un service client à l\'écoute, des conseils sincères et un suivi soigné de chaque commande.'
    }
  ];

  const pillars = [
    {
      name: 'Notre catalogue',
      role: 'Multi-marques',
      description: 'Soins de visage, soins de corps, soins capillaires, parfums, maquillage et coffrets — une offre complète pour composer votre routine.'
    },
    {
      name: 'Notre promesse',
      role: 'Confiance & clarté',
      description: 'Pas de promesses irréalistes, pas d\'ingrédients dissimulés : une information produit honnête et un accompagnement attentif.'
    },
    {
      name: 'Notre logistique',
      role: 'Livraison au Maroc',
      description: 'Préparation soignée et livraison partout au Maroc en 2 à 5 jours ouvrés, avec paiement à la livraison ou par carte.'
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
                <Info className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              À propos de UMOD
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Votre boutique de cosmétiques multi-marques au Maroc
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 md:p-12 border border-white/60">
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Notre histoire
            </h2>
            <div className="section-divider"></div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg mt-6">
              <p>
                UMOD est née d'une envie simple : rassembler au même endroit les marques
                de cosmétiques que l'on aime vraiment, et les rendre facilement accessibles
                partout au Maroc.
              </p>
              <p>
                Nous sommes une boutique multi-marques : nous ne fabriquons pas, nous
                sélectionnons. Notre rôle est de choisir, tester et présenter des produits
                de soin, de parfumerie et de maquillage qui tiennent leurs promesses, puis
                de vous les livrer dans les meilleures conditions.
              </p>
              <p>
                {/* TODO : personnaliser avec l'histoire de la fondation, les fondateurs
                    et les marques phares une fois les détails business confirmés. */}
                Chaque commande est préparée avec soin, emballée proprement et expédiée
                rapidement. Derrière UMOD, il y a une petite équipe passionnée de beauté,
                disponible pour vous conseiller et répondre à vos questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Nos engagements
            </h2>
            <div className="section-divider"></div>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos commandes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-soft hover:-translate-y-2 transition-all duration-300 group card-3d"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-500 text-center leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 relative z-10 bg-gradient-to-br from-gray-50/50 to-primary-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gradient mb-4">
              Ce qui nous différencie
            </h2>
            <div className="section-divider"></div>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Trois piliers pour une expérience beauté sans compromis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/60 shadow-soft hover:-translate-y-2 transition-all duration-300 card-3d"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {pillar.name}
                </h3>
                <p className="text-primary-600 font-semibold mb-4 text-center">
                  {pillar.role}
                </p>
                <p className="text-gray-500 text-center leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Notre mission</h2>
            <p className="text-lg leading-relaxed text-primary-100 mb-6">
              Rendre les beaux cosmétiques accessibles partout au Maroc, avec des conseils
              honnêtes, une expérience d'achat moderne et un service à la hauteur de votre
              confiance.
            </p>
            <p className="text-lg leading-relaxed text-primary-100">
              Nous croyons que prendre soin de soi ne devrait jamais être un casse-tête : ni
              pour trouver les bons produits, ni pour les recevoir.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 md:p-12 border border-white/60">
            <h2 className="text-3xl font-bold text-gradient mb-4">
              Découvrez la boutique UMOD
            </h2>
            <p className="text-xl text-gray-500 mb-8">
              Parcourez nos catégories beauté et trouvez votre prochaine routine
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-glow-primary hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" /> Voir les produits
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-semibold rounded-xl transition-all duration-300 hover:shadow-soft inline-flex items-center gap-2"
              >
                <Phone className="w-5 h-5" /> Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
