import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavTab, GoldProduct, NotificationItem, CartItem, PriceAlarm, PushNotificationPayload } from './types';
import { INITIAL_HAS_ALTIN, HAS_ALTIN_CHANGE, INITIAL_PRODUCTS, SCRAP_RATES, NOTIFICATIONS_DATA } from './data/initialData';
import { Header } from './components/Header';
import { HasAltinBanner } from './components/HasAltinBanner';
import { SarrafiyeView } from './components/SarrafiyeView';
import { CalculatorView } from './components/CalculatorView';
import { IbanView } from './components/IbanView';
import { NotificationsView } from './components/NotificationsView';
import { ContactView } from './components/ContactView';
import { FirsatView } from './components/FirsatView';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { FloatingCartMenu } from './components/FloatingCartMenu';
import { AdminPanelModal } from './components/AdminPanelModal';
import { WelcomeOrderModal } from './components/WelcomeOrderModal';
import { TopPushNotificationBanner } from './components/TopPushNotificationBanner';
import { GoldChartModal } from './components/GoldChartModal';
import {
  loadSavedAlarms,
  saveSavedAlarms,
  checkAlarmsAgainstPrice,
  playNotificationSound,
  triggerHapticFeedback,
  sendNativePushNotification,
} from './utils/notificationService';
import {
  loadMultipliers,
  isFormulaCalculationEnabled,
  applyMultipliersToProducts,
  applyMultipliersToScrap,
} from './utils/priceMultipliers';
import { loadFirsatProducts, saveFirsatProducts } from './utils/firsatStorage';
import { loadThemeMode, saveThemeMode, applyTheme, ThemeMode } from './utils/themeStorage';
import { PriceMultipliersConfig, ScrapRate, FirsatProduct } from './types';
import {
  subscribeToPriceConfig,
  subscribeToFirsatProducts,
} from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('sarrafiye');
  const [hasAltinPrice, setHasAltinPrice] = useState<number>(INITIAL_HAS_ALTIN);
  const [changeRate, setChangeRate] = useState<number>(HAS_ALTIN_CHANGE);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(true);
  
  // Theme state
  const [themeMode, setThemeMode] = useState<ThemeMode>(loadThemeMode);

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    saveThemeMode(newTheme);
  };
  
  // Alarms & Top Push Notification state
  const [savedAlarms, setSavedAlarms] = useState<PriceAlarm[]>(loadSavedAlarms);
  const [activeTopNotification, setActiveTopNotification] = useState<PushNotificationPayload | null>(null);
  const [isChartOpen, setIsChartOpen] = useState<boolean>(false);

  const [multipliers, setMultipliers] = useState<PriceMultipliersConfig>(loadMultipliers);
  const [formulaEnabled, setFormulaEnabled] = useState<boolean>(isFormulaCalculationEnabled);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [firsatProducts, setFirsatProducts] = useState<FirsatProduct[]>(loadFirsatProducts);

  // Real-time Firestore sync for multipliers & formula toggle
  useEffect(() => {
    const unsub = subscribeToPriceConfig((newConfig, newFormulaEnabled) => {
      setMultipliers(newConfig);
      multipliersRef.current = newConfig;
      setFormulaEnabled(newFormulaEnabled);
      formulaEnabledRef.current = newFormulaEnabled;

      const currentHas = hasAltinPriceRef.current || hasAltinPrice;
      if (newFormulaEnabled && currentHas > 0) {
        setProducts((prev) => applyMultipliersToProducts(prev, currentHas, newConfig));
        setScrapRates((prev) => applyMultipliersToScrap(prev, currentHas, newConfig));
      }
    });
    return () => unsub();
  }, [hasAltinPrice]);

  // Real-time Firestore sync for Fırsat Ürünleri
  useEffect(() => {
    const unsub = subscribeToFirsatProducts((list) => {
      setFirsatProducts(list);
    });
    return () => unsub();
  }, []);

  // Synchronization refs to avoid stale closure in periodic intervals
  const multipliersRef = useRef<PriceMultipliersConfig>(multipliers);
  const formulaEnabledRef = useRef<boolean>(formulaEnabled);
  const hasAltinPriceRef = useRef<number>(hasAltinPrice);

  useEffect(() => {
    multipliersRef.current = multipliers;
  }, [multipliers]);

  useEffect(() => {
    formulaEnabledRef.current = formulaEnabled;
  }, [formulaEnabled]);

  useEffect(() => {
    hasAltinPriceRef.current = hasAltinPrice;
  }, [hasAltinPrice]);

  const [products, setProducts] = useState<GoldProduct[]>(() => {
    const initMultipliers = loadMultipliers();
    const isFormula = isFormulaCalculationEnabled();
    return isFormula ? applyMultipliersToProducts(INITIAL_PRODUCTS, INITIAL_HAS_ALTIN, initMultipliers) : INITIAL_PRODUCTS;
  });
  const [scrapRates, setScrapRates] = useState<ScrapRate[]>(() => {
    const initMultipliers = loadMultipliers();
    const isFormula = isFormulaCalculationEnabled();
    return isFormula ? applyMultipliersToScrap(SCRAP_RATES, INITIAL_HAS_ALTIN, initMultipliers) : SCRAP_RATES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS_DATA);
  const [currentTime, setCurrentTime] = useState<string>('06:54');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [activeProductForCalc, setActiveProductForCalc] = useState<GoldProduct | null>(null);

  // Cart State
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [lastAddedNotification, setLastAddedNotification] = useState<{
    name: string;
    timestamp: number;
  } | null>(null);

  const handleTriggerPushNotification = useCallback((payload: PushNotificationPayload) => {
    setActiveTopNotification(payload);
  }, []);

  // Alarm checking callback when price updates
  useEffect(() => {
    if (hasAltinPrice > 0 && savedAlarms.length > 0) {
      const { updatedAlarms, hasChanges } = checkAlarmsAgainstPrice(
        hasAltinPrice,
        savedAlarms,
        handleTriggerPushNotification
      );
      if (hasChanges) {
        setSavedAlarms(updatedAlarms);
      }
    }
  }, [hasAltinPrice, handleTriggerPushNotification]);

  const handleAddAlarm = (target: number, direction: 'above' | 'below') => {
    const newAlarm: PriceAlarm = {
      id: `alarm-${Date.now()}`,
      target,
      direction,
      createdAt: Date.now(),
      active: true,
    };
    const updated = [newAlarm, ...savedAlarms];
    setSavedAlarms(updated);
    saveSavedAlarms(updated);

    // Immediately test against current price
    const { updatedAlarms, hasChanges } = checkAlarmsAgainstPrice(
      hasAltinPrice,
      updated,
      handleTriggerPushNotification
    );
    if (hasChanges) {
      setSavedAlarms(updatedAlarms);
    }
  };

  const handleRemoveAlarm = (id: string) => {
    const updated = savedAlarms.filter((a) => a.id !== id);
    setSavedAlarms(updated);
    saveSavedAlarms(updated);
  };

  const handleTestNotification = () => {
    const payload: PushNotificationPayload = {
      id: `test-${Date.now()}`,
      title: '👑 BAŞAK KUYUMCULUK · FİYAT ALARMI',
      body: `🚨 TEST: Has Altın hedef fiyatınız (6.850,00 ₺) gerçekleşti! Canlı Fiyat: ${hasAltinPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
      timestamp: Date.now(),
      type: 'alarm',
    };

    playNotificationSound();
    triggerHapticFeedback();
    sendNativePushNotification(payload);
    handleTriggerPushNotification(payload);
  };

  // Clock ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notification auto-dismiss after 4 seconds
  useEffect(() => {
    if (!lastAddedNotification) return;
    const timer = setTimeout(() => {
      setLastAddedNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [lastAddedNotification]);

  const parseHaremNumber = (val: unknown, fallback: number): number => {
    if (typeof val === 'number') return val;
    if (!val) return fallback;
    const num = parseFloat(String(val).replace(',', '.'));
    return isNaN(num) ? fallback : num;
  };

  // Fetch real-time Has Altın and market prices from Harem Altın API
  const fetchHaremPrices = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/harem-altin');
      if (!res.ok) throw new Error('API yanıt vermedi');
      const data = await res.json();

      let currentHasSell = hasAltinPriceRef.current || hasAltinPrice;
      if (data.hasAltin) {
        currentHasSell = data.hasAltin.sellPrice;
        setHasAltinPrice(data.hasAltin.sellPrice);
        hasAltinPriceRef.current = data.hasAltin.sellPrice;
        setChangeRate(data.hasAltin.changeRate);
      }

      if (data.allPrices) {
        const ap = data.allPrices;
        const isFormula = formulaEnabledRef.current;
        const activeMultipliers = multipliersRef.current;

        setProducts((prev) => {
          let baseList = prev.filter(
            (p) =>
              !['gremse-yeni', 'resat-altin', 'hamit-altin', 'ata-eski', 'dolar', 'euro', 'gumus', 'ons-altin'].includes(p.id)
          );

          if (isFormula) {
            return applyMultipliersToProducts(baseList, currentHasSell, activeMultipliers);
          } else {
            return baseList.map((p) => {
              let buy = p.buyPrice;
              let sell = p.sellPrice;

              if (p.id === 'gram-24') {
                if (ap.KULCEALTIN) {
                  buy = parseHaremNumber(ap.KULCEALTIN.alis, buy);
                  sell = parseHaremNumber(ap.KULCEALTIN.satis, sell);
                } else if (ap.ALTIN) {
                  buy = parseHaremNumber(ap.ALTIN.alis, buy);
                  sell = parseHaremNumber(ap.ALTIN.satis, sell);
                }
              } else if (p.id === 'gram-22' && ap.AYAR22) {
                buy = parseHaremNumber(ap.AYAR22.alis, buy);
                sell = parseHaremNumber(ap.AYAR22.satis, sell);
              } else if (p.id === 'bilezik-22' && ap.AYAR22) {
                buy = parseHaremNumber(ap.AYAR22.alis, buy);
                sell = parseHaremNumber(ap.AYAR22.satis, sell);
              } else if (p.id === 'ceyrek-yeni' && ap.CEYREK_YENI) {
                buy = parseHaremNumber(ap.CEYREK_YENI.alis, buy);
                sell = parseHaremNumber(ap.CEYREK_YENI.satis, sell);
              } else if (p.id === 'ceyrek-eski' && ap.CEYREK_ESKI) {
                buy = parseHaremNumber(ap.CEYREK_ESKI.alis, buy);
                sell = parseHaremNumber(ap.CEYREK_ESKI.satis, sell);
              } else if (p.id === 'yarim-yeni' && ap.YARIM_YENI) {
                buy = parseHaremNumber(ap.YARIM_YENI.alis, buy);
                sell = parseHaremNumber(ap.YARIM_YENI.satis, sell);
              } else if (p.id === 'yarim-eski' && ap.YARIM_ESKI) {
                buy = parseHaremNumber(ap.YARIM_ESKI.alis, buy);
                sell = parseHaremNumber(ap.YARIM_ESKI.satis, sell);
              } else if (p.id === 'tam-yeni' && ap.TEK_YENI) {
                buy = parseHaremNumber(ap.TEK_YENI.alis, buy);
                sell = parseHaremNumber(ap.TEK_YENI.satis, sell);
              } else if (p.id === 'tam-eski' && ap.TEK_ESKI) {
                buy = parseHaremNumber(ap.TEK_ESKI.alis, buy);
                sell = parseHaremNumber(ap.TEK_ESKI.satis, sell);
              } else if (p.id === 'cumhuriyet-ata' && ap.ATA_YENI) {
                buy = parseHaremNumber(ap.ATA_YENI.alis, buy);
                sell = parseHaremNumber(ap.ATA_YENI.satis, sell);
              }

              return { ...p, buyPrice: buy, sellPrice: sell };
            });
          }
        });

        setScrapRates((prev) => {
          if (isFormula) {
            return applyMultipliersToScrap(prev, currentHasSell, activeMultipliers);
          } else {
            return prev.map((r) => {
              if (r.karat === 24) {
                return {
                  ...r,
                  buyPrice: Math.round(data.hasAltin?.buyPrice || r.buyPrice),
                  sellPrice: Math.round(data.hasAltin?.sellPrice || r.sellPrice),
                };
              }
              if (r.karat === 22 && ap.AYAR22) {
                return {
                  ...r,
                  buyPrice: Math.round(parseHaremNumber(ap.AYAR22.alis, r.buyPrice)),
                  sellPrice: Math.round(parseHaremNumber(ap.AYAR22.satis, r.sellPrice)),
                };
              }
              if (r.karat === 18) {
                return {
                  ...r,
                  buyPrice: Math.round(currentHasSell * 0.7),
                  sellPrice: Math.round(currentHasSell * 0.75),
                };
              }
              if (r.karat === 14 && ap.AYAR14) {
                return {
                  ...r,
                  buyPrice: Math.round(parseHaremNumber(ap.AYAR14.alis, r.buyPrice)),
                  sellPrice: Math.round(parseHaremNumber(ap.AYAR14.satis, r.sellPrice)),
                };
              }
              if (r.karat === 8) {
                return {
                  ...r,
                  buyPrice: Math.round(currentHasSell * 0.275),
                  sellPrice: Math.round(currentHasSell * 0.333),
                };
              }
              return r;
            });
          }
        });
      }
    } catch (err) {
      console.warn('Harem Altın veri çekme hatası:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMultipliersUpdated = (
    newConfig: PriceMultipliersConfig,
    newFormulaEnabled: boolean
  ) => {
    setMultipliers(newConfig);
    multipliersRef.current = newConfig;
    setFormulaEnabled(newFormulaEnabled);
    formulaEnabledRef.current = newFormulaEnabled;
    const currentHas = hasAltinPriceRef.current || hasAltinPrice;

    if (newFormulaEnabled) {
      setProducts((prev) => applyMultipliersToProducts(prev, currentHas, newConfig));
      setScrapRates((prev) => applyMultipliersToScrap(prev, currentHas, newConfig));
    } else {
      fetchHaremPrices();
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchHaremPrices();
  }, []);

  // Periodic live update from Harem Altın
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchHaremPrices();
    }, 5000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  // Cart operations
  const handleAddToCart = (product: GoldProduct, type: 'sell' | 'buy') => {
    const key = `${product.id}-${type}`;
    const price = type === 'sell' ? product.sellPrice : product.buyPrice;

    setCart((prev) => {
      const existing = prev[key];
      const currentQty = existing ? existing.quantity : 0;
      return {
        ...prev,
        [key]: {
          productId: product.id,
          name: product.name,
          code: product.code,
          type,
          price,
          quantity: currentQty + 1,
          category: product.category,
        },
      };
    });

    setLastAddedNotification({
      name: `${product.name} (${type === 'sell' ? 'Satın Alma' : 'Bozdurma'})`,
      timestamp: Date.now(),
    });
  };

  const handleUpdateQuantity = (productId: string, type: 'sell' | 'buy', delta: number) => {
    const key = `${productId}-${type}`;
    setCart((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return {
        ...prev,
        [key]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const handleRemoveItem = (productId: string, type: 'sell' | 'buy') => {
    const key = `${productId}-${type}`;
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const handleUpdateFirsatProducts = (updated: FirsatProduct[]) => {
    setFirsatProducts(updated);
    saveFirsatProducts(updated);
  };

  const handleAddFirsatToCart = (item: FirsatProduct) => {
    const dummyProduct: GoldProduct = {
      id: item.id,
      name: item.name,
      category: 'firsat',
      buyPrice: item.price,
      sellPrice: item.price,
      code: item.weight,
      purity: item.weight,
    };
    handleAddToCart(dummyProduct, 'sell');
  };

  const handleSelectProductForCalc = (product: GoldProduct) => {
    setActiveProductForCalc(product);
    setActiveTab('hesap');
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const totalCartCount = (Object.values(cart) as CartItem[]).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-[#0F0F12] text-stone-100' : 'bg-[#F9F7F4] text-stone-800'} flex flex-col items-center selection:bg-amber-100 transition-colors duration-300`}>
      {/* Centered Mobile/Desktop Container */}
      <div className="w-full max-w-lg min-h-screen flex flex-col relative pb-16">
        
        {/* Global App Header */}
        <Header
          currentTime={currentTime}
          isUpdating={isUpdating}
          onRefresh={fetchHaremPrices}
          onOpenNotifications={() => setActiveTab('bildirim')}
          onOpenProfile={() => setIsProfileOpen(true)}
          unreadCount={unreadNotificationsCount}
        />

        {/* Has Altın Hero Banner - Displayed on Sarrafiye view */}
        {activeTab === 'sarrafiye' && (
          <HasAltinBanner
            price={hasAltinPrice}
            changeRate={changeRate}
            currentTime={currentTime}
            onOpenCalculator={() => setActiveTab('hesap')}
            onOpenChart={() => setIsChartOpen(true)}
          />
        )}

        {/* View Switcher based on active tab */}
        <main className="flex-1 w-full">
          {activeTab === 'sarrafiye' && (
            <SarrafiyeView
              products={products}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onSelectProductForCalc={handleSelectProductForCalc}
            />
          )}

          {activeTab === 'hesap' && (
            <CalculatorView
              scrapRates={scrapRates}
              products={products}
              activeProductForCalc={activeProductForCalc}
            />
          )}

          {activeTab === 'firsat' && (
            <FirsatView
              firsatProducts={firsatProducts}
              cart={cart}
              onAddToCart={handleAddFirsatToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
            />
          )}

          {activeTab === 'iban' && <IbanView />}

          {activeTab === 'bildirim' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              hasAltinPrice={hasAltinPrice}
              savedAlarms={savedAlarms}
              onAddAlarm={handleAddAlarm}
              onRemoveAlarm={handleRemoveAlarm}
              onTestNotification={handleTestNotification}
            />
          )}

          {activeTab === 'iletisim' && (
            <ContactView onOpenAdminPanel={() => setIsAdminOpen(true)} />
          )}
        </main>

        {/* Top Drop-Down Push Notification (Apple & Android Style) */}
        <TopPushNotificationBanner
          notification={activeTopNotification}
          onClose={() => setActiveTopNotification(null)}
          onClickView={() => setActiveTab('bildirim')}
        />

        {/* Floating Cart Menu Bar - Appears docked right above BottomNav when products are added */}
        <FloatingCartMenu
          cart={cart}
          lastAddedNotification={lastAddedNotification}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onCloseNotification={() => setLastAddedNotification(null)}
        />

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          unreadCount={unreadNotificationsCount}
          cartCount={totalCartCount}
        />

        {/* User Profile & Theme Settings Modal */}
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          themeMode={themeMode}
          onChangeTheme={handleThemeChange}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(prev => !prev)}
        />

        {/* Yönetim Paneli - Fırsat Ürünleri & Fiyat Çarpanları (Şifre Korumalı: 741258) */}
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          hasAltinPrice={hasAltinPrice}
          onMultipliersUpdated={handleMultipliersUpdated}
          firsatProducts={firsatProducts}
          onUpdateFirsatProducts={handleUpdateFirsatProducts}
        />

        {/* İlk Açılış Sipariş Oluşturun Hoş Geldiniz Penceresi */}
        <WelcomeOrderModal
          isOpen={isWelcomeOpen}
          onClose={() => setIsWelcomeOpen(false)}
        />

        {/* Has Altın & Ons Canlı TradingView Grafiği Modalı */}
        <GoldChartModal
          isOpen={isChartOpen}
          onClose={() => setIsChartOpen(false)}
          hasAltinPrice={hasAltinPrice}
          changeRate={changeRate}
          currentTime={currentTime}
        />
      </div>
    </div>
  );
}
