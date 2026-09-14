import React, { useEffect, useState } from 'react';
import { Bell, X, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { PushNotificationPayload } from '../types';

interface TopPushNotificationBannerProps {
  notification: PushNotificationPayload | null;
  onClose: () => void;
  onClickView?: () => void;
}

export const TopPushNotificationBanner: React.FC<TopPushNotificationBannerProps> = ({
  notification,
  onClose,
  onClickView,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 7000); // 7 seconds auto-dismiss
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBannerClick = () => {
    if (onClickView) {
      onClickView();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <aside
      aria-label="Fiyat Bildirimi"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none flex justify-center px-3 pt-3 sm:pt-4"
    >
      <div
        id="top-push-notification"
        onClick={handleBannerClick}
        className={`pointer-events-auto w-full max-w-md bg-stone-900/95 text-white backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border border-amber-400/40 shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-300 transform cursor-pointer select-none group ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* App Emblem / Golden Bell Icon */}
          <div className="relative shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center">
              <span className="text-xl leading-none select-none" role="img" aria-label="Başak Altın">
                👑
              </span>
            </div>
            {/* Live pulsating dot */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white"></span>
            </span>
          </div>

          {/* Body Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 text-[10px] text-amber-300/90 font-bold uppercase tracking-wider mb-0.5">
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-amber-400 animate-bounce" />
                <span>BAŞAK KUYUMCULUK · ŞİMDİ</span>
              </div>
              <span className="text-[10px] text-stone-400 font-normal lowercase">dokun & incele</span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
              {notification.title.replace('👑 BAŞAK KUYUMCULUK · ', '')}
            </h4>

            <p className="text-[11px] sm:text-xs text-stone-200 mt-0.5 leading-relaxed">
              {notification.body}
            </p>
          </div>

          {/* Close Action */}
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors -mr-1 -mt-1 cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom subtle progress indicator */}
        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
          <div className="flex items-center gap-1 text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Apple & Android Canlı Fiyat Bildirimi</span>
          </div>
          <div className="flex items-center gap-0.5 text-stone-300 group-hover:text-amber-300 transition-colors">
            <span>Aç</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </aside>
  );
};
