import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  X,
  User,
  Phone,
  MapPin,
  Building2,
  AlertCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CustomerOrderInfo, loadCustomerInfo, saveCustomerInfo } from '../utils/customerStorage';
import { CustomerOrderModal } from './CustomerOrderModal';
import { isCartEligibleForInstallment } from '../utils/installmentRules';

interface FloatingCartMenuProps {
  cart: Record<string, CartItem>;
  lastAddedNotification: { name: string; timestamp: number } | null;
  onUpdateQuantity: (productId: string, type: 'sell' | 'buy', delta: number) => void;
  onRemoveItem: (productId: string, type: 'sell' | 'buy') => void;
  onClearCart: () => void;
  onCloseNotification: () => void;
}

export const FloatingCartMenu: React.FC<FloatingCartMenuProps> = ({
  cart,
  lastAddedNotification,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCloseNotification,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'nakit' | 'kart' | 'taksit'>('nakit');
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>(loadCustomerInfo);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setCustomerInfo(loadCustomerInfo());
  }, []);

  const cartItems: CartItem[] = Object.values(cart);
  const totalItems: number = cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

  // 3 Taksit Eligibility Check
  const { isEligible: canUseInstallment, ineligibleItems } = isCartEligibleForInstallment(cartItems);

  // If cart becomes ineligible while 3 taksit is selected, fall back to nakit
  useEffect(() => {
    if (paymentMethod === 'taksit' && !canUseInstallment) {
      setPaymentMethod('nakit');
    }
  }, [canUseInstallment, paymentMethod]);

  // Calculate totals:
  const salesTotal: number = cartItems
    .filter((i) => i.type === 'sell')
    .reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

  const buysTotal: number = cartItems
    .filter((i) => i.type === 'buy')
    .reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);

  const netDifference: number = salesTotal - buysTotal;
  const isNetPayout: boolean = buysTotal > salesTotal;
  const netPayable: number = Math.max(0, netDifference);

  // Card & Installment calculations (only apply when customer is paying/purchasing)
  const cardTotal = Math.round(netPayable * 1.04);
  const installmentTotal = Math.round(netPayable * 1.08);

  const getFinalAmount = () => {
    if (isNetPayout) {
      return netDifference; // negative amount
    }
    if (paymentMethod === 'kart') return cardTotal;
    if (paymentMethod === 'taksit' && canUseInstallment) return installmentTotal;
    return netPayable;
  };

  const getFinalAmountFormatted = () => {
    if (isNetPayout) {
      return `- ${formatCurrency(Math.abs(netDifference))}`;
    }
    return formatCurrency(getFinalAmount());
  };

  const handleFieldChange = (field: keyof CustomerOrderInfo, val: string) => {
    setCustomerInfo((prev) => {
      const updated = { ...prev, [field]: val };
      saveCustomerInfo(updated);
      return updated;
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleSendWhatsApp = () => {
    if (!customerInfo.fullName.trim()) {
      setErrorMessage('Lütfen Ad Soyad alanını doldurunuz.');
      setIsDrawerOpen(true);
      return;
    }

    if (!customerInfo.phone.trim()) {
      setErrorMessage('Lütfen Telefon alanını doldurunuz.');
      setIsDrawerOpen(true);
      return;
    }

    if (!isNetPayout && paymentMethod === 'taksit' && !canUseInstallment) {
      setErrorMessage('Sarrafiye ve 24 Ayar Gram altın ürünlerinde 3 taksit uygulanamaz.');
      setIsDrawerOpen(true);
      return;
    }

    saveCustomerInfo(customerInfo);

    let paymentText = 'Nakit / Havale / FAST';
    if (!isNetPayout) {
      if (paymentMethod === 'kart') paymentText = 'Kredi Kartı Tek Çekim (+%4)';
      if (paymentMethod === 'taksit') paymentText = '3 Taksit (+%8)';
    } else {
      paymentText = 'Nakit / Havale (Müşteriye Ödeme)';
    }

    const lines = [
      isNetPayout ? '👑 *BAŞAK KUYUMCULUK - ALTIN BOZDURMA TALEBİ*' : '👑 *BAŞAK KUYUMCULUK - YENİ SİPARİŞ*',
      '--------------------------------',
      '📋 *MÜŞTERİ BİLGİLERİ*',
      `• *Ad Soyad:* ${customerInfo.fullName.trim()}`,
      `• *Telefon:* ${customerInfo.phone.trim()}`,
      customerInfo.tcNo.trim() ? `• *TC(isteğe bağlı):* ${customerInfo.tcNo.trim()}` : null,
      customerInfo.address.trim() ? `• *Adres(isteğe bağlı):* ${customerInfo.address.trim()}` : null,
      customerInfo.iban.trim() ? `• *Müşteri IBAN:* ${customerInfo.iban.trim()}` : null,
      '--------------------------------',
      `💳 *Ödeme Tercihi:* ${paymentText}`,
      '--------------------------------',
      '📦 *İŞLEM DETAYLARI*',
      ...cartItems.map((item) => {
        const typeLabel = item.type === 'sell' ? 'Satın Alma' : 'Bozdurma';
        const sign = item.type === 'sell' ? '+' : '-';
        return `• ${item.quantity}x ${item.name} (${typeLabel}) = ${sign}${formatCurrency(item.price * item.quantity)}`;
      }),
      salesTotal > 0 && buysTotal > 0 ? `\n🛒 *Toplam Satış (Alınan):* +${formatCurrency(salesTotal)}` : null,
      salesTotal > 0 && buysTotal > 0 ? `💰 *Toplam Bozdurulan:* -${formatCurrency(buysTotal)}` : null,
      '--------------------------------',
      isNetPayout
        ? `✨ *MÜŞTERİYE ÖDENECEK NET TUTAR:* - ${formatCurrency(Math.abs(netDifference))}`
        : `✨ *NET ÖDENECEK TUTAR:* ${formatCurrency(getFinalAmount())}`,
      '--------------------------------',
      !isNetPayout ? '🏦 *Garanti BBVA IBAN:* TR81 0006 2000 7030 0006 2998 75\nHesap Sahibi: Zekai Baş' : '🏦 Ödeme mağazamızda elden nakit veya bildirilen IBAN hesabınıza derhal yapılacaktır.',
      isNetPayout ? '\nLütfen bozdurma talebimi onaylayıp işleme alınız.' : '\nLütfen siparişimi onaylayıp işleme alınız.',
    ].filter(Boolean);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/905314917152?text=${encoded}`, '_blank');
  };

  if (totalItems === 0 && !lastAddedNotification) {
    return null;
  }

  return (
    <>
      {/* Floating Bar Container - Docked directly above BottomNav */}
      <div className="fixed bottom-[68px] sm:bottom-[72px] left-0 right-0 max-w-lg mx-auto px-3 z-40 pointer-events-auto">
        
        {/* Quick Pop-up Pill: "Sepete Eklendi" Toast */}
        {lastAddedNotification && (
          <div className="mb-2 flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950/95 text-emerald-100 border border-emerald-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <span className="font-bold text-white">{lastAddedNotification.name}</span> sepete eklendi
              </span>
            </div>
            <button
              onClick={onCloseNotification}
              className="p-1 text-emerald-300/70 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Floating Cart Pill */}
        {totalItems > 0 && (
          <div className="rounded-2xl bg-stone-900/95 text-white border border-amber-500/40 shadow-2xl backdrop-blur-md overflow-hidden animate-in slide-in-from-bottom-3 duration-200">
            
            {/* Top Prompt Banner: "Sipariş oluşturmak için lütfen dokunun" */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-[11px] sm:text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 tracking-wide transition-all shadow-inner uppercase cursor-pointer"
            >
              <span>✨ Sipariş oluşturmak için lütfen dokunun</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
              {/* Left: Cart Info & Toggle */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center gap-2.5 text-left focus:outline-none flex-1 min-w-0"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-rose-600 text-white font-black text-[11px] flex items-center justify-center border-2 border-stone-900 shadow-md">
                    {totalItems}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                      Sepet ({totalItems} Ürün)
                    </span>
                    {isDrawerOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-serif-luxury font-black text-white truncate">
                    {getFinalAmountFormatted()}
                  </div>
                </div>
              </button>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold transition-colors border border-stone-700 cursor-pointer"
                >
                  Detay
                </button>
                <button
                  type="button"
                  id="btn-cart-order-direct"
                  onClick={() => setIsModalOpen(true)}
                  className={`py-2 px-3 sm:px-4 rounded-xl text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                    isNetPayout
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
                  }`}
                >
                  <span>{isNetPayout ? 'Bozdurma Yap' : 'Sipariş Ver'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Bottom Drawer / Modal */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#FAF7F0] rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col shadow-2xl border border-stone-300 overflow-hidden animate-in slide-in-from-bottom duration-300 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-stone-900 leading-tight">
                    Sepetiniz ({totalItems} Ürün)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Başak Kuyumculuk · Kartal / İstanbul
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Temizle</span>
                </button>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Product List */}
              <div className="space-y-2">
                {cartItems.map((item) => {
                  const isSell = item.type === 'sell';
                  const lineTotal = item.price * item.quantity;

                  return (
                    <div
                      key={`${item.productId}-${item.type}`}
                      className="p-2.5 rounded-2xl bg-white border border-[#EAE5DC] flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {item.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                              isSell
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isSell ? 'Satın Alma' : 'Bozdurma'}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Birim: {formatCurrency(item.price)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.type, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center shadow-2xs hover:bg-stone-50 active:scale-95 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.type, 1)}
                            className="w-6 h-6 rounded-lg bg-white text-stone-700 flex items-center justify-center shadow-2xs hover:bg-stone-50 active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right min-w-[70px]">
                          <div className={`text-xs font-bold font-mono ${isSell ? 'text-stone-900' : 'text-rose-700'}`}>
                            {!isSell && '- '}{formatCurrency(lineTotal)}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.productId, item.type)}
                          className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtotal Summary */}
              <div className="p-3 rounded-2xl bg-white border border-[#EAE5DC] space-y-1.5 text-xs">
                {salesTotal > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Toplam Satış (Alınan)</span>
                    <span className="font-bold text-stone-900">+{formatCurrency(salesTotal)}</span>
                  </div>
                )}
                {buysTotal > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Toplam Alış (Bozdurulan)</span>
                    <span className="font-bold text-rose-700">- {formatCurrency(buysTotal)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline font-bold">
                  <span className="text-stone-800 text-xs">
                    {isNetPayout ? 'Müşteriye Ödenecek Net Tutar (Bozdurma)' : 'Net Ödenecek / Tahsilat'}
                  </span>
                  <span className={`text-base font-serif-luxury ${isNetPayout ? 'text-rose-700 font-black' : 'text-stone-900'}`}>
                    {getFinalAmountFormatted()}
                  </span>
                </div>
              </div>

              {/* Payment Method Cards */}
              {isNetPayout ? (
                /* Pure Bozdurma / Payout Payment Method: ONLY Nakit & Havale */
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                    Bozdurma Ödeme Yöntemi
                  </label>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-400 ring-2 ring-emerald-200/80 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>NAKİT / HAVALE (FAST) İLE ÖDEME</span>
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-1">
                          Altın bozdurma tutarınız mağazamızda <strong>anında elden nakit</strong> veya <strong>IBAN hesabınıza FAST/Havale</strong> ile ödenir.
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-rose-700 font-mono bg-white px-2 py-1 rounded-lg border border-emerald-200">
                          - {formatCurrency(Math.abs(netDifference))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Customer Buying Gold: Show Nakit, Kart and Installment Options */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                      Ödeme Yöntemi Seçiniz
                    </label>
                    {!canUseInstallment && (
                      <span className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                        <Info className="w-3 h-3 text-amber-700" />
                        3 Taksit: 22 Ayar & Fırsat ürünlerinde geçerlidir
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nakit')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'nakit'
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                          : 'bg-white border-[#EAE5DC] hover:border-stone-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">HAVALE / NAKİT</div>
                      <div className="text-xs font-black text-stone-900 mt-0.5">
                        {formatCurrency(netPayable)}
                      </div>
                      <div className="text-[9px] text-stone-500">Komisyonsuz</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('kart')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'kart'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                          : 'bg-white border-[#EAE5DC] hover:border-stone-300'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-amber-900 uppercase">KART (+%4)</div>
                      <div className="text-xs font-black text-stone-900 mt-0.5">
                        {formatCurrency(cardTotal)}
                      </div>
                      <div className="text-[9px] text-stone-500">Tek Çekim</div>
                    </button>

                    <button
                      type="button"
                      disabled={!canUseInstallment}
                      onClick={() => {
                        if (canUseInstallment) {
                          setPaymentMethod('taksit');
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        !canUseInstallment
                          ? 'bg-stone-100/80 border-stone-200 opacity-60 cursor-not-allowed'
                          : paymentMethod === 'taksit'
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 cursor-pointer'
                          : 'bg-white border-[#EAE5DC] hover:border-stone-300 cursor-pointer'
                      }`}
                    >
                      <div
                        className={`text-[10px] font-bold uppercase ${
                          !canUseInstallment ? 'text-stone-400' : 'text-indigo-900'
                        }`}
                      >
                        3 TAKSİT (+%8)
                      </div>
                      <div
                        className={`text-xs font-black mt-0.5 ${
                          !canUseInstallment ? 'text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {formatCurrency(installmentTotal)}
                      </div>
                      <div className="text-[9px]">
                        {!canUseInstallment ? (
                          <span className="text-rose-600 font-bold">Kapalı</span>
                        ) : (
                          <span className="text-stone-500">Tüm Kartlar</span>
                        )}
                      </div>
                    </button>
                  </div>

                  {!canUseInstallment && ineligibleItems.length > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-1.5 text-[11px] text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>
                        Sepetinizdeki <strong>Sarrafiye / 24 Ayar Gram</strong> ürünleri mevzuat gereği 3 taksite kapalıdır. 3 taksit yalnızca <strong>22 Ayar Gram</strong>, <strong>22 Ayar Bilezik</strong> ve <strong>Fırsat Ürünleri</strong>nde geçerlidir.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* MÜŞTERİ BİLGİLERİ SECTION */}
              <div className="bg-white border border-[#EAE5DC] rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-800" />
                    <h4 className="text-xs font-serif-luxury font-bold tracking-wider text-amber-950 uppercase">
                      MÜŞTERİ BİLGİLERİ
                    </h4>
                  </div>
                  <span className="text-[10px] text-stone-400">* Zorunlu alanlar</span>
                </div>

                {/* Ad Soyad* */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Ad Soyad <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cart-customer-fullname"
                      value={customerInfo.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      placeholder="Adınız ve Soyadınız"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* Telefon* */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Telefon <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="cart-customer-phone"
                      value={customerInfo.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* TC (isteğe bağlı) */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    TC Kimlik No <span className="text-stone-400 font-normal">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    id="cart-customer-tc"
                    value={customerInfo.tcNo}
                    onChange={(e) => handleFieldChange('tcNo', e.target.value)}
                    placeholder="11 Haneli TC Kimlik No"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Adres (isteğe bağlı) */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Teslimat Adresi <span className="text-stone-400 font-normal">(isteğe bağlı)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="cart-customer-address"
                      rows={2}
                      value={customerInfo.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="Teslimat adresi..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                    <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {/* IBAN(isteğe bağlı) */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    IBAN <span className="text-stone-400 font-normal">(isteğe bağlı)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cart-customer-iban"
                      value={customerInfo.iban}
                      onChange={(e) => handleFieldChange('iban', e.target.value)}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono uppercase"
                    />
                    <Building2 className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Big Direct WhatsApp Order Button */}
              <button
                type="button"
                id="btn-whatsapp-cart-submit"
                onClick={handleSendWhatsApp}
                className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isNetPayout
                    ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 shadow-amber-900/20'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-800/20'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  WhatsApp ile {isNetPayout ? 'Bozdurma Talebini' : 'Siparişi'} Gönder ({getFinalAmountFormatted()})
                </span>
              </button>

              <p className="text-[10px] text-center text-stone-500 pb-2">
                {isNetPayout
                  ? 'Bozdurma talebiniz WhatsApp üzerinden mağaza yetkilimize iletilir ve anlık bozdurma kuru kilitlenir.'
                  : 'Siparişiniz WhatsApp üzerinden mağaza yetkilimize iletilir ve anlık fiyat kilitlenir.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Customer Order Modal when clicking "Sipariş Ver" / "Bozdurma Yap" */}
      <CustomerOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={cartItems}
        totalAmount={isNetPayout ? netDifference : netPayable}
        initialPaymentMethod={paymentMethod}
      />
    </>
  );
};
