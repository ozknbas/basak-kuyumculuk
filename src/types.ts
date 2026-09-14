export type NavTab = 'sarrafiye' | 'hesap' | 'firsat' | 'iban' | 'bildirim' | 'iletisim';

export type ProductCategory = 'gram' | 'yeni' | 'eski' | 'firsat';

export interface CartItem {
  productId: string;
  name: string;
  code: string;
  type: 'sell' | 'buy'; // 'sell': customer buys from store; 'buy': customer sells to store
  price: number;
  quantity: number;
  category?: ProductCategory;
}

export interface GoldProduct {
  id: string;
  name: string;
  category: ProductCategory;
  buyPrice: number;
  sellPrice: number;
  changePercent?: number;
  isUp?: boolean;
  code: string;
  purity?: string;
  badgeCount?: number;
  unit?: string;
}

export interface ScrapRate {
  karat: number;
  name: string;
  buyPrice: number;
  sellPrice: number;
  purity: number; // e.g. 0.995, 0.916, 0.750, 0.585, 0.333
}

export interface IbanItem {
  id: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  branchName?: string;
  branchCode?: string;
  accountNo?: string;
  currency: string;
  pastelBg: string;
  accentColor: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  date: string;
  time: string;
  message: string;
  type: 'market' | 'announcement' | 'alert';
  read: boolean;
}

export interface ScrapCalculation {
  [karat: number]: {
    buyGrams: number;
    sellGrams: number;
  };
}

export interface SarrafiyeCalculation {
  [productId: string]: {
    buyCount: number;
    sellCount: number;
  };
}

export interface PriceMultiplierItem {
  id: string;
  name: string;
  category: 'gram' | 'yeni' | 'eski' | 'hurda';
  buyMultiplier: number;
  sellMultiplier: number;
  unit?: string;
  note?: string;
}

export type PriceMultipliersConfig = Record<string, PriceMultiplierItem>;

export interface FirsatProduct {
  id: string;
  name: string;
  weight: string;
  price: number;
  imageUrl: string;
  tag?: string;
}

export interface PriceAlarm {
  id: string;
  target: number;
  direction: 'above' | 'below';
  createdAt: number;
  lastTriggeredAt?: number;
  active: boolean;
}

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  type?: 'alarm' | 'price' | 'announcement';
  targetPrice?: number;
  currentPrice?: number;
}
