import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Check,
  Upload,
  AlertCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import {
  ADMIN_PANEL_PASSWORD,
  DEFAULT_MULTIPLIERS,
  loadMultipliers,
  saveMultipliersToStorage,
  isFormulaCalculationEnabled,
  setFormulaCalculationEnabled,
  calculateFromHasAltin,
} from '../utils/priceMultipliers';
import { PriceMultipliersConfig, PriceMultiplierItem, FirsatProduct } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  savePriceConfigToFirestore,
  syncAllFirsatProductsToFirestore,
} from '../services/firebaseService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasAltinPrice: number;
  onMultipliersUpdated: (newConfig: PriceMultipliersConfig, formulaEnabled: boolean) => void;
  firsatProducts: FirsatProduct[];
  onUpdateFirsatProducts: (products: FirsatProduct[]) => void;
}

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60;

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  hasAltinPrice,
  onMultipliersUpdated,
  firsatProducts,
  onUpdateFirsatProducts,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Multipliers configuration
  const [config, setConfig] = useState<PriceMultipliersConfig>(DEFAULT_MULTIPLIERS);
  const [inputStrings, setInputStrings] = useState<Record<string, string>>({});
  const [isFormulaActive, setIsFormulaActive] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Helper to initialize input strings from config
  const syncInputStrings = (loadedConfig: PriceMultipliersConfig) => {
    const strings: Record<string, string> = {};
    Object.keys(loadedConfig).forEach((k) => {
      const item = loadedConfig[k];
      if (item) {
        strings[`${k}_buy`] = item.buyMultiplier !== undefined ? String(item.buyMultiplier) : '';
        strings[`${k}_sell`] = item.sellMultiplier !== undefined ? String(item.sellMultiplier) : '';
      }
    });
    setInputStrings(strings);
  };

  // Load saved configuration on mount or when opened
  useEffect(() => {
    if (isOpen) {
      const loaded = loadMultipliers();
      setConfig(loaded);
      setIsFormulaActive(isFormulaCalculationEnabled());
      syncInputStrings(loaded);
    }
  }, [isOpen]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newGram, setNewGram] = useState<string>('');
  const [newPrice, setNewPrice] = useState<string>('');
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [newImageFileName, setNewImageFileName] = useState<string>('seçili dosya yok');
  const [formError, setFormError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    let timer: any = null;
    if (lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            setFailedAttempts(0);
            setPasswordError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutRemaining]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (lockoutRemaining > 0) return;

    if (passwordInput === ADMIN_PANEL_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
      setFailedAttempts(0);
    } else {
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      setPasswordInput('');

      const remaining = MAX_ATTEMPTS - newFailed;
      if (remaining > 0) {
        setPasswordError(`Hatalı şifre! Kalan deneme hakkı: ${remaining}`);
      } else {
        setLockoutRemaining(LOCKOUT_SECONDS);
        setPasswordError(`3 kez hatalı şifre girildi! Güvenlik nedeniyle giriş ${LOCKOUT_SECONDS} saniye kilitlendi.`);
      }
    }
  };

  // Image Upload handler for new product
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImageFileName('seçili dosya yok');
      setNewImagePreview('');
    }
  };

  // Add new Fırsat Ürünü
  const handleAddFirsatProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Lütfen ürün adını giriniz.');
      return;
    }
    const cleanPrice = parseFloat(newPrice.replace(/\./g, '').replace(',', '.'));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      setFormError('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    const defaultImg =
      newImagePreview ||
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';

    const weightText = newGram.trim()
      ? newGram.includes('gr')
        ? newGram
        : `${newGram} gr`
      : 'Standart';

    const newProduct: FirsatProduct = {
      id: `firsat-${Date.now()}`,
      name: newTitle.trim(),
      weight: weightText,
      price: cleanPrice,
      imageUrl: defaultImg,
      tag: 'FIRSAT',
    };

    const updated = [newProduct, ...firsatProducts];
    onUpdateFirsatProducts(updated);
    syncAllFirsatProductsToFirestore(updated).catch((err) =>
      console.warn('Firestore firsat sync error:', err)
    );

    // Reset form
    setNewTitle('');
    setNewGram('');
    setNewPrice('');
    setNewImagePreview('');
    setNewImageFileName('seçili dosya yok');
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Delete Fırsat Ürünü
  const handleDeleteFirsatProduct = (id: string) => {
    const updated = firsatProducts.filter((p) => p.id !== id);
    onUpdateFirsatProducts(updated);
    syncAllFirsatProductsToFirestore(updated).catch((err) =>
      console.warn('Firestore firsat delete error:', err)
    );
  };

  // Handle multiplier input change allowing decimal dots, commas, and partial typing
  const handleMultiplierInputChange = (
    id: string,
    field: 'buyMultiplier' | 'sellMultiplier',
    val: string
  ) => {
    // Keep only numbers, dot, and comma
    const sanitized = val.replace(/[^0-9.,]/g, '');
    const key = `${id}_${field === 'buyMultiplier' ? 'buy' : 'sell'}`;

    setInputStrings((prev) => ({
      ...prev,
      [key]: sanitized,
    }));

    // Convert comma to dot for parsing
    const cleanDot = sanitized.replace(',', '.');
    const parsed = parseFloat(cleanDot);

    if (!isNaN(parsed) && parsed >= 0) {
      setConfig((prev) => {
        const currentItem = prev[id] || DEFAULT_MULTIPLIERS[id] || {
          id,
          name: id,
          category: 'gram',
          buyMultiplier: 0,
          sellMultiplier: 0,
          unit: '1 gr',
          note: '',
        };

        return {
          ...prev,
          [id]: {
            ...currentItem,
            [field]: parsed,
          },
        };
      });
    }
  };

  const handleSaveMultipliers = () => {
    // Build final config by applying any pending input strings
    const finalConfig: PriceMultipliersConfig = { ...config };

    Object.keys(DEFAULT_MULTIPLIERS).forEach((id) => {
      const buyStr = inputStrings[`${id}_buy`];
      const sellStr = inputStrings[`${id}_sell`];
      const defaultItem = DEFAULT_MULTIPLIERS[id];
      const currentItem = finalConfig[id] || defaultItem;

      let finalBuy = currentItem.buyMultiplier;
      let finalSell = currentItem.sellMultiplier;

      if (buyStr !== undefined) {
        const p = parseFloat(buyStr.replace(',', '.'));
        if (!isNaN(p) && p >= 0) finalBuy = p;
      }
      if (sellStr !== undefined) {
        const p = parseFloat(sellStr.replace(',', '.'));
        if (!isNaN(p) && p >= 0) finalSell = p;
      }

      finalConfig[id] = {
        ...currentItem,
        buyMultiplier: finalBuy,
        sellMultiplier: finalSell,
      };
    });

    setConfig(finalConfig);
    saveMultipliersToStorage(finalConfig);
    setFormulaCalculationEnabled(isFormulaActive);
    onMultipliersUpdated(finalConfig, isFormulaActive);
    savePriceConfigToFirestore(finalConfig, isFormulaActive).catch((err) =>
      console.warn('Firestore price config save error:', err)
    );
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Tüm sarrafiye ve hurda çarpanları varsayılan ayarlara sıfırlansın mı?')) {
      setConfig(DEFAULT_MULTIPLIERS);
      syncInputStrings(DEFAULT_MULTIPLIERS);
      saveMultipliersToStorage(DEFAULT_MULTIPLIERS);
      setFormulaCalculationEnabled(isFormulaActive);
      onMultipliersUpdated(DEFAULT_MULTIPLIERS, isFormulaActive);
      savePriceConfigToFirestore(DEFAULT_MULTIPLIERS, isFormulaActive).catch((err) =>
        console.warn('Firestore price config reset error:', err)
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const remainingAttempts = Math.max(0, MAX_ATTEMPTS - failedAttempts);
  const isLockedOut = lockoutRemaining > 0;

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        className="bg-[#FAF7F2] border border-amber-900/20 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-800 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header - Matches IMG_7093.png */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 flex items-center justify-between bg-[#FAF7F2]">
          <h2 className="font-serif-luxury font-bold text-2xl text-amber-950 tracking-tight">
            Yönetim
          </h2>
          <button
            type="button"
            id="btn-close-admin-header"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#EFE8DC] hover:bg-[#E5DBCB] text-stone-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            Kapat
          </button>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Password Authentication Gate */
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-xs transition-colors ${
              isLockedOut ? 'bg-rose-100 border border-rose-300 text-rose-700' : 'bg-amber-100 border border-amber-300 text-amber-800'
            }`}>
              {isLockedOut ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
            </div>

            <div>
              <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
                Yetkili Girişi
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Fırsat ürünlerini ve sarrafiye fiyat katsayılarını yönetmek için şifrenizi giriniz.
              </p>
              
              {/* Attempt Counter Dots */}
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <span className="text-[11px] text-stone-400 font-medium mr-1">Deneme Hakkı:</span>
                {[1, 2, 3].map((num) => {
                  const isUsed = num > remainingAttempts;
                  return (
                    <span
                      key={num}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        isLockedOut
                          ? 'bg-rose-500'
                          : isUsed
                          ? 'bg-rose-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  id="admin-password-input"
                  disabled={isLockedOut}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder={isLockedOut ? `Kilitlendi (${lockoutRemaining}s)` : "Yönetici Şifresi"}
                  autoFocus={!isLockedOut}
                  className={`w-full px-4 py-3 rounded-2xl bg-white border text-stone-900 placeholder:text-stone-400 text-center text-lg tracking-widest font-mono focus:outline-none focus:ring-2 ${
                    isLockedOut
                      ? 'border-rose-300 bg-rose-50/50 cursor-not-allowed text-rose-900'
                      : 'border-stone-300 focus:ring-amber-500/50'
                  }`}
                />
                {passwordError && (
                  <div className={`mt-2 p-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 ${
                    isLockedOut ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-amber-50 border border-amber-200 text-rose-700'
                  }`}>
                    {isLockedOut && <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse flex-shrink-0" />}
                    <span>{passwordError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                id="btn-admin-submit-pass"
                disabled={isLockedOut || !passwordInput.trim()}
                className={`w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all ${
                  isLockedOut || !passwordInput.trim()
                    ? 'bg-stone-300 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-[#C49746] to-[#9E7329] active:scale-98 hover:brightness-105 cursor-pointer'
                }`}
              >
                {isLockedOut ? `Kilitli (${lockoutRemaining} sn)` : 'Giriş Yap'}
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Management View - Matches IMG_7093.png */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* SECTION 1: FIRSAT ÜRÜNLERİ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-serif-luxury font-bold tracking-widest text-amber-900 uppercase">
                  FIRSAT ÜRÜNLERİ
                </h3>
                <span className="text-[11px] text-stone-500">
                  {firsatProducts.length} aktif ürün
                </span>
              </div>

              {/* Existing Items List - Matches IMG_7093.png */}
              <div className="space-y-2.5">
                {firsatProducts.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-stone-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {item.weight} — {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>

                    {/* Delete (X) Button */}
                    <button
                      type="button"
                      id={`btn-del-firsat-${item.id}`}
                      onClick={() => handleDeleteFirsatProduct(item.id)}
                      title="Ürünü Sil"
                      className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Opportunity Product Card - Matches IMG_7093.png */}
              <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3.5 mt-3">
                <h4 className="font-bold text-stone-900 text-sm">
                  Yeni Fırsat Ürünü Ekle
                </h4>

                <form onSubmit={handleAddFirsatProduct} className="space-y-3">
                  {/* Ürün Adı */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      id="input-firsat-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Örn: Çeyrek Altın"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>

                  {/* Gram & Fiyat Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Gram
                      </label>
                      <input
                        type="text"
                        id="input-firsat-gram"
                        value={newGram}
                        onChange={(e) => setNewGram(e.target.value)}
                        placeholder="Örn: 1.75"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-600 mb-1">
                        Fiyat (₺)
                      </label>
                      <input
                        type="text"
                        id="input-firsat-price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Örn: 5896"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>
                  </div>

                  {/* Ürün Görseli */}
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">
                      Ürün Görseli
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-300 bg-stone-50/70">
                      <button
                        type="button"
                        id="btn-choose-file"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Dosyayı Seç
                      </button>
                      <span className="text-xs text-stone-500 truncate flex-1">
                        {newImageFileName}
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {newImagePreview && (
                        <img
                          src={newImagePreview}
                          alt="Önizleme"
                          className="w-8 h-8 rounded-lg object-cover border border-amber-300"
                        />
                      )}
                    </div>
                  </div>

                  {formError && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button - Matches IMG_7093.png */}
                  <button
                    type="submit"
                    id="btn-add-firsat-submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F0E5D0] to-[#E3D3B5] hover:from-[#E8DCBF] hover:to-[#D9C6A2] text-amber-950 font-bold text-sm shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Fırsat Ürünü Ekle
                  </button>
                </form>
              </div>
            </div>

            {/* SECTION 2: SARRAFİYE FİYATLARI (MİLYEM / GRAM) - Matches IMG_7093.png */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-serif-luxury font-bold tracking-widest text-amber-900 uppercase">
                    SARRAFİYE FİYATLARI (MİLYEM / GRAM)
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Canlı Has Altın: <span className="font-bold text-amber-950">{formatCurrency(hasAltinPrice, 2)}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    title="Varsayılana Sıfırla"
                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Group: GRAM ALTINLAR */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  GRAM ALTINLAR
                </div>

                {['gram-24', 'gram-22', 'bilezik-22'].map((key) => {
                  const item = config[key] || DEFAULT_MULTIPLIERS[key];
                  if (!item) return null;

                  const buyStr = inputStrings[`${key}_buy`] ?? (item.buyMultiplier !== undefined ? String(item.buyMultiplier) : '');
                  const sellStr = inputStrings[`${key}_sell`] ?? (item.sellMultiplier !== undefined ? String(item.sellMultiplier) : '');
                  const buyVal = parseFloat(buyStr.replace(',', '.')) || 0;
                  const sellVal = parseFloat(sellStr.replace(',', '.')) || 0;

                  return (
                    <div key={key} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                          Hesaplanan: {formatCurrency(calculateFromHasAltin(hasAltinPrice, buyVal))} / {formatCurrency(calculateFromHasAltin(hasAltinPrice, sellVal))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Alış Katsayısı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={buyStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'buyMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Satış Katsayısı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={sellStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'sellMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group: YENİ SARRAFİYE */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  YENİ SARRAFİYE
                </div>

                {['ceyrek-yeni', 'yarim-yeni', 'tam-yeni', 'cumhuriyet-ata'].map((key) => {
                  const item = config[key] || DEFAULT_MULTIPLIERS[key];
                  if (!item) return null;

                  const buyStr = inputStrings[`${key}_buy`] ?? (item.buyMultiplier !== undefined ? String(item.buyMultiplier) : '');
                  const sellStr = inputStrings[`${key}_sell`] ?? (item.sellMultiplier !== undefined ? String(item.sellMultiplier) : '');
                  const buyVal = parseFloat(buyStr.replace(',', '.')) || 0;
                  const sellVal = parseFloat(sellStr.replace(',', '.')) || 0;

                  return (
                    <div key={key} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                          {formatCurrency(calculateFromHasAltin(hasAltinPrice, buyVal))} / {formatCurrency(calculateFromHasAltin(hasAltinPrice, sellVal))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Alış Çarpanı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={buyStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'buyMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Satış Çarpanı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={sellStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'sellMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group: ESKİ SARRAFİYE */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  ESKİ SARRAFİYE
                </div>

                {['ceyrek-eski', 'yarim-eski', 'tam-eski'].map((key) => {
                  const item = config[key] || DEFAULT_MULTIPLIERS[key];
                  if (!item) return null;

                  const buyStr = inputStrings[`${key}_buy`] ?? (item.buyMultiplier !== undefined ? String(item.buyMultiplier) : '');
                  const sellStr = inputStrings[`${key}_sell`] ?? (item.sellMultiplier !== undefined ? String(item.sellMultiplier) : '');
                  const buyVal = parseFloat(buyStr.replace(',', '.')) || 0;
                  const sellVal = parseFloat(sellStr.replace(',', '.')) || 0;

                  return (
                    <div key={key} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                          {formatCurrency(calculateFromHasAltin(hasAltinPrice, buyVal))} / {formatCurrency(calculateFromHasAltin(hasAltinPrice, sellVal))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Alış Çarpanı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={buyStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'buyMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">Satış Çarpanı</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={sellStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'sellMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Group: HURDA AYARLAR */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  HURDA AYARLAR (MİLYEM KATSAYILARI)
                </div>

                {['hurda-24', 'hurda-22', 'hurda-18', 'hurda-14', 'hurda-8'].map((key) => {
                  const item = config[key] || DEFAULT_MULTIPLIERS[key];
                  if (!item) return null;

                  const buyStr = inputStrings[`${key}_buy`] ?? (item.buyMultiplier !== undefined ? String(item.buyMultiplier) : '');
                  const sellStr = inputStrings[`${key}_sell`] ?? (item.sellMultiplier !== undefined ? String(item.sellMultiplier) : '');
                  const buyVal = parseFloat(buyStr.replace(',', '.')) || 0;
                  const sellVal = parseFloat(sellStr.replace(',', '.')) || 0;

                  return (
                    <div key={key} className="bg-white border border-stone-200 rounded-2xl p-3.5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 text-sm">{item.name}</span>
                        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                          Alış: {formatCurrency(calculateFromHasAltin(hasAltinPrice, buyVal))} / Satış: {formatCurrency(calculateFromHasAltin(hasAltinPrice, sellVal))}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">
                            Alış Milyemi (Örn: 0.700)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={buyStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'buyMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-stone-500 mb-0.5">
                            Satış Milyemi (Örn: 0.750)
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={sellStr}
                            onChange={(e) => handleMultiplierInputChange(key, 'sellMultiplier', e.target.value)}
                            placeholder="0.000"
                            className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Multipliers Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-save-multipliers"
                  onClick={handleSaveMultipliers}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C49746] to-[#9E7329] hover:from-[#B58737] hover:to-[#8E631B] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" />
                      <span>Çarpanlar Başarıyla Kaydedildi!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Sarrafiye Fiyat Çarpanlarını Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
