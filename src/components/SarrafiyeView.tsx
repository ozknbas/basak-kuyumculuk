import React from 'react';
import { Calculator, Plus, Minus, MousePointerClick } from 'lucide-react';
import { GoldProduct, ProductCategory, CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import sarrafiyeGoldCoinImg from '../assets/images/sarrafiye_gold_coin_1789359796637.jpg';
import gramAltinBarImg from '../assets/images/gram_altin_bar_1789360644852.jpg';

interface SarrafiyeViewProps {
  products: GoldProduct[];
  cart: Record<string, CartItem>;
  onAddToCart: (product: GoldProduct, type: 'sell' | 'buy') => void;
  onUpdateQuantity: (productId: string, type: 'sell' | 'buy', delta: number) => void;
  onSelectProductForCalc: (product: GoldProduct) => void;
}

export const SarrafiyeView: React.FC<SarrafiyeViewProps> = ({
  products,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onSelectProductForCalc,
}) => {
  const getCategoryHeaderBadge = (cat: ProductCategory) => {
    switch (cat) {
      case 'gram':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4EA] dark:bg-[#2A2318] border border-[#E9DAC1] dark:border-[#524128] text-[#785424] dark:text-[#E2B777] text-xs font-bold shadow-2xs">
            <img
              src={gramAltinBarImg}
              alt="Gram Altınlar"
              className="w-4 h-4 object-contain inline-block drop-shadow-2xs rounded-xs"
              referrerPolicy="no-referrer"
            />
            <span className="tracking-wider uppercase">GRAM ALTINLAR</span>
          </div>
        );
      case 'yeni':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2E6] dark:bg-[#2B2215] border border-[#EBD6B5] dark:border-[#5E4420] text-[#85501B] dark:text-[#F3C78B] text-xs font-bold shadow-2xs">
            <img
              src={sarrafiyeGoldCoinImg}
              alt="Yeni Sarrafiyeler"
              className="w-4 h-4 object-contain rounded-full shadow-2xs inline-block"
              referrerPolicy="no-referrer"
            />
            <span className="tracking-wider uppercase">YENİ SARRAFİYELER</span>
          </div>
        );
      case 'eski':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F1FA] dark:bg-[#241E30] border border-[#DDD6EB] dark:border-[#4B3B66] text-[#553C85] dark:text-[#D4C3FA] text-xs font-bold shadow-2xs">
            <img
              src={sarrafiyeGoldCoinImg}
              alt="Eski Sarrafiyeler"
              className="w-4 h-4 object-contain rounded-full shadow-2xs inline-block"
              referrerPolicy="no-referrer"
            />
            <span className="tracking-wider uppercase">ESKİ SARRAFİYELER</span>
          </div>
        );
    }
  };

  const categoryOrder: ProductCategory[] = ['gram', 'yeni', 'eski'];

  return (
    <div className="w-full px-3.5 mb-28 max-w-lg mx-auto">
      {/* Section Card */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-amber-100/90 dark:border-[#2E2E38] shadow-[0_4px_24px_-4px_rgba(212,175,55,0.08)]">
        {/* Column Labels */}
        <div className="grid grid-cols-12 text-[11px] font-semibold text-stone-400 dark:text-stone-500 px-2 pb-2 mb-1 border-b border-stone-100 dark:border-[#252530] uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-5">Ürün</div>
          <div className="col-span-3 sm:col-span-3 text-center text-rose-800/80 dark:text-rose-400">Alış</div>
          <div className="col-span-4 sm:col-span-4 text-center text-emerald-800 dark:text-emerald-400">Satış</div>
        </div>

        {/* Product Items List */}
        <div className="space-y-3 pt-1">
          {categoryOrder.map((cat) => {
            const catItems = products.filter((p) => p.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between gap-1.5 my-1.5 flex-wrap">
                  {getCategoryHeaderBadge(cat)}
                  {cat === 'gram' && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-[#85501B] dark:text-[#E6B874] bg-[#FFF8EE] dark:bg-[#251E14] border border-[#F3DFC1] dark:border-[#523F21] px-2.5 py-1 rounded-full shadow-2xs">
                      <MousePointerClick className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 animate-bounce" />
                      <span>Almak istediğiniz ürünün fiyatına tıklayınız</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  {catItems.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      sellCartItem={cart[`${product.id}-sell`]}
                      buyCartItem={cart[`${product.id}-buy`]}
                      onAddToCart={onAddToCart}
                      onUpdateQuantity={onUpdateQuantity}
                      onSelectForCalc={onSelectProductForCalc}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface ProductRowProps {
  product: GoldProduct;
  sellCartItem?: CartItem;
  buyCartItem?: CartItem;
  onAddToCart: (product: GoldProduct, type: 'sell' | 'buy') => void;
  onUpdateQuantity: (productId: string, type: 'sell' | 'buy', delta: number) => void;
  onSelectForCalc: (product: GoldProduct) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  sellCartItem,
  buyCartItem,
  onAddToCart,
  onUpdateQuantity,
  onSelectForCalc,
}) => {
  // Product Icon (Gold Ingot bar vs Gold Coin)
  const getProductIcon = () => {
    if (product.category === 'gram') {
      return (
        <img
          src={gramAltinBarImg}
          alt={product.name}
          className="w-5 h-5 object-contain rounded-xs drop-shadow-2xs"
          referrerPolicy="no-referrer"
        />
      );
    }
    return (
      <img
        src={sarrafiyeGoldCoinImg}
        alt={product.name}
        className="w-5 h-5 object-contain rounded-full drop-shadow-2xs"
        referrerPolicy="no-referrer"
      />
    );
  };

  const sellQty = sellCartItem ? sellCartItem.quantity : 0;
  const buyQty = buyCartItem ? buyCartItem.quantity : 0;

  return (
    <div
      id={`product-row-${product.id}`}
      className={`grid grid-cols-12 items-center p-2 sm:p-2.5 rounded-2xl border transition-all ${
        sellQty > 0
          ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-600 shadow-xs'
          : 'bg-[#FCFAF7] dark:bg-[#202028] hover:bg-amber-50/50 dark:hover:bg-[#272733] border-stone-200/70 dark:border-[#2C2C38]'
      }`}
    >
      {/* Product Name & Icon */}
      <div className="col-span-5 sm:col-span-5 pr-1 flex items-center gap-2">
        <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-amber-50/90 dark:bg-[#2B2215] border border-amber-200/60 dark:border-[#5E4420] shadow-2xs">
          {getProductIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 leading-tight truncate">
            {product.name}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 flex-wrap">
            {product.purity && (
              <span className="px-1.5 py-0.2 rounded bg-stone-100 dark:bg-[#282834] text-stone-600 dark:text-stone-300 font-medium">
                {product.purity}
              </span>
            )}
            {(product.id === 'gram-22' || product.id === 'bilezik-22') && (
              <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800 text-[9px]">
                3 Taksit
              </span>
            )}
            <button
              onClick={() => onSelectForCalc(product)}
              className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-medium flex items-center gap-0.5 cursor-pointer"
              title="Hesapla"
            >
              <Calculator className="w-2.5 h-2.5" />
              <span>Hesapla</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alış Fiyatı Pill (Soft Peach / Reddish) */}
      <div className="col-span-3 sm:col-span-3 text-center px-0.5">
        <button
          type="button"
          onClick={() => onAddToCart(product, 'buy')}
          className="w-full py-1.5 px-1.5 rounded-xl bg-[#FDF1F0] dark:bg-[#2C1819] hover:bg-[#FBE4E1] dark:hover:bg-[#381E20] text-[#991B1B] dark:text-[#FCA5A5] text-xs font-bold border border-[#F8D2CD] dark:border-[#5C2B2D] shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          title="Bozdurmak için sepete ekle"
        >
          <span>{formatCurrency(product.buyPrice)}</span>
          {buyQty > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-700 text-white text-[9px] font-bold flex items-center justify-center">
              {buyQty}
            </span>
          )}
        </button>
      </div>

      {/* Satış Fiyatı Pill (Soft Mint / Emerald with Counter Badge) */}
      <div className="col-span-4 sm:col-span-4 text-center px-0.5">
        {sellQty > 0 ? (
          /* Active Counter State */
          <div className="py-1 px-1.5 rounded-xl bg-[#E8F8EE] dark:bg-[#122A1E] text-[#065F46] dark:text-[#6EE7B7] text-xs font-bold border border-emerald-500 ring-1 ring-emerald-400/40 flex items-center justify-between shadow-2xs">
            <span className="text-[11px] sm:text-xs tracking-tight font-extrabold ml-0.5">
              {formatCurrency(product.sellPrice)}
            </span>

            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-stone-400 dark:bg-stone-600 text-white text-[9px] font-black flex items-center justify-center">
                {sellQty}
              </span>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(product.id, 'sell', -1)}
                  className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-800 hover:bg-emerald-300 text-emerald-900 dark:text-emerald-100 flex items-center justify-center font-black active:scale-90 cursor-pointer"
                  title="Azalt"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(product.id, 'sell', 1)}
                  className="w-4 h-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center font-black active:scale-90 cursor-pointer"
                  title="Artır"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Default Clickable Mint Pill */
          <button
            type="button"
            onClick={() => onAddToCart(product, 'sell')}
            className="w-full py-1.5 px-2 rounded-xl bg-[#ECFDF5] dark:bg-[#11291D] hover:bg-[#D1FAE5] dark:hover:bg-[#193B2B] text-[#065F46] dark:text-[#6EE7B7] text-xs font-bold border border-emerald-300 dark:border-[#22573E] shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="Satın almak için sepete ekle"
          >
            <span>{formatCurrency(product.sellPrice)}</span>
          </button>
        )}
      </div>
    </div>
  );
};
