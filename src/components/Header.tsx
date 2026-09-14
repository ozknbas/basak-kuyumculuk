import React from 'react';
import { RefreshCw, Bell, User, Clock } from 'lucide-react';

interface HeaderProps {
  currentTime: string;
  isUpdating: boolean;
  onRefresh: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTime,
  isUpdating,
  onRefresh,
  onOpenNotifications,
  onOpenProfile,
  unreadCount,
}) => {
  return (
    <header className="relative w-full pt-3 pb-1 px-4">
      {/* Top Action Row */}
      <div className="flex items-center justify-between mb-2 max-w-lg mx-auto">
        <button
          id="btn-user-profile"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#1C1C22] border border-amber-200 dark:border-stone-700 shadow-2xs flex items-center justify-center text-stone-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-[#282832] active:scale-95 transition-all cursor-pointer"
          title="Kullanıcı & Ayarlar"
        >
          <User className="w-4 h-4 text-amber-900/70 dark:text-amber-400" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-700/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Canlı Piyasa</span>
            <span className="text-emerald-600/70 dark:text-emerald-400/70">•</span>
            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
              {currentTime}
            </span>
          </div>

          <button
            id="btn-refresh-market"
            onClick={onRefresh}
            className={`w-8 h-8 rounded-full bg-white dark:bg-[#1C1C22] border border-amber-200 dark:border-stone-700 shadow-2xs flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-[#282832] active:scale-95 transition-all cursor-pointer ${
              isUpdating ? 'animate-spin text-amber-700 dark:text-amber-400' : ''
            }`}
            title="Fiyatları Yenile"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
          </button>

          <button
            id="btn-header-notif"
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-full bg-white dark:bg-[#1C1C22] border border-amber-200 dark:border-stone-700 shadow-2xs flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-[#282832] active:scale-95 transition-all cursor-pointer"
            title="Duyuru & Bildirimler"
          >
            <Bell className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Brand Header Banner Matching IMG_7079.png */}
      <div className="relative max-w-lg mx-auto bg-gradient-to-r from-[#FAF5E8] via-[#FAF3E0] to-[#FAF5E8] dark:from-[#1E1E26] dark:via-[#252530] dark:to-[#1E1E26] rounded-3xl p-3.5 sm:p-4 border border-amber-200/80 dark:border-amber-500/30 shadow-sm flex items-center justify-center gap-3">
        {/* Gold Ingot / Emblem */}
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-[#FAF5E8] dark:bg-[#18181F] rounded-[14px] flex items-center justify-center">
            <span className="text-2xl leading-none select-none" role="img" aria-label="Başak Gold">
              🧈
            </span>
          </div>
        </div>

        {/* Store Title */}
        <div className="text-left">
          <h1 className="text-lg sm:text-xl font-black tracking-wider text-[#1C1917] dark:text-white flex items-center gap-1.5 leading-none">
            <span>BAŞAK</span>
            <span className="relative">
              KUYUMCULUK
              <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#C49746] dark:bg-amber-400 rounded-full"></span>
            </span>
          </h1>

          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-[#8C6D37] dark:text-amber-400/90 tracking-widest uppercase mt-1.5">
            <span className="opacity-60">———</span>
            <span>KARTAL / İSTANBUL</span>
            <span className="opacity-60">———</span>
          </div>
        </div>
      </div>
    </header>
  );
};
