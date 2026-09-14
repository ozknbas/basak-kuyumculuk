import { PriceAlarm, PushNotificationPayload } from '../types';
import { formatCurrency } from './formatters';

const STORAGE_KEY = 'basak_gold_price_alarms_v1';

// Initial default alarms if none exist
const DEFAULT_ALARMS: PriceAlarm[] = [
  {
    id: 'alarm-default-1',
    target: 6850,
    direction: 'above',
    createdAt: Date.now() - 3600000,
    active: true,
  },
  {
    id: 'alarm-default-2',
    target: 6700,
    direction: 'below',
    createdAt: Date.now() - 7200000,
    active: true,
  },
];

export function loadSavedAlarms(): PriceAlarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSavedAlarms(DEFAULT_ALARMS);
      return DEFAULT_ALARMS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.error('Failed to load alarms:', err);
  }
  return DEFAULT_ALARMS;
}

export function saveSavedAlarms(alarms: PriceAlarm[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch (err) {
    console.error('Failed to save alarms:', err);
  }
}

/**
 * Check if the browser supports native push notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Play a crystal-clear pleasant golden chime sound via Web Audio API
 * Works on Apple iOS & Android without needing external audio files
 */
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // First pleasant tone (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.65);

    // Second chime tone (G#5 - 830.61 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.35, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.95);

    // Third sparkle tone (B5 - 987.77 Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(987.77, now + 0.24);
    gain3.gain.setValueAtTime(0.001, now + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.4, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.24);
    osc3.stop(now + 1.25);
  } catch (e) {
    console.warn('Audio playback not permitted or unavailable:', e);
  }
}

/**
 * Trigger mobile haptic vibration for Android and supported devices
 */
export function triggerHapticFeedback(): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 60, 180, 60, 240]);
    }
  } catch {
    // ignore
  }
}

/**
 * Send a native browser push notification (Apple / Android / Desktop)
 */
export function sendNativePushNotification(payload: PushNotificationPayload): void {
  if (!isNotificationSupported()) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        tag: payload.id,
      });
    } catch {
      // Fallback for mobile devices where new Notification() requires service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(payload.title, {
            body: payload.body,
            icon: '/favicon.ico',
            tag: payload.id,
          });
        }).catch(() => {
          // ignore
        });
      }
    }
  }
}

/**
 * Check all active alarms against the current Has Altın price
 * Returns any triggered notifications and updates stored alarms
 */
export function checkAlarmsAgainstPrice(
  currentPrice: number,
  alarms: PriceAlarm[],
  onTriggered: (payload: PushNotificationPayload) => void
): { updatedAlarms: PriceAlarm[]; hasChanges: boolean } {
  let hasChanges = false;
  const now = Date.now();

  const updatedAlarms = alarms.map((alarm) => {
    if (!alarm.active) return alarm;

    // Prevent re-triggering within 3 minutes for same alarm
    if (alarm.lastTriggeredAt && now - alarm.lastTriggeredAt < 180000) {
      return alarm;
    }

    let isTriggered = false;
    let reasonText = '';

    if (alarm.direction === 'above' && currentPrice >= alarm.target) {
      isTriggered = true;
      reasonText = `Has Altın hedef fiyatınızın (${formatCurrency(alarm.target)}) üzerine çıktı!`;
    } else if (alarm.direction === 'below' && currentPrice <= alarm.target) {
      isTriggered = true;
      reasonText = `Has Altın hedef fiyatınızın (${formatCurrency(alarm.target)}) altına düştü!`;
    }

    if (isTriggered) {
      hasChanges = true;
      const payload: PushNotificationPayload = {
        id: `alarm-trig-${alarm.id}-${now}`,
        title: '👑 BAŞAK KUYUMCULUK · FİYAT ALARMI',
        body: `🚨 ${reasonText} Güncel Fiyat: ${formatCurrency(currentPrice, 2)}`,
        timestamp: now,
        type: 'alarm',
        targetPrice: alarm.target,
        currentPrice: currentPrice,
      };

      // Sound & Vibration
      playNotificationSound();
      triggerHapticFeedback();

      // Native Browser Push (Apple / Android)
      sendNativePushNotification(payload);

      // In-app Top Banner
      onTriggered(payload);

      return {
        ...alarm,
        lastTriggeredAt: now,
      };
    }

    return alarm;
  });

  if (hasChanges) {
    saveSavedAlarms(updatedAlarms);
    return { updatedAlarms, hasChanges: true };
  }

  return { updatedAlarms: alarms, hasChanges: false };
}
