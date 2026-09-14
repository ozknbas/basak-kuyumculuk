import { PriceMultipliersConfig, GoldProduct, ScrapRate } from '../types';

export const ADMIN_PANEL_PASSWORD = '741258';
export const STORAGE_KEY_MULTIPLIERS = 'basak_gold_multipliers_v1';
export const STORAGE_KEY_FORMULA_ENABLED = 'basak_gold_formula_enabled_v1';

export const DEFAULT_MULTIPLIERS: PriceMultipliersConfig = {
  // 24 AYAR GRAM
  'gram-24': {
    id: 'gram-24',
    name: '24 Ayar Gram Altın',
    category: 'gram',
    buyMultiplier: 0.985,
    sellMultiplier: 1.011,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.985 / Satış: 1.011',
  },
  // 22 AYAR GRAM
  'gram-22': {
    id: 'gram-22',
    name: '22 Ayar Gram Altın',
    category: 'gram',
    buyMultiplier: 0.900,
    sellMultiplier: 0.960,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.900 / Satış: 0.960',
  },
  // 22 AYAR BİLEZİK
  'bilezik-22': {
    id: 'bilezik-22',
    name: '22 Ayar Bilezik',
    category: 'gram',
    buyMultiplier: 0.900,
    sellMultiplier: 0.960,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.900 / Satış: 0.960',
  },

  // YENİ SARRAFİYELER
  'ceyrek-yeni': {
    id: 'ceyrek-yeni',
    name: 'Yeni Çeyrek',
    category: 'yeni',
    buyMultiplier: 1.615,
    sellMultiplier: 1.657,
    unit: '1.75 gr',
    note: 'Has Altın x Alış: 1.615 / Satış: 1.657',
  },
  'yarim-yeni': {
    id: 'yarim-yeni',
    name: 'Yeni Yarım',
    category: 'yeni',
    buyMultiplier: 3.230,
    sellMultiplier: 3.314,
    unit: '3.50 gr',
    note: 'Has Altın x Alış: 3.230 / Satış: 3.314',
  },
  'tam-yeni': {
    id: 'tam-yeni',
    name: 'Yeni Tam',
    category: 'yeni',
    buyMultiplier: 6.360,
    sellMultiplier: 6.628,
    unit: '7.01 gr',
    note: 'Has Altın x Alış: 6.360 / Satış: 6.628',
  },
  'cumhuriyet-ata': {
    id: 'cumhuriyet-ata',
    name: 'Cumhuriyet (Ata)',
    category: 'yeni',
    buyMultiplier: 6.550,
    sellMultiplier: 6.770,
    unit: '7.21 gr',
    note: 'Has Altın x Alış: 6.550 / Satış: 6.770',
  },

  // ESKİ SARRAFİYELER
  'ceyrek-eski': {
    id: 'ceyrek-eski',
    name: 'Eski Çeyrek',
    category: 'eski',
    buyMultiplier: 1.590,
    sellMultiplier: 1.640,
    unit: '1.75 gr',
    note: 'Has Altın x Alış: 1.590 / Satış: 1.640',
  },
  'yarim-eski': {
    id: 'yarim-eski',
    name: 'Eski Yarım',
    category: 'eski',
    buyMultiplier: 3.180,
    sellMultiplier: 3.280,
    unit: '3.50 gr',
    note: 'Has Altın x Alış: 3.180 / Satış: 3.280',
  },
  'tam-eski': {
    id: 'tam-eski',
    name: 'Eski Tam',
    category: 'eski',
    buyMultiplier: 6.360,
    sellMultiplier: 6.560,
    unit: '7.01 gr',
    note: 'Has Altın x Alış: 6.360 / Satış: 6.560',
  },

  // HURDA ALTIN AYARLARI
  'hurda-24': {
    id: 'hurda-24',
    name: '24 Ayar Hurda',
    category: 'hurda',
    buyMultiplier: 0.985,
    sellMultiplier: 1.011,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.985 / Satış: 1.011',
  },
  'hurda-22': {
    id: 'hurda-22',
    name: '22 Ayar Hurda',
    category: 'hurda',
    buyMultiplier: 0.900,
    sellMultiplier: 0.960,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.900 / Satış: 0.960',
  },
  'hurda-18': {
    id: 'hurda-18',
    name: '18 Ayar Hurda',
    category: 'hurda',
    buyMultiplier: 0.700,
    sellMultiplier: 0.750,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.700 / Satış: 0.750',
  },
  'hurda-14': {
    id: 'hurda-14',
    name: '14 Ayar Hurda',
    category: 'hurda',
    buyMultiplier: 0.530,
    sellMultiplier: 0.585,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.530 / Satış: 0.585',
  },
  'hurda-8': {
    id: 'hurda-8',
    name: '8 Ayar Hurda',
    category: 'hurda',
    buyMultiplier: 0.275,
    sellMultiplier: 0.333,
    unit: '1 gr',
    note: 'Has Altın x Alış: 0.275 / Satış: 0.333',
  },
};

