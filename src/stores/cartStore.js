import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      synced: false,

      // Fetch cart from backend
      fetchCart: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ items: [], synced: false });
          return;
        }

        try {
          const response = await api.get('/cart');
          const backendItems = response.data.items || [];
          
          // Transform backend items to match frontend structure
          const transformedItems = backendItems.map(item => ({
            id: item.product.id,
            ...item.product,
            quantity: item.quantity,
            selectedSize: item.size,
            selectedColor: item.color,
            cartItemId: item.id, // Store backend cart item ID
          }));

          set({ items: transformedItems, synced: true });
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          set({ items: [], synced: false });
        }
      },

      // Sync local cart to backend after login
      syncCart: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ items: [], synced: false });
          return;
        }

        const { items } = get();
        if (items.length === 0) {
          await get().fetchCart();
          return;
        }

        try {
          // Add each local item to backend
          for (const item of items) {
            await api.post('/cart', {
              product_id: item.id,
              quantity: item.quantity,
              size: item.selectedSize,
              color: item.selectedColor,
            });
          }

          // Fetch updated cart from backend
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },

      // Add item to cart
      addItem: async (product, quantity = 1, selectedSize = null, selectedColor = null) => {
        const token = localStorage.getItem('access_token');

        // Only allow adding to cart when logged in
        if (!token) {
          console.warn('Please login to add items to cart');
          return;
        }

        // Add to backend
        try {
          const response = await api.post('/cart', {
            product_id: product.id,
            quantity,
            size: selectedSize,
            color: selectedColor,
          });

          // Refresh cart from backend
          await get().fetchCart();
          return;
        } catch (error) {
          console.error('Failed to add to cart:', error);
        }
      },

      // Remove item from cart
      removeItem: async (itemId, selectedSize = null, selectedColor = null) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const { items } = get();

        try {
          const item = items.find(
            (i) => i.id === itemId && i.selectedSize === selectedSize && i.selectedColor === selectedColor
          );

          if (item?.cartItemId) {
            await api.delete(`/cart/${item.cartItemId}`);
            await get().fetchCart();
            return;
          }
        } catch (error) {
          console.error('Failed to remove from cart:', error);
        }
      },

      // Update quantity
      updateQuantity: async (itemId, quantity, selectedSize = null, selectedColor = null) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const { items } = get();

        try {
          const item = items.find(
            (i) => i.id === itemId && i.selectedSize === selectedSize && i.selectedColor === selectedColor
          );

          if (item?.cartItemId) {
            await api.put(`/cart/${item.cartItemId}`, { quantity });
            await get().fetchCart();
            return;
          }
        } catch (error) {
          console.error('Failed to update cart:', error);
        }
      },

      // Clear cart
      clearCart: async () => {
        const token = localStorage.getItem('access_token');

        // If logged in, clear on backend
        if (token) {
          try {
            await api.delete('/cart/clear');
          } catch (error) {
            console.error('Failed to clear cart:', error);
          }
        }

        set({ items: [], synced: false });
      },

      // Get total
      getTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          const price = item.is_on_sale ? item.price : item.original_price || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      // Get item count
      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

