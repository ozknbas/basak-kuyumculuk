import React, { useState } from 'react';
import { Calculator, RotateCcw, Share2, Coins, ArrowRightLeft, Sparkles, Check } from 'lucide-react';
import { ScrapRate, GoldProduct } from '../types';
import { formatCurrency, formatNumber, copyToClipboard } from '../utils/formatters';
import sarrafiyeGoldCoinImg from '../assets/images/sarrafiye_gold_coin_1789359796637.jpg';

interface CalculatorViewProps {
  scrapRates: ScrapRate[];
  products: GoldProduct[];
  activeProductForCalc?: GoldProduct | null;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  scrapRates,
  products,
}) => {
  const [calcMode, setCalcMode] = useState<'hurda' | 'sarrafiye'>('hurda');
  
  // Scrap inputs: { [karat]: { buy: number, sell: number } }
  const [scrapInputs, setScrapInputs] = useState<Record<number, { buy: string; sell: string }>>({
    24: { buy: '', sell: '' },
    22: { buy: '', sell: '' },
    18: { buy: '', sell: '' },
    14: { buy: '', sell: '' },
    8: { buy: '', sell: '' },
  });

  // Sarrafiye piece count inputs: { [productId]: { buy: string, sell: string } }
  const [sarrafiyeInputs, setSarrafiyeInputs] = useState<Record<string, { buy: string; sell: string }>>({});
  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleScrapChange = (karat: number, type: 'buy' | 'sell', val: string) => {
    // Allow numbers and decimal points
    const cleanVal = val.replace(/[^0-9.,]/g, '').replace(',', '.');
    setScrapInputs(prev => ({
      ...prev,
      [karat]: {
        ...prev[karat],
        [type]: cleanVal,
      },
    }));
  };

  const handleSarrafiyeChange = (productId: string, type: 'buy' | 'sell', val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    setSarrafiyeInputs(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { buy: '', sell: '' }),
        [type]: cleanVal,
      },
    }));
  };

  const resetAll = () => {
    setScrapInputs({
      24: { buy: '', sell: '' },
      22: { buy: '', sell: '' },
      18: { buy: '', sell: '' },
      14: { buy: '', sell: '' },
      8: { buy: '', sell: '' },
    });
    setSarrafiyeInputs({});
  };

  // Calculations
  let totalScrapBuyGrams = 0;
  let totalScrapSellGrams = 0;
  let totalScrapBuyAmount = 0;
  let totalScrapSellAmount = 0;

  scrapRates.forEach(rate => {
    const inputs = scrapInputs[rate.karat] || { buy: '', sell: '' };
    const buyG = parseFloat(inputs.buy) || 0;
    const sellG = parseFloat(inputs.sell) || 0;

    totalScrapBuyGrams += buyG;
    totalScrapSellGrams += sellG;
    totalScrapBuyAmount += buyG * rate.buyPrice;
    totalScrapSellAmount += sellG * rate.sellPrice;
  });

  let totalSarrafiyeBuyCount = 0;
  let totalSarrafiyeSellCount = 0;
  let totalSarrafiyeBuyAmount = 0;
  let totalSarrafiyeSellAmount = 0;

  products.forEach(p => {
    const input = sarrafiyeInputs[p.id] || { buy: '', sell: '' };
    const buyCount = parseInt(input.buy, 10) || 0;
    const sellCount = parseInt(input.sell, 10) || 0;

    totalSarrafiyeBuyCount += buyCount;
    totalSarrafiyeSellCount += sellCount;
    totalSarrafiyeBuyAmount += buyCount * p.buyPrice;
    totalSarrafiyeSellAmount += sellCount * p.sellPrice;
  });

  const totalBuyAmount = totalScrapBuyAmount + totalSarrafiyeBuyAmount;
  const totalSellAmount = totalScrapSellAmount + totalSarrafiyeSellAmount;
  const hasAnyInput = totalBuyAmount > 0 || totalSellAmount > 0;

  const handleShareSummary = () => {
    let summaryText = '✨ *Başak Kuyumculuk - Altın Hesap Özeti*\n\n';
    
    if (calcMode === 'hurda' || totalScrapBuyAmount > 0 || totalScrapSellAmount > 0) {
      summaryText += '🔸 *Hurda Altın İşlemleri:*\n';
      scrapRates.forEach(rate => {
        const item = scrapInputs[rate.karat];
        if (!item) return;
        const buyG = parseFloat(item.buy) || 0;
        const sellG = parseFloat(item.sell) || 0;
        if (buyG > 0) {
          summaryText += `• ${rate.name} Alış: ${buyG} gr = ${formatCurrency(buyG * rate.buyPrice)}\n`;
        }
        if (sellG > 0) {
          summaryText += `• ${rate.name} Satış: ${sellG} gr = ${formatCurrency(sellG * rate.sellPrice)}\n`;
        }
      });
    }

    if (totalSarrafiyeBuyAmount > 0 || totalSarrafiyeSellAmount > 0) {
      summaryText += '\n🔹 *Sarrafiye İşlemleri:*\n';
      products.forEach(p => {
        const item = sarrafiyeInputs[p.id];
        if (!item) return;
        const b = parseInt(item.buy, 10) || 0;
        const s = parseInt(item.sell, 10) || 0;
        if (b > 0) summaryText += `• ${p.name} Alış (${b} Adet) = ${formatCurrency(b * p.buyPrice)}\n`;
        if (s > 0) summaryText += `• ${p.name} Satış (${s} Adet) = ${formatCurrency(s * p.sellPrice)}\n`;
      });
    }

    summaryText += `\n💵 *Toplam Alış Tutarı:* ${formatCurrency(totalBuyAmount)}`;
    summaryText += `\n💰 *Toplam Satış Tutarı:* ${formatCurrency(totalSellAmount)}`;
    summaryText += `\n\nBaşak Kuyumculuk · Güven, Hız, Değer`;

    copyToClipboard(summaryText).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  return (
    <div className="w-full px-4 mb-28 max-w-lg mx-auto">
      {/* Title & Description Banner */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-5 border border-amber-100 dark:border-[#2E2E38] shadow-[0_4px_24px_-4px_rgba(212,175,55,0.08)] mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-400">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Hesap Makinesi
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-1">
          Hurda altın ve sarrafiye için gram/adet girin, tutar anlık hesaplanıp işlem özetine eklensin.
        </p>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-stone-100/90 dark:bg-[#202028] border border-stone-200/60 dark:border-[#2C2C38]">
          <button
            id="tab-calc-hurda"
            onClick={() => setCalcMode('hurda')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              calcMode === 'hurda'
                ? 'bg-white dark:bg-[#2B2215] text-amber-950 dark:text-amber-300 shadow-xs border border-amber-200/70 dark:border-amber-600/50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Hurda Altın</span>
          </button>

          <button
            id="tab-calc-sarrafiye"
            onClick={() => setCalcMode('sarrafiye')}
            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              calcMode === 'sarrafiye'
                ? 'bg-white dark:bg-[#2B2215] text-amber-950 dark:text-amber-300 shadow-xs border border-amber-200/70 dark:border-amber-600/50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <img
              src={sarrafiyeGoldCoinImg}
              alt="Sarrafiye"
              className="w-4 h-4 object-contain rounded-full shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <span>Sarrafiye (Adet)</span>
          </button>
        </div>
      </div>

      {/* Calculator Body - HURDA ALTIN */}
      {calcMode === 'hurda' && (
        <div className="space-y-4">
          {scrapRates.map((rate) => {
            const inputs = scrapInputs[rate.karat] || { buy: '', sell: '' };
            const buyGrams = parseFloat(inputs.buy) || 0;
            const sellGrams = parseFloat(inputs.sell) || 0;
            const buyTotal = buyGrams * rate.buyPrice;
            const sellTotal = sellGrams * rate.sellPrice;

            return (
              <div
                key={rate.karat}
                id={`card-hurda-${rate.karat}`}
                className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-stone-200/70 dark:border-[#2E2E38] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-amber-200 dark:hover:border-amber-500/40 transition-all"
              >
                {/* Ayar Header & Rates */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100 dark:border-[#252530]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider text-amber-900 dark:text-amber-400 uppercase">
                      {rate.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#282834] text-stone-600 dark:text-stone-300 font-medium">
                      {(rate.purity * 1000).toFixed(0)} Milyem
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                    Alış: <span className="text-stone-700 dark:text-stone-200 font-bold">{formatCurrency(rate.buyPrice)}</span> · 
                    Satış: <span className="text-emerald-700 dark:text-emerald-400 font-bold ml-1">{formatCurrency(rate.sellPrice)}</span>
                  </div>
                </div>

                {/* Grid 2-column input fields (ALIŞ and SATIŞ) */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Alış Kutusu */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#202028] border border-stone-200/70 dark:border-[#2C2C38]">
                    <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                      {rate.karat} AYAR ALIŞ — GRAM
                    </div>

                    <div className="relative mb-2">
                      <input
                        id={`input-hurda-${rate.karat}-buy`}
                        type="text"
                        inputMode="decimal"
                        placeholder="Gram girin"
                        value={inputs.buy}
                        onChange={(e) => handleScrapChange(rate.karat, 'buy', e.target.value)}
                        className="w-full py-2 px-3 bg-white dark:bg-[#15151A] border border-stone-200 dark:border-[#383848] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-left"
                      />
                      {inputs.buy && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                          gr
                        </span>
                      )}
                    </div>

                    <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-white pt-1 border-t border-stone-200/50 dark:border-[#2C2C38] flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 font-normal">Tutar:</span>
                      <span>{formatCurrency(buyTotal)}</span>
                    </div>
                  </div>

                  {/* Satış Kutusu */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#202028] border border-stone-200/70 dark:border-[#2C2C38]">
                    <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                      {rate.karat} AYAR SATIŞ — GRAM
                    </div>

                    <div className="relative mb-2">
                      <input
                        id={`input-hurda-${rate.karat}-sell`}
                        type="text"
                        inputMode="decimal"
                        placeholder="Gram girin"
                        value={inputs.sell}
                        onChange={(e) => handleScrapChange(rate.karat, 'sell', e.target.value)}
                        className="w-full py-2 px-3 bg-white dark:bg-[#15151A] border border-stone-200 dark:border-[#383848] rounded-xl text-xs sm:text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all text-left"
                      />
                      {inputs.sell && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-medium">
                          gr
                        </span>
                      )}
                    </div>

                    <div className="text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-400 pt-1 border-t border-stone-200/50 dark:border-[#2C2C38] flex items-center justify-between">
                      <span className="text-[11px] text-stone-400 font-normal">Tutar:</span>
                      <span>{formatCurrency(sellTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Gram Pills */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-stone-100 dark:border-[#252530] overflow-x-auto scrollbar-none">
                  <span className="text-[10px] text-stone-400 whitespace-nowrap">Hızlı Gram:</span>
                  {[1, 5, 10, 20, 50].map((quickG) => (
                    <button
                      key={quickG}
                      onClick={() => handleScrapChange(rate.karat, 'buy', quickG.toString())}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#252530] hover:bg-amber-100 dark:hover:bg-amber-950/60 text-[10px] font-medium text-stone-700 dark:text-stone-300 hover:text-amber-950 dark:hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      +{quickG}g
                    </button>
                  ))}
                  {(inputs.buy || inputs.sell) && (
                    <button
                      onClick={() => {
                        handleScrapChange(rate.karat, 'buy', '');
                        handleScrapChange(rate.karat, 'sell', '');
                      }}
                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline ml-auto font-medium cursor-pointer"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calculator Body - SARRAFİYE ADET */}
      {calcMode === 'sarrafiye' && (
        <div className="space-y-3">
          {products
            .filter(p => p.category === 'yeni' || p.category === 'eski')
            .map((p) => {
              const inputs = sarrafiyeInputs[p.id] || { buy: '', sell: '' };
              const buyCount = parseInt(inputs.buy, 10) || 0;
              const sellCount = parseInt(inputs.sell, 10) || 0;
              const buyTotal = buyCount * p.buyPrice;
              const sellTotal = sellCount * p.sellPrice;

              return (
                <div
                  key={p.id}
                  id={`calc-item-${p.id}`}
                  className="bg-white dark:bg-[#18181D] rounded-3xl p-4 border border-stone-200/70 dark:border-[#2E2E38] shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={sarrafiyeGoldCoinImg}
                        alt={p.name}
                        className="w-6 h-6 object-contain rounded-full shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-stone-800 dark:text-stone-100">
                          {p.name}
                        </h4>
                        <div className="text-[10px] text-stone-400 dark:text-stone-500">
                          Alış: {formatCurrency(p.buyPrice)} · Satış: {formatCurrency(p.sellPrice)}
                        </div>
                      </div>
                    </div>
                    {p.purity && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#282834] text-stone-600 dark:text-stone-300">
                        {p.purity}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Alış Adet */}
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#202028] border border-stone-200/70 dark:border-[#2C2C38]">
                      <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase mb-1">
                        Alış (Adet)
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Adet girin"
                        value={inputs.buy}
                        onChange={(e) => handleSarrafiyeChange(p.id, 'buy', e.target.value)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-[#15151A] border border-stone-200 dark:border-[#383848] rounded-lg text-xs font-semibold text-stone-900 dark:text-white"
                      />
                      <div className="text-xs font-bold text-stone-800 dark:text-white mt-1.5 flex justify-between">
                        <span className="text-[10px] text-stone-400 font-normal">Tutar:</span>
                        <span>{formatCurrency(buyTotal)}</span>
                      </div>
                    </div>

                    {/* Satış Adet */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-[#14261C] border border-emerald-200/60 dark:border-[#254A36]">
                      <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1">
                        Satış (Adet)
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Adet girin"
                        value={inputs.sell}
                        onChange={(e) => handleSarrafiyeChange(p.id, 'sell', e.target.value)}
                        className="w-full py-1.5 px-2 bg-white dark:bg-[#15151A] border border-stone-200 dark:border-[#383848] rounded-lg text-xs font-semibold text-emerald-900 dark:text-emerald-300"
                      />
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-1.5 flex justify-between">
                        <span className="text-[10px] text-stone-400 font-normal">Tutar:</span>
                        <span>{formatCurrency(sellTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Floating Summary Bar if any amount entered */}
      {hasAnyInput && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-stone-900 via-[#1C1A17] to-amber-950 text-white rounded-2xl p-3 sm:p-4 shadow-xl pointer-events-auto border border-amber-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex-1">
              <div className="text-[10px] text-amber-200/80 uppercase font-semibold">
                İşlem Özeti Toplamı
              </div>
              <div className="flex items-baseline gap-3">
                <div>
                  <span className="text-[10px] text-stone-300">Alış: </span>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {formatCurrency(totalBuyAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-300">Satış: </span>
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">
                    {formatCurrency(totalSellAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-calc-reset"
                onClick={resetAll}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 text-xs transition-colors"
                title="Tümünü Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                id="btn-calc-share"
                onClick={handleShareSummary}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1 shadow-md transition-colors"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-950" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Paylaş</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