export function loadMultipliers(): PriceMultipliersConfig {
  if (typeof window === 'undefined') return DEFAULT_MULTIPLIERS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MULTIPLIERS);
    if (!saved) return DEFAULT_MULTIPLIERS;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_MULTIPLIERS, ...parsed };
  } catch {
    return DEFAULT_MULTIPLIERS;
  }
}

export function saveMultipliersToStorage(config: PriceMultipliersConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MULTIPLIERS, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving multipliers:', err);
  }
}

export function isFormulaCalculationEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY_FORMULA_ENABLED);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setFormulaCalculationEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FORMULA_ENABLED, String(enabled));
  } catch (err) {
    console.error('Error setting formula enabled:', err);
  }
}

/**
 * Calculates a gold price based on Has Altın and the specified multiplier.
 */
export function calculateFromHasAltin(hasAltinPrice: number, multiplier: number): number {
  if (!hasAltinPrice || isNaN(hasAltinPrice) || !multiplier || isNaN(multiplier)) return 0;
  return Math.round(hasAltinPrice * multiplier);
}

/**
 * Applies formula multipliers to products based on the reference Has Altın price.
 */
export function applyMultipliersToProducts(
  products: GoldProduct[],
  hasAltinPrice: number,
  multipliers: PriceMultipliersConfig
): GoldProduct[] {
  if (!hasAltinPrice || hasAltinPrice <= 0) return products;

  return products.map((p) => {
    const conf = multipliers[p.id];
    if (!conf) return p;

    const buyPrice = calculateFromHasAltin(hasAltinPrice, conf.buyMultiplier);
    const sellPrice = calculateFromHasAltin(hasAltinPrice, conf.sellMultiplier);

    return {
      ...p,
      buyPrice: buyPrice > 0 ? buyPrice : p.buyPrice,
      sellPrice: sellPrice > 0 ? sellPrice : p.sellPrice,
    };
  });
}

/**
 * Applies formula multipliers to scrap rates based on the reference Has Altın price.
 */
export function applyMultipliersToScrap(
  scrapRates: ScrapRate[],
  hasAltinPrice: number,
  multipliers: PriceMultipliersConfig
): ScrapRate[] {
  if (!hasAltinPrice || hasAltinPrice <= 0) return scrapRates;

  return scrapRates.map((s) => {
    const key = `hurda-${s.karat}`;
    const conf = multipliers[key];
    if (!conf) return s;

    const buyPrice = calculateFromHasAltin(hasAltinPrice, conf.buyMultiplier);
    const sellPrice = calculateFromHasAltin(hasAltinPrice, conf.sellMultiplier);

    return {
      ...s,
      buyPrice: buyPrice > 0 ? buyPrice : s.buyPrice,
      sellPrice: sellPrice > 0 ? sellPrice : s.sellPrice,
    };
  });
}
