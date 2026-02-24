import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalItems = computed(() => 
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  function addItem(product: { id: number; name: string; price: number; image?: string }) {
    const existingItem = items.value.find(item => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
  }

  function removeItem(productId: number) {
    items.value = items.value.filter(item => item.productId !== productId);
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        removeItem(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  function clearCart() {
    items.value = [];
  }

  // Загрузка из localStorage
  function initCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        items.value = JSON.parse(savedCart);
      } catch (e) {
        items.value = [];
      }
    }
  }

  // Сохранение в localStorage
  items.value = new Proxy(items.value, {
    set: (target, property, value) => {
      const result = Reflect.set(target, property, value);
      if (result) {
        localStorage.setItem('cart', JSON.stringify(items.value));
      }
      return result;
    }
  });

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    initCart
  };
});
