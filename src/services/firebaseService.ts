import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { PriceMultipliersConfig, FirsatProduct } from '../types';
import {
  DEFAULT_MULTIPLIERS,
  loadMultipliers,
  saveMultipliersToStorage,
  isFormulaCalculationEnabled,
  setFormulaCalculationEnabled,
} from '../utils/priceMultipliers';

// Koleksiyon ve Belge Adları (Firebase'deki tam yapı)
const AYARLAR_COLLECTION = 'ayarlar';
const FIYATLAR_DOC_ID = 'fiyatlar';
const FIRSAT_COLLECTION = 'firsatUrunleri';

const DEFAULT_FIRSAT_PRODUCTS: FirsatProduct[] = [
  {
    id: 'firsat-1',
    name: '14 Ayar Bileklik',
    weight: '5.32 gram',
    price: 30200,
    imageUrl:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    tag: 'FIRSAT',
  },
  {
    id: 'firsat-2',
    name: '22 Ayar Tesbih',
    weight: '20 gram',
    price: 150000,
    imageUrl:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    tag: 'FIRSAT',
  },
];

/**
 * Sayısal gram değerini ayıklar ("5.32 gram" -> 5.32)
 */
function parseGramNumber(weightStr: string | number): number {
  if (typeof weightStr === 'number') return weightStr;
  if (!weightStr) return 0;
  const cleaned = weightStr.replace(/[^0-9.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Firestore'daki ayarlar/fiyatlar belgesinden gelen veriyi normalize eder
 */
function normalizeFirestorePriceData(data: any): PriceMultipliersConfig {
  const currentMultipliers: PriceMultipliersConfig = { ...DEFAULT_MULTIPLIERS };

  if (data.multipliers) {
    return { ...currentMultipliers, ...data.multipliers };
  }

  // Eğer Firebase'de gruplar array formatı varsa (örn: gruplar[0].urunler)
  if (Array.isArray(data.gruplar)) {
    data.gruplar.forEach((grup: any) => {
      if (Array.isArray(grup.urunler)) {
        // Gram grubu haritalaması
        if (grup.ID === 'gram' || grup.id === 'gram') {
          if (grup.urunler[0]) {
            // 22 Ayar Gram
            if (currentMultipliers['gram-22']) {
              currentMultipliers['gram-22'].buyMultiplier =
                Number(grup.urunler[0].alisGram) || currentMultipliers['gram-22'].buyMultiplier;
              currentMultipliers['gram-22'].sellMultiplier =
                Number(grup.urunler[0].satisGram) || currentMultipliers['gram-22'].sellMultiplier;
            }
          }
          if (grup.urunler[1]) {
            // 24 Ayar Gram
            if (currentMultipliers['gram-24']) {
              currentMultipliers['gram-24'].buyMultiplier =
                Number(grup.urunler[1].alisGram) || currentMultipliers['gram-24'].buyMultiplier;
              currentMultipliers['gram-24'].sellMultiplier =
                Number(grup.urunler[1].satisGram) || currentMultipliers['gram-24'].sellMultiplier;
            }
          }
        }
      }
    });
  }

  return currentMultipliers;
}

/**
 * Fiyat çarpanlarını Firestore (ayarlar/fiyatlar) üzerinden anlık dinler.
 */
export function subscribeToPriceConfig(
  onUpdate: (multipliers: PriceMultipliersConfig, formulaEnabled: boolean) => void
): () => void {
  const configDocRef = doc(db, AYARLAR_COLLECTION, FIYATLAR_DOC_ID);

  const unsubscribe = onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const multipliers = normalizeFirestorePriceData(data);
        const formulaEnabled =
          data.formulaEnabled !== undefined ? Boolean(data.formulaEnabled) : true;

        saveMultipliersToStorage(multipliers);
        setFormulaCalculationEnabled(formulaEnabled);

        onUpdate(multipliers, formulaEnabled);
      } else {
        // Belge henüz yoksa varsayılanlarla başlat
        const localMultipliers = loadMultipliers();
        const localFormula = isFormulaCalculationEnabled();
        setDoc(
          configDocRef,
          {
            multipliers: localMultipliers,
            formulaEnabled: localFormula,
            ALIS_ORAN: 0.98,
            SATIS_ORAN: 1.03,
            updatedAt: Date.now(),
          },
          { merge: true }
        ).catch((err) => console.warn('Firestore ayarlar oluşturma:', err));

        onUpdate(localMultipliers, localFormula);
      }
    },
    (err) => {
      console.warn('Firestore ayarlar bağlantı uyarısı (yerel hafıza devrede):', err);
      onUpdate(loadMultipliers(), isFormulaCalculationEnabled());
    }
  );

  return unsubscribe;
}

/**
 * Fiyat çarpanlarını ve formül durumunu Firestore'a (ayarlar/fiyatlar) kaydeder.
 */
