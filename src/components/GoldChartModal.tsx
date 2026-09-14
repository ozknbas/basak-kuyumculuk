import React, { useState } from 'react';
import { X, TrendingUp, BarChart3, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface GoldChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasAltinPrice: number;
  changeRate: number;
  currentTime: string;
}

type GoldSymbolType = 'FX:XAUUSD' | 'FX_IDC:XAUTRYG' | 'BIST:GLDTR';

interface SymbolOption {
  id: GoldSymbolType;
  label: string;
  sublabel: string;
}

const SYMBOL_OPTIONS: SymbolOption[] = [
  { id: 'FX:XAUUSD', label: 'Ons Altın ($)', sublabel: 'XAU/USD Canlı' },
  { id: 'FX_IDC:XAUTRYG', label: 'Gram Altın (₺)', sublabel: 'XAU/TRY Serbest Piyasa' },
  { id: 'BIST:GLDTR', label: 'BIST Altın Fonu', sublabel: 'GLDTR Borsa İstanbul' },
];

const TIMEFRAMES = [
  { id: '15', label: '15D' },
  { id: '60', label: '1S' },
  { id: '240', label: '4S' },
  { id: 'D', label: '1G' },
  { id: 'W', label: '1H' },
];

export const GoldChartModal: React.FC<GoldChartModalProps> = ({
  isOpen,
  onClose,
  hasAltinPrice,
  changeRate,
  currentTime,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<GoldSymbolType>('FX:XAUUSD');
  const [timeframe, setTimeframe] = useState<string>('D');
  const [key, setKey] = useState<number>(0);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
    selectedSymbol
  )}&interval=${timeframe}&hidesidetoolbar=0&symboledit=1&saveimage=0&toolbarbg=f8fafc&studies=%5B%5D&theme=light&style=1&timezone=Europe%2FIstanbul&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=tr`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="gold-chart-modal"
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-amber-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2A1E11] via-[#3D2C1B] to-[#2A1E11] text-white p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 font-black shadow-md">
              <BarChart3 className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Has Altın Canlı Grafik</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 font-bold uppercase tracking-wider">
                    TradingView
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-amber-200/80 font-medium">
                Başak Kuyumculuk · Kartal / İstanbul · {currentTime}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefresh}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Grafiği Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-close-gold-chart"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Price Ticker & Summary Bar */}
        <div className="bg-[#FAF7F0] border-b border-amber-200/80 p-2.5 sm:px-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div>
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">
                HAS ALTIN (GR)
              </span>
              <span className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
                {formatCurrency(hasAltinPrice, 2)}
              </span>
            </div>

            <div className="h-6 w-px bg-stone-300/80" />

            <div>
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider block">
                GÜNLÜK DEĞİŞİM
              </span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  changeRate >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                <TrendingUp className="w-3 h-3 inline" />
                %{changeRate >= 0 ? `+${changeRate.toFixed(2)}` : changeRate.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Symbol Selector Tabs */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-2xl border border-stone-200 shadow-2xs">
            {SYMBOL_OPTIONS.map((sym) => (
              <button
                key={sym.id}
                onClick={() => setSelectedSymbol(sym.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSymbol === sym.id
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Bar */}
        <div className="bg-white px-3 py-1.5 border-b border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-stone-400 font-bold uppercase mr-1">Zaman:</span>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-stone-400 font-mono">
            Canlı Mum / Çizgi Grafiği
          </span>
        </div>

        {/* TradingView Chart Frame */}
        <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[440px] bg-stone-50">
          <iframe
            key={`${selectedSymbol}-${timeframe}-${key}`}
            title="TradingView Gold Chart"
            src={iframeSrc}
            className="w-full h-full min-h-[380px] sm:min-h-[440px] border-0"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-2.5 sm:px-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Gerçek zamanlı küresel ve serbest piyasa altın grafiği</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://tr.tradingview.com/symbols/${selectedSymbol.replace(':', '-')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 hover:underline"
            >
              <span>TradingView'de Aç</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
