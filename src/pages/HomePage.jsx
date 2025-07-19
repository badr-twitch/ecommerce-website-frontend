import React from 'react';

const HomePage = () => {
  console.log('HomePage rendering...'); // Debug log
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenue chez UMOD
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Votre boutique en ligne française de confiance
          </p>
          <div className="bg-blue-600 text-white px-8 py-4 rounded-lg inline-block">
            Site en construction
          </div>
          
          {/* Debug info */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Debug Info:</h3>
            <p className="text-sm text-gray-600">
              Frontend is running! If you can see this, the app is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 