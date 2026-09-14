import React from 'react';
import { Coins, Flame, CreditCard, Phone, Tag } from 'lucide-react';
import { NavTab } from '../types';
import sarrafiyeGoldCoinImg from '../assets/images/sarrafiye_gold_coin_1789359796637.jpg';
import gramAltinBarImg from '../assets/images/gram_altin_bar_1789360644852.jpg';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
  cartCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  cartCount = 0,
}) => {
  const tabs = [
    {
      id: 'sarrafiye' as NavTab,
      label: 'Sarrafiyeler',
      renderIcon: (isActive: boolean) => (
        <img
          src={sarrafiyeGoldCoinImg}
          alt="Sarrafiyeler"
          className={`w-5 h-5 object-contain rounded-full transition-transform ${
            isActive ? 'scale-110 drop-shadow-sm brightness-105' : 'opacity-90'
          }`}
          referrerPolicy="no-referrer"
        />
      ),
    },
    {
      id: 'hesap' as NavTab,
      label: 'Hurda Altın',
      renderIcon: (isActive: boolean) => (
        <img
          src={gramAltinBarImg}
          alt="Hurda Altın"
          className={`w-5 h-5 object-contain rounded-xs transition-transform ${
            isActive ? 'scale-110 drop-shadow-sm brightness-105' : 'opacity-90'
          }`}
          referrerPolicy="no-referrer"
        />
      ),
    },
    {
      id: 'firsat' as NavTab,
      label: 'FIRSAT ÜRÜNÜ',
      isHot: true,
      renderIcon: (isActive: boolean) => (
        <span className="text-lg leading-none" role="img" aria-label="Fırsat">
          🏷️
        </span>
      ),
    },
    {
      id: 'iban' as NavTab,
      label: 'İban',
      renderIcon: (isActive: boolean) => (
        <CreditCard className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
      ),
    },
    {
      id: 'iletisim' as NavTab,
      label: 'İletişim',
      renderIcon: (isActive: boolean) => (
        <Phone className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500 dark:text-stone-400'}`} />
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14141A]/95 backdrop-blur-md border-t border-amber-200/70 dark:border-stone-800 px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 min-w-[62px] cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#C49746] to-[#9E7329] text-white font-bold shadow-xs border border-amber-600'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 active:scale-95'
              }`}
            >
              <div className="relative mb-0.5 flex items-center justify-center">
                {tab.renderIcon(isActive)}
                {tab.id === 'sarrafiye' && cartCount > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight leading-none whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-white'
                    : tab.isHot
                    ? 'font-extrabold text-rose-700 dark:text-rose-400'
                    : 'font-medium text-stone-600 dark:text-stone-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
