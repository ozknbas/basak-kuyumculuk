import React from 'react';
import { X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import goldenCartImg from '../assets/images/golden_cart_icon_1789360215956.jpg';

interface WelcomeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeOrderModal: React.FC<WelcomeOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="welcome-order-modal"
        className="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF2] to-[#FAF4E6] rounded-[32px] p-5 sm:p-6 border border-amber-200/90 shadow-[0_20px_60px_-15px_rgba(180,130,50,0.35)] overflow-hidden text-stone-800"
      >
        {/* Close Button */}
        <button
          id="btn-close-welcome-modal"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-all shadow-xs z-10 cursor-pointer active:scale-95"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Brand Tag */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3 h-3 text-stone-950" />
            BAŞAK KUYUMCULUK
          </span>
          <span className="text-[11px] font-semibold text-stone-400">
            · Kartal / İstanbul
          </span>
        </div>

        {/* Top Content: Gold Cart Icon & Text */}
        <div className="flex items-center gap-3.5 sm:gap-4 mb-5">
          {/* Golden Cart Image Badge */}
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-100/80 via-amber-50 to-amber-200/40 border border-amber-300/60 p-1.5 flex items-center justify-center shadow-inner">
            <img
              src={goldenCartImg}
              alt="Başak Kuyumculuk"
              className="w-full h-full object-contain drop-shadow-md rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Texts */}
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight leading-tight">
              Hoş Geldiniz
            </h3>
            <p className="text-xs sm:text-sm font-bold text-[#8A5016] mt-1.5 leading-snug">
              Canlı altın fiyatları ve sipariş için tıklayınız.
            </p>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-1.5 leading-relaxed">
              Güncel serbest piyasa kurları, 22 ayar, sarrafiye ve anlık WhatsApp siparişi.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-welcome-enter-app"
          onClick={onClose}
          className="w-full py-3.5 px-4 sm:px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base flex items-center justify-between shadow-[0_6px_20px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all cursor-pointer group"
        >
          {/* Left Icon in Circle */}
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>

          {/* Center Text */}
          <span className="tracking-tight font-extrabold text-center px-2">
            Canlı Altın Fiyatları ve Sipariş İçin Tıklayınız
          </span>

          {/* Right Arrow */}
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shrink-0">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>

        {/* Footer Sub-line */}
        <div className="flex items-center justify-center gap-2 mt-3.5 text-[11px] text-stone-500 font-medium">
          <div className="h-px bg-amber-200/80 flex-1 max-w-[50px]" />
          <div className="flex items-center gap-1 text-[#8A5016] font-semibold">
            <span>✦ Başak Kuyumculuk Güvencesiyle Canlı Fiyatlar ✦</span>
          </div>
          <div className="h-px bg-amber-200/80 flex-1 max-w-[50px]" />
        </div>
      </div>
    </div>
  );
};
