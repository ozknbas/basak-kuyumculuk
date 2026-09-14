import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, Sparkles, Megaphone, CheckCheck, Plus, Clock, Smartphone, Volume2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NotificationItem, PriceAlarm, PushNotificationPayload } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notificationService';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  hasAltinPrice: number;
  savedAlarms: PriceAlarm[];
  onAddAlarm: (target: number, direction: 'above' | 'below') => void;
  onRemoveAlarm: (id: string) => void;
  onTestNotification: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  hasAltinPrice,
  savedAlarms,
  onAddAlarm,
  onRemoveAlarm,
  onTestNotification,
}) => {
  const [alarmTarget, setAlarmTarget] = useState<string>('');
  const [alarmDirection, setAlarmDirection] = useState<'above' | 'below'>('above');
  const [alarmSuccess, setAlarmSuccess] = useState(false);
  const [permission, setPermission] = useState<string>('default');

  useEffect(() => {
    setPermission(getNotificationPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = alarmTarget.replace(/[^0-9.,]/g, '').replace(',', '.');
    const val = parseFloat(cleanVal);
    if (!val || val <= 0) return;

    onAddAlarm(val, alarmDirection);
    setAlarmTarget('');
    setAlarmSuccess(true);
    setTimeout(() => setAlarmSuccess(false), 3000);
  };

  return (
    <div className="w-full px-4 mb-28 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-amber-100 dark:border-[#2E2E38] shadow-[0_4px_24px_-4px_rgba(212,175,55,0.08)] mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-800 dark:text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="font-serif-luxury text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
              Duyuru & Bildirimler
            </h2>
          </div>

          <button
            onClick={onMarkAllRead}
            className="text-xs text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Okundu Yap</span>
          </button>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mt-1">
          Piyasa analizleri, canlı fiyat hedefleri ve Apple/Android anlık bildirimleri.
        </p>
      </div>

      {/* Fiyat Alarmı Kurma Kutusu */}
      <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] dark:from-[#201D17] dark:via-[#1D1914] dark:to-[#171410] rounded-3xl p-4 sm:p-5 border border-amber-200/90 dark:border-amber-800/40 shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-950 dark:text-amber-300 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>ALTIN FİYAT ALARMI KUR</span>
          </div>
          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">
            Şu an: <strong className="text-amber-950 dark:text-amber-300 font-bold">{formatCurrency(hasAltinPrice, 2)}</strong>
          </span>
        </div>

        <form onSubmit={handleCreateAlarm} className="mt-3 space-y-3">
          {/* Radio / Pill Selector (📈 Üzerine Çıkınca | 📉 Altına Düşünce) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-alarm-above"
              onClick={() => setAlarmDirection('above')}
              className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                alarmDirection === 'above'
                  ? 'bg-[#FEE685] dark:bg-[#C99E32] text-stone-900 dark:text-stone-950 border border-amber-400 shadow-xs ring-1 ring-amber-300'
                  : 'bg-white/90 dark:bg-[#282624] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-[#322F2B]'
              }`}
            >
              <span>📈</span>
              <span>Üzerine Çıkınca</span>
            </button>
            <button
              type="button"
              id="btn-alarm-below"
              onClick={() => setAlarmDirection('below')}
              className={`py-2 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                alarmDirection === 'below'
                  ? 'bg-[#FEE685] dark:bg-[#C99E32] text-stone-900 dark:text-stone-950 border border-amber-400 shadow-xs ring-1 ring-amber-300'
                  : 'bg-white/90 dark:bg-[#282624] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 hover:bg-white dark:hover:bg-[#322F2B]'
              }`}
            >
              <span>📉</span>
              <span>Altına Düşünce</span>
            </button>
          </div>

          {/* Input & + Kur Button */}
          <div className="flex items-center gap-2">
            <input
              id="input-alarm-target"
              type="text"
              inputMode="decimal"
              placeholder="Hedef Has Altın Fiyatı (örn. 6850)"
              value={alarmTarget}
              onChange={(e) => setAlarmTarget(e.target.value)}
              className="flex-1 py-2.5 px-3.5 bg-white dark:bg-[#15151A] border border-amber-200/90 dark:border-[#383848] rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
            />
            <button
              id="btn-submit-alarm"
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-[#672608] dark:bg-[#B87333] hover:bg-[#521E06] dark:hover:bg-[#A36329] text-[#FFF9F2] text-xs sm:text-sm font-black transition-all shrink-0 flex items-center gap-1 shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Kur</span>
            </button>
          </div>

          {alarmSuccess && (
            <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Fiyat alarmınız kuruldu! Hedefe ulaşıldığında yukarıdan bildirim gelecektir.</span>
            </div>
          )}
        </form>

        {/* Aktif Alarmlarınız listesi */}
        <div className="mt-3.5 pt-3 border-t border-amber-200/70 dark:border-amber-800/40 space-y-1.5">
          <div className="text-[10px] text-amber-900/80 dark:text-amber-400 font-bold uppercase tracking-wider">
            AKTİF ALARMLARINIZ:
          </div>
          {savedAlarms.length === 0 ? (
            <div className="text-xs text-stone-400 dark:text-stone-500 italic py-1">Henüz kurulmuş fiyat alarmı yok.</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {savedAlarms.map((alarm) => (
                <div
                  key={alarm.id}
                  id={`alarm-badge-${alarm.id}`}
                  className="px-3 py-1 rounded-full bg-white dark:bg-[#2A2318] border border-amber-200 dark:border-amber-700/60 text-xs font-bold text-stone-800 dark:text-amber-200 flex items-center gap-2 shadow-2xs hover:border-amber-400 transition-colors"
                >
                  <span className="text-amber-800 dark:text-amber-300">
                    {alarm.direction === 'above' ? '▲' : '▼'} {formatCurrency(alarm.target)}
                  </span>
                  <button
                    onClick={() => onRemoveAlarm(alarm.id)}
                    className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 font-bold ml-0.5 text-xs transition-colors cursor-pointer"
                    title="Alarmı Sil"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Apple & Android Push Notification Permission & Test Box */}
        <div className="mt-4 pt-3 border-t border-amber-200/70 dark:border-amber-800/40 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <Smartphone className="w-4 h-4 text-stone-800 dark:text-stone-200" />
              <span>Apple (iOS) & Android Bildirimleri:</span>
            </div>

            {permission === 'granted' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                İzin Aktif
              </span>
            ) : (
              <button
                type="button"
                id="btn-request-push-perm"
                onClick={handleRequestPermission}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-900 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <Bell className="w-3 h-3 text-amber-900 dark:text-amber-200" />
                Bildirim İzni Ver
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
              Fiyat hedefinize ulaşıldığında sesli, titreşimli ve yukarıdan düşen bildirim penceresi açılır.
            </p>

            <button
              type="button"
              id="btn-test-top-notification"
              onClick={onTestNotification}
              className="shrink-0 text-[11px] font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#2A2A36] hover:bg-stone-50 dark:hover:bg-[#343444] border border-stone-300 dark:border-[#404052] px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title="Yukarıdan düşen bildirimi test et"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Bildirim Testi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mağaza ve Piyasa Bildirim Listesi */}
      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border transition-all ${
              !item.read
                ? 'border-amber-300 dark:border-amber-500/50 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                : 'border-stone-200/70 dark:border-[#2E2E38] shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  item.type === 'market'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                  {item.type === 'market' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <Megaphone className="w-3.5 h-3.5" />
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 font-mono whitespace-nowrap">
                <Clock className="w-2.5 h-2.5" />
                <span>{item.time}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed pl-9">
              {item.message}
            </p>

            <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 pl-9 mt-2 pt-2 border-t border-stone-100 dark:border-[#252530]">
              <span>{item.date}</span>
              {!item.read && (
                <span className="text-amber-800 dark:text-amber-400 font-semibold">Yeni Bildirim</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
