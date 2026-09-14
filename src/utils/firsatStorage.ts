import { FirsatProduct } from '../types';

export const INITIAL_FIRSAT_PRODUCTS: FirsatProduct[] = [
  {
    id: 'firsat-1',
    name: '14 ayar bileklik',
    weight: '5.32 gram',
    price: 30200,
    imageUrl: '/src/assets/images/bracelet_gold_1789335830916.jpg',
    tag: 'FIRSAT',
  },
  {
    id: 'firsat-2',
    name: '22 ayar tebih',
    weight: '20 gram',
    price: 150000,
    imageUrl: '/src/assets/images/tesbih_gold_1789335841734.jpg',
    tag: 'FIRSAT',
  },
];

const STORAGE_KEY = 'basak_firsat_products_v1';

export function loadFirsatProducts(): FirsatProduct[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Fırsat ürünleri yüklenirken hata oluştu:', e);
  }
  return INITIAL_FIRSAT_PRODUCTS;
}

export function saveFirsatProducts(products: FirsatProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.warn('Fırsat ürünleri kaydedilirken hata oluştu:', e);
  }
}