export async function savePriceConfigToFirestore(
  multipliers: PriceMultipliersConfig,
  formulaEnabled: boolean
): Promise<void> {
  saveMultipliersToStorage(multipliers);
  setFormulaCalculationEnabled(formulaEnabled);

  try {
    const configDocRef = doc(db, AYARLAR_COLLECTION, FIYATLAR_DOC_ID);
    await setDoc(
      configDocRef,
      {
        multipliers,
        formulaEnabled,
        ALIS_ORAN: multipliers['gram-24']?.buyMultiplier || 0.985,
        SATIS_ORAN: multipliers['gram-24']?.sellMultiplier || 1.011,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Firestore ayarlar kayıt hatası:', err);
    throw err;
  }
}

/**
 * Fırsat Ürünlerini Firestore (firsatUrunleri) üzerinden anlık dinler.
 * Şema: { ad: string, gram: number, fiyat: number, resim: string, createdAt: number }
 */
export function subscribeToFirsatProducts(
  onUpdate: (products: FirsatProduct[]) => void
): () => void {
  const firsatColRef = collection(db, FIRSAT_COLLECTION);

  const unsubscribe = onSnapshot(
    firsatColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const list: FirsatProduct[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const gramVal = typeof d.gram === 'number' ? d.gram : parseGramNumber(d.gram || '');
          const fiyatVal = typeof d.fiyat === 'number' ? d.fiyat : Number(d.price || 0);

          return {
            id: docSnap.id,
            name: d.ad || d.name || 'Fırsat Ürünü',
            weight: `${gramVal} gram`,
            price: isNaN(fiyatVal) ? 0 : fiyatVal,
            imageUrl: d.resim || d.imageUrl || '',
            tag: 'FIRSAT',
          };
        });

        try {
          localStorage.setItem('basak_firsat_products_v1', JSON.stringify(list));
        } catch {
          // ignore
        }
        onUpdate(list);
      } else {
        // Eğer koleksiyon tamamen boşsa örnek ürünleri ekle
        DEFAULT_FIRSAT_PRODUCTS.forEach((item) => {
          const payload = {
            ad: String(item.name || ''),
            gram: parseGramNumber(item.weight),
            fiyat: Number(item.price) || 0,
            resim: String(item.imageUrl || ''),
            createdAt: Date.now(),
          };
          setDoc(doc(db, FIRSAT_COLLECTION, item.id), payload).catch(() => {});
        });
        onUpdate(DEFAULT_FIRSAT_PRODUCTS);
      }
    },
    (err) => {
      console.warn('Firestore firsatUrunleri bağlantı uyarısı (yerel hafıza devrede):', err);
      try {
        const saved = localStorage.getItem('basak_firsat_products_v1');
        if (saved) {
          onUpdate(JSON.parse(saved));
        } else {
          onUpdate(DEFAULT_FIRSAT_PRODUCTS);
        }
      } catch {
        onUpdate(DEFAULT_FIRSAT_PRODUCTS);
      }
    }
  );

  return unsubscribe;
}

/**
 * Fırsat Ürünü ekler / günceller (firsatUrunleri).
 * Güvenlik kuralına %100 uyar: SADECE ['ad', 'gram', 'fiyat', 'resim', 'createdAt']
 */
export async function saveFirsatProductToFirestore(product: FirsatProduct): Promise<void> {
  const docRef = doc(db, FIRSAT_COLLECTION, product.id);
  const gramNum = parseGramNumber(product.weight);
  const fiyatNum = Number(product.price);

  const payload = {
    ad: String(product.name || 'Fırsat Ürünü'),
    gram: isNaN(gramNum) ? 0 : gramNum,
    fiyat: isNaN(fiyatNum) ? 0 : fiyatNum,
    resim: String(product.imageUrl || ''),
    createdAt: Date.now(),
  };

  await setDoc(docRef, payload);
}

/**
 * Fırsat Ürünü siler (firsatUrunleri).
 */
export async function deleteFirsatProductFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, FIRSAT_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Tüm Fırsat Ürünlerini Firestore ile senkronize eder.
 */
export async function syncAllFirsatProductsToFirestore(
  products: FirsatProduct[]
): Promise<void> {
  try {
    localStorage.setItem('basak_firsat_products_v1', JSON.stringify(products));
  } catch {
    // ignore
  }

  try {
    const snapshot = await getDocs(collection(db, FIRSAT_COLLECTION));
    const currentIds = new Set(products.map((p) => p.id));

    // Silinenleri Firestore'dan kaldır
    for (const d of snapshot.docs) {
      if (!currentIds.has(d.id)) {
        await deleteDoc(doc(db, FIRSAT_COLLECTION, d.id));
      }
    }

    // Mevcut olanları güvenlik kurallarına uygun formatta kaydet
    for (const p of products) {
      const gramNum = parseGramNumber(p.weight);
      const fiyatNum = Number(p.price);

      const payload = {
        ad: String(p.name || 'Fırsat Ürünü'),
        gram: isNaN(gramNum) ? 0 : gramNum,
        fiyat: isNaN(fiyatNum) ? 0 : fiyatNum,
        resim: String(p.imageUrl || ''),
        createdAt: Date.now(),
      };

      await setDoc(doc(db, FIRSAT_COLLECTION, p.id), payload);
    }
  } catch (err) {
    console.error('Firestore firsatUrunleri toplu kayıt hatası:', err);
  }
}
