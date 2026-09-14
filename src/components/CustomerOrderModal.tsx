import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CustomerOrderInfo, loadCustomerInfo, saveCustomerInfo } from '../utils/customerStorage';
import { isCartEligibleForInstallment } from '../utils/installmentRules';

interface CustomerOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  initialPaymentMethod?: 'nakit' | 'kart' | 'taksit';
}

export const CustomerOrderModal: React.FC<CustomerOrderModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  initialPaymentMethod = 'nakit',
}) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>(loadCustomerInfo);
  const [paymentMethod, setPaymentMethod] = useState<'nakit' | 'kart' | 'taksit'>(initialPaymentMethod);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 3 Taksit Eligibility Check
  const { isEligible: canUseInstallment, ineligibleItems } = isCartEligibleForInstallment(cartItems);

  // Totals & Bozdurma Logic
  const salesTotal = cartItems
    .filter((i) => i.type === 'sell')
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  const buysTotal = cartItems
    .filter((i) => i.type === 'buy')
    .reduce((acc, item) => acc + item.price * item.quantity, 0);

  const netDifference = salesTotal - buysTotal;
  const isNetPayout = buysTotal > salesTotal;
  const netPositive = Math.max(0, netDifference);

  useEffect(() => {
    if (isOpen) {
      setCustomerInfo(loadCustomerInfo());
      if (isNetPayout || (initialPaymentMethod === 'taksit' && !canUseInstallment)) {
        setPaymentMethod('nakit');
      } else {
        setPaymentMethod(initialPaymentMethod);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialPaymentMethod, canUseInstallment, isNetPayout]);

  if (!isOpen) return null;

  // Calculate payments for sales
  const cardTotal = Math.round(netPositive * 1.04);
  const installmentTotal = Math.round(netPositive * 1.08);

  const getPayableAmount = () => {
    if (isNetPayout) return netDifference;
    if (paymentMethod === 'kart') return cardTotal;
    if (paymentMethod === 'taksit') return installmentTotal;
    return netPositive;
  };

  const getFormattedPayable = () => {
    if (isNetPayout) {
      return `- ${formatCurrency(Math.abs(netDifference))}`;
    }
    return formatCurrency(getPayableAmount());
  };

  const handleFieldChange = (field: keyof CustomerOrderInfo, value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.fullName.trim()) {
      setErrorMsg('Lütfen "Ad Soyad" alanını doldurunuz.');
      return;
    }

    if (!customerInfo.phone.trim()) {
      setErrorMsg('Lütfen "Telefon" alanını doldurunuz.');
      return;
    }

    if (!isNetPayout && paymentMethod === 'taksit' && !canUseInstallment) {
      setErrorMsg('Sarrafiye ve 24 Ayar Gram altın ürünlerinde 3 taksit uygulanamaz. Lütfen Nakit veya Tek Çekim seçiniz.');
      return;
    }

    // Save to storage for next orders
    saveCustomerInfo(customerInfo);

    // Build WhatsApp message
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
      customerInfo.tcNo.trim() ? `• *TC Kimlik No:* ${customerInfo.tcNo.trim()}` : null,
      customerInfo.address.trim() ? `• *Adres:* ${customerInfo.address.trim()}` : null,
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
        : `✨ *GENEL TOPLAM:* ${formatCurrency(getPayableAmount())}`,
      '--------------------------------',
      !isNetPayout ? '🏦 *Garanti BBVA IBAN:* TR81 0006 2000 7030 0006 2998 75\nHesap Sahibi: Zekai Baş' : '🏦 Ödeme mağazamızda elden nakit veya bildirilen IBAN hesabınıza derhal yapılacaktır.',
      isNetPayout ? '\nBozdurma talebimi teyit etmek ve işleme aldırmak istiyorum.' : '\nSiparişimi teyit etmek ve işleme aldırmak istiyorum.',
    ].filter(Boolean);

    const whatsappText = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/905314917152?text=${whatsappText}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#FAF7F2] border border-amber-900/20 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-lg sm:text-xl text-amber-950 tracking-tight leading-tight">
                {isNetPayout ? 'BOZDURMA TALEBİ' : 'MÜŞTERİ BİLGİLERİ'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {isNetPayout ? 'Bozdurma işlemini tamamlamak için bilgilerinizi giriniz' : 'Siparişinizi tamamlamak için lütfen bilgilerinizi giriniz'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Order Summary Mini Banner */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-800">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Adet Ürün Seçildi
                </span>
                <p className="text-[10px] text-stone-400">Başak Kuyumculuk Güvencesiyle</p>
              </div>
            </div>
            <div className={`font-serif-luxury font-bold text-base ${isNetPayout ? 'text-rose-700 font-black' : 'text-amber-950'}`}>
              {getFormattedPayable()}
            </div>
          </div>

          {/* Payment Method Selector */}
          {isNetPayout ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                Bozdurma Ödeme Yöntemi
              </label>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-400 ring-2 ring-emerald-200/80">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span>NAKİT / HAVALE (FAST)</span>
                    </div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">
                      Bozdurma bedeli mağazamızda elden nakit veya IBAN hesabınıza anında ödenir.
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-700 font-mono bg-white px-2 py-1 rounded-lg border border-emerald-200">
                      - {formatCurrency(Math.abs(netDifference))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                  Ödeme Yöntemi
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
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'nakit'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">HAVALE / NAKİT</div>
                  <div className="text-xs font-bold text-stone-900 mt-0.5">
                    {formatCurrency(netPositive)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('kart')}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'kart'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="text-[10px] font-bold text-amber-900 uppercase">KART (+%4)</div>
                  <div className="text-xs font-bold text-stone-900 mt-0.5">
                    {formatCurrency(cardTotal)}
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!canUseInstallment}
                  onClick={() => {
                    if (canUseInstallment) {
                      setPaymentMethod('taksit');
                    }
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    !canUseInstallment
                      ? 'bg-stone-100/80 border-stone-200 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'taksit'
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 cursor-pointer'
                      : 'bg-white border-stone-200 cursor-pointer'
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
                    className={`text-xs font-bold mt-0.5 ${
                      !canUseInstallment ? 'text-stone-400' : 'text-stone-900'
                    }`}
                  >
                    {formatCurrency(installmentTotal)}
                  </div>
                  {!canUseInstallment && (
                    <div className="text-[9px] text-rose-600 font-bold mt-0.5">Kapalı</div>
                  )}
                </button>
              </div>

              {!canUseInstallment && ineligibleItems.length > 0 && (
                <div className="mt-1 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-1.5 text-[11px] text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Sepetinizdeki <strong>Sarrafiye / 24 Ayar Gram</strong> ürünleri mevzuat gereği 3 taksite kapalıdır. 3 taksit yalnızca <strong>22 Ayar Gram</strong>, <strong>22 Ayar Bilezik</strong> ve <strong>Fırsat Ürünleri</strong>nde geçerlidir.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMER INFO INPUTS */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-serif-luxury font-bold tracking-wider text-amber-950 uppercase border-b border-stone-100 pb-2">
              MÜŞTERİ BİLGİLERİ
            </h3>

            {/* Ad Soyad* */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Ad Soyad <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-customer-fullname"
                  value={customerInfo.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="Adınız ve Soyadınız"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Telefon* */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Telefon <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="input-customer-phone"
                  value={customerInfo.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="05XX XXX XX XX"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* TC Kimlik No */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                TC Kimlik No <span className="text-stone-400 text-[10px]">(İsteğe bağlı)</span>
              </label>
              <input
                type="text"
                id="input-customer-tc"
                maxLength={11}
                value={customerInfo.tcNo}
                onChange={(e) => handleFieldChange('tcNo', e.target.value)}
                placeholder="11 haneli TC Kimlik No"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            {/* Adres */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Adres <span className="text-stone-400 text-[10px]">(İsteğe bağlı)</span>
              </label>
              <textarea
                id="input-customer-address"
                rows={2}
                value={customerInfo.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="Teslimat adresi"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
              />
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                IBAN <span className="text-stone-400 text-[10px]">(Bozdurma ve İadeler için)</span>
              </label>
              <input
                type="text"
                id="input-customer-iban"
                value={customerInfo.iban}
                onChange={(e) => handleFieldChange('iban', e.target.value)}
                placeholder="TR..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="btn-submit-order"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#075E54] hover:bg-[#128C7E] text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>WhatsApp ile Siparişi Tamamla</span>
          </button>
        </form>
      </div>
    </div>
  );
};
