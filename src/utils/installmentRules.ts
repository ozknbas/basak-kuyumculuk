import { CartItem } from '../types';

/**
 * Checks whether an item or cart is eligible for 3 installments.
 * Rule:
 * 3 taksit SADECE şu ürünlerde açıktır:
 * 1) 22 Ayar Gram (id: 'gram-22' veya adı '22 Ayar Gram' içerenler)
 * 2) 22 Ayar Bilezik (id: 'bilezik-22' veya adı '22 Ayar Bilezik' içerenler)
 * 3) Fırsat Ürünleri (category: 'firsat' veya id 'firsat-' ile başlayanlar)
 *
 * Sarrafiyeler (Çeyrek, Yarım, Tam, Ata vb.) ve 24 Ayar Gram Altınlarda 3 taksit KAPALIDIR.
 */
export const isItemEligibleForInstallment = (item: CartItem): boolean => {
  if (item.category === 'firsat' || item.productId.startsWith('firsat-')) {
    return true;
  }

  const nameLower = item.name.toLowerCase();
  const idLower = item.productId.toLowerCase();

  // 22 Ayar Bilezik check
  if (idLower.includes('bilezik') || nameLower.includes('bilezik')) {
    return true;
  }

  // 22 Ayar Gram check (not 24 ayar)
  if (
    (idLower === 'gram-22' || nameLower.includes('22 ayar gram') || nameLower.includes('22 ayar')) &&
    !nameLower.includes('24 ayar') &&
    !idLower.includes('gram-24')
  ) {
    return true;
  }

  return false;
};

/**
 * Checks if the entire cart (all items) is eligible for 3 installments.
 * If there is any item not eligible (e.g. 24 ayar gram, çeyrek, yarım, tam, ata), installments are disabled.
 */
export const isCartEligibleForInstallment = (cartItems: CartItem[]): {
  isEligible: boolean;
  ineligibleItems: CartItem[];
} => {
  if (!cartItems || cartItems.length === 0) {
    return { isEligible: false, ineligibleItems: [] };
  }

  const ineligibleItems = cartItems.filter((item) => !isItemEligibleForInstallment(item));

  return {
    isEligible: ineligibleItems.length === 0,
    ineligibleItems,
  };
};
