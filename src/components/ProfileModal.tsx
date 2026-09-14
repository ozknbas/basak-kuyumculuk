import React from 'react';
import { X, User, Sun, Moon, Check } from 'lucide-react';
import { ThemeMode } from '../utils/themeStorage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onChangeTheme,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`rounded-3xl max-w-sm w-full p-5 border shadow-2xl relative transition-colors ${
          isDark
            ? 'bg-[#18181D] border-[#2E2E38] text-stone-100 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
            : 'bg-white border-amber-200 text-stone-900 shadow-2xl'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isDark
              ? 'bg-[#25252D] hover:bg-[#32323D] text-stone-400 hover:text-stone-200'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-500'
          }`}
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-xs ${
              isDark
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}
          >
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Müşteri Profili & Ayarlar
            </h3>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Başak Kuyumculuk Özel Arayüzü
            </p>
          </div>
        </div>

        {/* 2-Option Theme Switch (Açık Ton vs Koyu Ton) */}
        <div className="mb-4">
          <label
            className={`text-xs font-bold uppercase tracking-wider block mb-2.5 ${
              isDark ? 'text-amber-400/90' : 'text-stone-700'
            }`}
          >
            Görünüm Teması
          </label>
          <div className="space-y-2.5">
            {/* Açık Ton */}
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                themeMode === 'light'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/30 shadow-xs'
                  : isDark
                  ? 'border-[#2E2E38] hover:border-stone-600 bg-[#212128]'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 shadow-2xs flex-shrink-0">
                  <Sun className="w-5 h-5 text-amber-800" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${isDark && themeMode !== 'light' ? 'text-stone-200' : 'text-stone-900'}`}>
                    Açık Ton (Lüks Şampanya & İnci)
                  </div>
                  <div className={`text-[10px] truncate ${isDark && themeMode !== 'light' ? 'text-stone-400' : 'text-stone-500'}`}>
                    Aydınlık, ferah ve klasik altın sarrafiye tonları
                  </div>
                </div>
              </div>
              {themeMode === 'light' && (
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 ml-2">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>

            {/* Koyu Ton */}
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                themeMode === 'dark'
                  ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-500/40 shadow-xs'
                  : isDark
                  ? 'border-[#2E2E38] hover:border-stone-600 bg-[#212128]'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E1E24] to-[#121216] border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-2xs flex-shrink-0">
                  <Moon className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    Koyu Ton (Asil Gece & Altın)
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    Gözü yormayan premium antrasit ve ışıltılı altın tonları
                  </div>
                </div>
              </div>
              {themeMode === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center flex-shrink-0 ml-2">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Live Auto-Refresh Switch */}
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between mb-4 transition-colors ${
            isDark
              ? 'bg-[#212128] border-[#2E2E38]'
              : 'bg-stone-50 border-stone-200/80'
          }`}
        >
          <div>
            <div className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
              Otomatik Canlı Fiyat Güncelleme
            </div>
            <div className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Piyasa verilerini her 5 saniyede bir güncelle
            </div>
          </div>
          <button
            onClick={onToggleAutoRefresh}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              autoRefresh ? 'bg-emerald-600' : isDark ? 'bg-stone-700' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                autoRefresh ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
            isDark
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
              : 'bg-amber-900 text-white hover:bg-amber-950'
          }`}
        >
          Tamam
        </button>
      </div>
    </div>
  );
};
