import React from 'react';
import { Lock } from 'lucide-react';

interface ContactViewProps {
  onOpenAdminPanel?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onOpenAdminPanel }) => {
  return (
    <div className="w-full px-4 mb-24 max-w-lg mx-auto">
      {/* Banner / Üst Bilgi */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-amber-100 dark:border-[#2E2E38] shadow-[0_4px_24px_-4px_rgba(212,175,55,0.08)] mb-3">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 4h3l2 5-2 1.5a11 11 0 0 0 5 5L15.5 13l5 2v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-serif-lux text-xl font-bold text-stone-900 dark:text-white tracking-tight">
              İletişim & Mağaza
            </h2>
          </div>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Sorularınız, bilgi almak veya sipariş için bizimle iletişime geçiniz.
        </p>
      </div>

      {/* Çalışma Saatleri Kartı */}
      <div className="calisma-kart">
        <div className="calisma-baslik-satir">
          <div className="calisma-ikon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 7v5l3.5 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="calisma-baslik font-serif-lux">Çalışma Saatleri</div>
        </div>
        <div className="calisma-satir">
          <span className="calisma-gun">Pazartesi – Cumartesi</span>
          <span className="calisma-saat acik">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 7.5v5l3 1.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            09:00 - 19:00
          </span>
        </div>
        <div className="calisma-satir">
          <span className="calisma-gun">Pazar</span>
          <span className="calisma-saat kapali">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M6.5 6.5l11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Kapalı
          </span>
        </div>
      </div>

      {/* İletişim Satırları */}
      {/* 1. TELEFON */}
      <a className="iletisim-satir" href="tel:+902164512222" id="iletisim-telefon">
        <div className="iletisim-satir-ikon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 4h3l2 5-2 1.5a11 11 0 0 0 5 5L15.5 13l5 2v3a2 2 0 0 1-2 2C10.5 20 4 13.5 4 6a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="iletisim-satir-etiket">TELEFON</div>
          <div className="iletisim-satir-deger">0216 451 22 22</div>
        </div>
        <span className="iletisim-satir-ok">›</span>
      </a>

      {/* 2. WHATSAPP */}
      <a
        className="iletisim-satir"
        href="https://wa.me/905314917152"
        target="_blank"
        rel="noopener noreferrer"
        id="iletisim-whatsapp"
      >
        <div className="iletisim-satir-ikon text-emerald-600 bg-emerald-50 border-emerald-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3a5 5 0 0 0-5 5v3.5L5 15h14l-2-3.5V8a5 5 0 0 0-5-5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="iletisim-satir-etiket text-emerald-700">WHATSAPP</div>
          <div className="iletisim-satir-deger font-bold text-emerald-950">0531 491 71 52</div>
        </div>
        <span className="iletisim-satir-ok text-emerald-500">›</span>
      </a>

      {/* 3. INSTAGRAM */}
      <a
        className="iletisim-satir"
        href="https://www.instagram.com/kuyumcumagazasi"
        target="_blank"
        rel="noopener noreferrer"
        id="iletisim-instagram"
      >
        <div className="iletisim-satir-ikon text-rose-600 bg-rose-50 border-rose-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="16.6" cy="7.4" r="1.1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <div className="iletisim-satir-etiket text-rose-600">INSTAGRAM</div>
          <div className="iletisim-satir-deger">@kuyumcumagazasi</div>
        </div>
        <span className="iletisim-satir-ok">›</span>
      </a>

      {/* 4. ADRES */}
      <a
        className="iletisim-satir"
        href="https://maps.app.goo.gl/Ed5LbJhsAkxbQMxE9"
        target="_blank"
        rel="noopener noreferrer"
        id="iletisim-adres"
      >
        <div className="iletisim-satir-ikon text-amber-700 bg-amber-50 border-amber-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </div>
        <div className="min-w-0 pr-1">
          <div className="iletisim-satir-etiket">ADRES</div>
          <div className="iletisim-satir-deger text-xs leading-relaxed">
            Gümüşpınar Mahallesi, Atatürk Caddesi, No:139/A — Kartal / İstanbul
          </div>
        </div>
        <span className="iletisim-satir-ok">›</span>
      </a>

      {/* 5. GOOGLE YORUMU */}
      <a
        className="iletisim-satir"
        href="https://g.page/r/CYlR20cWmDhDEAE/review"
        target="_blank"
        rel="noopener noreferrer"
        id="iletisim-google-yorum"
      >
        <div className="iletisim-satir-ikon text-amber-500 bg-amber-50 border-amber-200">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 17.3 6.2 20.5l1.1-6.6L2.5 9.2l6.7-1 3-6 3 6 6.7 1-4.8 4.7 1.1 6.6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="iletisim-satir-etiket">GOOGLE YORUMU</div>
          <div className="iletisim-satir-deger text-amber-800">
            Deneyiminizi bizimle paylaşın ⭐⭐⭐⭐⭐
          </div>
        </div>
        <span className="iletisim-satir-ok text-amber-600">›</span>
      </a>

      {/* Harita Kartı */}
      <div className="harita-kart">
        <div className="harita-ust">
          <div className="harita-baslik">
            <div className="harita-baslik-ikon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            Konumumuz
          </div>
          <a
            className="harita-link"
            href="https://maps.app.goo.gl/Ed5LbJhsAkxbQMxE9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Haritada Görüntüle
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5h10v10M18.5 5.5 10 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 19H6a2 2 0 0 1-2-2V8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </a>
        </div>
        <div
          className="iletisim-harita-kutu"
          onClick={() => window.open('https://maps.app.goo.gl/Ed5LbJhsAkxbQMxE9', '_blank')}
        >
          <iframe
            src="https://www.google.com/maps?q=40.916450,29.205455&z=16&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Harita Konumu"
          />
        </div>
        <p className="iletisim-not-metin">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Konumumuzu haritada görüntüleyerek kolayca ulaşabilirsiniz.
        </p>
      </div>

      {/* Yönetim Paneli Yetkili Bağlantısı */}
      {onOpenAdminPanel && (
        <div className="mt-4 pt-2">
          <button
            id="btn-open-admin-panel"
            type="button"
            onClick={onOpenAdminPanel}
            className="w-full p-3 rounded-2xl bg-white dark:bg-[#18181D] hover:bg-stone-50 dark:hover:bg-[#202028] border border-stone-200 dark:border-[#2E2E38] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all flex items-center justify-between shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-[#2B2215] border border-amber-200 dark:border-[#5E4420] flex items-center justify-center text-amber-800 dark:text-amber-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold">Yönetim Paneli (Yetkili Girişi)</span>
            </div>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">Giriş Yap ›</span>
          </button>
        </div>
      )}
    </div>
  );
};
