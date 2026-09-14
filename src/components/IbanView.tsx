import React, { useState } from 'react';
import { CreditCard, Copy, Check, Building2, AlertCircle, ShieldCheck, User } from 'lucide-react';
import { IBAN_LIST } from '../data/initialData';
import { copyToClipboard } from '../utils/formatters';

export const IbanView: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, textToCopy: string) => {
    copyToClipboard(textToCopy).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="w-full px-4 mb-24 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-5 border border-amber-100 dark:border-[#2E2E38] shadow-[0_4px_24px_-4px_rgba(212,175,55,0.08)] mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-400">
            <CreditCard className="w-4 h-4" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            Banka & IBAN Bilgileri
          </h2>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-1">
          Resmi hesaplarımıza güvenle havale/EFT yapabilir, Alıcı Adı ve IBAN numaralarını tek tıkla kopyalayabilirsiniz.
        </p>
      </div>

      {/* IBAN Cards List */}
      <div className="space-y-3">
        {IBAN_LIST.map((account) => {
          const isIbanCopied = copiedId === `iban-${account.id}`;
          const isCardNameCopied = copiedId === `name-${account.id}`;

          return (
            <div
              key={account.id}
              id={`iban-card-${account.id}`}
              className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-stone-200/70 dark:border-[#2E2E38] shadow-2xs hover:border-amber-200 dark:hover:border-amber-500/40 transition-all relative overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-[#252530]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-[#252530] border border-stone-200/80 dark:border-[#383848] flex items-center justify-center text-stone-700 dark:text-stone-200">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {account.bankName}
                    </h3>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                      {account.branchName} ({account.currency})
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#282834] text-stone-600 dark:text-stone-300">
                  {account.currency.includes('ALTIN') ? 'Altın Hesabı' : 'TL Hesabı'}
                </span>
              </div>

              {/* Recipient / Account Holder Row with Copy */}
              <div className="p-2.5 px-3 rounded-2xl bg-[#FCFAF7] dark:bg-[#202028] border border-stone-200/80 dark:border-[#2C2C38] flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">
                      ALICI ADI
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      {account.accountHolder}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-copy-name-${account.id}`}
                  onClick={() => handleCopy(`name-${account.id}`, account.accountHolder)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                    isCardNameCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-[#2B2B38] hover:bg-stone-200 dark:hover:bg-[#343444] text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-[#444458]'
                  }`}
                >
                  {isCardNameCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>İsmi Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              {/* IBAN Box with Copy Action */}
              <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#202028] border border-stone-200/70 dark:border-[#2C2C38] flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">
                    IBAN NUMARASI
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 tracking-wide select-all truncate">
                    {account.iban}
                  </div>
                </div>

                <button
                  id={`btn-copy-${account.id}`}
                  onClick={() => handleCopy(`iban-${account.id}`, account.iban)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    isIbanCopied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-amber-100 dark:bg-[#2C2214] hover:bg-amber-200/80 dark:hover:bg-[#3B2D18] text-amber-950 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700/60'
                  }`}
                >
                  {isIbanCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>IBAN Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              {/* Branch details footer */}
              <div className="grid grid-cols-2 text-[10px] text-stone-500 dark:text-stone-400 pt-1 px-1">
                <div>
                  <span className="text-stone-400 dark:text-stone-500">Şube Kodu: </span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{account.branchCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 dark:text-stone-500">Hesap No: </span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">{account.accountNo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning & Instructions Note */}
      <div className="bg-red-50/90 dark:bg-[#2A1516] rounded-2xl p-4 border border-red-200 dark:border-[#522426] mt-4 text-xs text-red-950 dark:text-red-200 space-y-2 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-red-900 dark:text-red-400 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>Önemli Havale / EFT Hatırlatmaları</span>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-[11px] sm:text-xs leading-relaxed text-red-900/90 dark:text-red-200/90 font-medium">
          <li>FAST ile 7/24 anında 300.000 TL'ye kadar transfer yapabilirsiniz.</li>
          <li>36.000 TL üzeri TC Kimlik numarası zorunludur.</li>
          <li>Sipariş fişini Whatsapp üzerinden gönderiniz.</li>
          <li>Ödeme yapmadan önce STOK sorunuz.</li>
          <li>Kapınıza teslimatlar sınırlıdır.</li>
        </ul>
      </div>
    </div>
  );
};

