import React, { useState } from 'react';
import { Gem, ShoppingBag, Tag, Trash2, Plus, Minus, Send, User } from 'lucide-react';
import { FirsatProduct, CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CustomerOrderModal } from './CustomerOrderModal';

interface FirsatViewProps {
  firsatProducts: FirsatProduct[];
  cart: Record<string, CartItem>;
  onAddToCart: (item: FirsatProduct) => void;
  onUpdateQuantity: (productId: string, type: 'sell' | 'buy', delta: number) => void;
  onRemoveItem: (productId: string, type: 'sell' | 'buy') => void;
  onClearCart: () => void;
}

export const FirsatView: React.FC<FirsatViewProps> = ({
  firsatProducts,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const cartItems: CartItem[] = Object.values(cart);
  const totalCartPrice: number = cartItems.reduce(
    (sum: number, item: CartItem) =>
      sum + (item.type === 'sell' ? item.price * item.quantity : -(item.price * item.quantity)),
    0
  );

  const handleOpenOrderModal = () => {
    setIsCustomerModalOpen(true);
  };

  return (
    <div className="w-full px-3.5 mb-28 max-w-lg mx-auto space-y-4">
      {/* Top Banner - Matches IMG_7094.png */}
      <div className="bg-gradient-to-r from-[#C29547] via-[#A87B2E] to-[#91651F] rounded-3xl p-5 text-white shadow-md relative overflow-hidden flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-100 flex-shrink-0 shadow-inner">
          <Gem className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif-luxury text-2xl font-bold text-white tracking-tight leading-tight">
            Fırsat Ürünleri
          </h2>
          <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
            Mağazamıza özel, sınırlı sayıdaki fırsat ürünlerini buradan inceleyip sepete ekleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* 2-Column Product Grid - Matches IMG_7094.png */}
      <div className="grid grid-cols-2 gap-3.5">
        {firsatProducts.map((item) => (
          <div
            key={item.id}
            id={`firsat-card-${item.id}`}
            className="bg-white dark:bg-[#18181D] rounded-3xl p-2.5 border border-stone-200/80 dark:border-[#2E2E38] shadow-xs flex flex-col justify-between overflow-hidden hover:shadow-md transition-all"
          >
            {/* Image Container with FIRSAT Pill Badge */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#252530]">
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span className="absolute top-2.5 left-2.5 bg-[#8C6422]/90 backdrop-blur-xs text-amber-100 text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                {item.tag || 'FIRSAT'}
              </span>
              <span className="absolute top-2.5 right-2.5 bg-indigo-900/90 backdrop-blur-xs text-indigo-100 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs border border-indigo-400/30">
                3 Taksit
              </span>
            </div>

            {/* Product Details */}
            <div className="p-1 flex flex-col justify-between flex-1 mt-2">
              <div>
                <h3 className="font-serif-luxury font-bold text-sm text-stone-900 dark:text-white line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{item.weight}</p>
              </div>

              <div className="mt-2">
                <div className="font-bold text-base sm:text-lg text-stone-900 dark:text-white">
                  {formatCurrency(item.price)}
                </div>

                <button
                  type="button"
                  id={`btn-add-firsat-${item.id}`}
                  onClick={() => onAddToCart(item)}
                  className="w-full py-2.5 px-2 rounded-xl bg-gradient-to-r from-[#C49746] to-[#9E7329] hover:from-[#B58737] hover:to-[#8E631B] text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sepete Ekle</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* İşlem Özeti - Matches IMG_7094.png */}
      <div className="bg-white dark:bg-[#18181D] rounded-3xl p-4 sm:p-5 border border-stone-200/80 dark:border-[#2E2E38] shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#252530]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="font-serif-luxury font-bold text-base text-stone-900 dark:text-white">
              İşlem Özeti
            </h3>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              id="btn-clear-cart-firsat"
              onClick={onClearCart}
              className="text-[10px] font-bold tracking-wider text-stone-400 hover:text-rose-600 border border-stone-200 dark:border-[#383848] hover:border-rose-200 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              TEMİZLE
            </button>
          )}
        </div>

        {/* Empty or Filled Cart State */}
        {cartItems.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100/80 dark:bg-[#252018] text-amber-800 dark:text-amber-400 flex items-center justify-center mb-2.5 shadow-xs">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 max-w-xs leading-relaxed">
              Sepetiniz boş — Lütfen ürün seçiniz yada &quot;Hurda Altın&quot; sayfasından işlem yapınız.
            </p>
          </div>
        ) : (
          <div className="pt-3 space-y-3">
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-stone-100 dark:divide-[#252530]">
              {cartItems.map((c) => (
                <div
                  key={`${c.productId}-${c.type}`}
                  className="pt-2 flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">{c.name}</div>
                    <div className="text-[11px] text-stone-400 dark:text-stone-500">
                      {c.type === 'sell' ? 'Satın Alma' : 'Bozdurma'} • Adet:{' '}
                      {formatCurrency(c.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center border border-stone-200 dark:border-[#383848] rounded-lg bg-stone-50 dark:bg-[#202028]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(c.productId, c.type, -1)}
                        className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-stone-800 dark:text-stone-200 text-xs">{c.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(c.productId, c.type, 1)}
                        className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-bold text-stone-900 dark:text-stone-100 text-right min-w-[70px]">
                      {formatCurrency(c.price * c.quantity)}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(c.productId, c.type)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-[#2E2E38] flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Genel Tutar:</span>
              <span className="font-serif-luxury font-bold text-lg text-amber-900 dark:text-amber-400">
                {formatCurrency(Math.abs(totalCartPrice))}
              </span>
            </div>

            <button
              type="button"
              id="btn-whatsapp-order-firsat"
              onClick={handleOpenOrderModal}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Sipariş oluşturmak için lütfen dokunun (MÜŞTERİ BİLGİLERİ)</span>
            </button>
          </div>
        )}
      </div>

      {/* Customer Info Order Modal */}
      <CustomerOrderModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        cartItems={cartItems}
        totalAmount={Math.abs(totalCartPrice)}
      />
    </div>
  );
};
