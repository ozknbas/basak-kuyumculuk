export interface CustomerOrderInfo {
  fullName: string;
  phone: string;
  tcNo: string;
  address: string;
  iban: string;
}

const STORAGE_KEY = 'basak_customer_info_v1';

export function loadCustomerInfo(): CustomerOrderInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Müşteri bilgisi yüklenemedi:', e);
  }
  return {
    fullName: '',
    phone: '',
    tcNo: '',
    address: '',
    iban: '',
  };
}

export function saveCustomerInfo(info: CustomerOrderInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.warn('Müşteri bilgisi kaydedilemedi:', e);
  }
}
