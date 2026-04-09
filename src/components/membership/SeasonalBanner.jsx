import React, { useState, useEffect } from 'react';
import { membershipAPI } from '../../services/api';

const THEME_STYLES = {
  ramadan: 'from-indigo-900 via-secondary-900 to-indigo-800 border-secondary-400/30',
  eid: 'from-emerald-800 via-teal-800 to-emerald-900 border-emerald-400/30',
  school: 'from-primary-800 via-sky-800 to-primary-900 border-primary-400/30',
  blackfriday: 'from-gray-900 via-black to-gray-900 border-yellow-400/30',
  newyear: 'from-secondary-900 via-pink-900 to-secondary-900 border-pink-400/30'
};

const SeasonalBanner = () => {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const res = await membershipAPI.getSeasonalOffers();
        if (res.data?.success && res.data.data?.length > 0) {
          setOffers(res.data.data);
        }
      } catch {
        // Silent fail — seasonal banner is non-critical
      }
    };
    loadOffers();
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="space-y-4">
      {offers.map(offer => {
        const themeClass = THEME_STYLES[offer.theme] || THEME_STYLES.eid;
        return (
          <div
            key={offer.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${themeClass} border p-6`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{offer.icon}</span>
                <h3 className="text-xl font-bold text-white">{offer.name}</h3>
              </div>
              <p className="text-white/80 text-sm">{offer.bannerMessage}</p>
              {offer.specialPerks?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {offer.specialPerks.map((perk, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SeasonalBanner;
