import React from 'react';
import { formatNumber } from '../utils/formatters';

interface HasAltinBannerProps {
  price: number;
  changeRate: number;
  currentTime: string;
  onOpenCalculator: () => void;
  onOpenChart: () => void;
}

export const HasAltinBanner: React.FC<HasAltinBannerProps> = ({
  price,
  currentTime,
  onOpenCalculator,
  onOpenChart,
}) => {
  return (
    <div className="w-full px-3.5 mt-2 mb-3 max-w-lg mx-auto">
      {/* Two Pills Side by Side as in IMG_7079.png */}
      <div className="flex items-center gap-2">
        {/* Left Price Pill */}
        <button
          type="button"
          onClick={onOpenChart}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-white dark:bg-[#18181D] border border-stone-200/90 dark:border-[#2E2E38] shadow-xs flex items-center justify-center gap-2 text-stone-900 dark:text-white font-extrabold text-base sm:text-lg hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer active:scale-98"
          title="Has Altın Canlı Grafiği (TradingView)"
        >
          <span className="text-emerald-700 dark:text-emerald-400 text-base">📈</span>
          <span className="tracking-tight">{formatNumber(price, 2)} ₺</span>
        </button>

        {/* Right Has Altın Pill */}
        <button
          type="button"
          onClick={onOpenChart}
          className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#A67830] via-[#BA8A3E] to-[#996D29] dark:from-[#B88738] dark:via-[#D4A34D] dark:to-[#A3742B] text-white shadow-xs flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black tracking-wider uppercase border border-[#8C6221] dark:border-amber-500/50 hover:opacity-95 transition-all cursor-pointer active:scale-98"
          title="Has Altın Canlı Grafiğini Aç"
        >
          <span className="text-sm">🧱</span>
          <span>✦ HAS ALTIN ✦</span>
        </button>
      </div>

      {/* Subtext: Live time indicator */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 px-1 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          <span>Canlı Altın Fiyatı · {currentTime}</span>
        </div>
      </div>
    </div>
  );
};
