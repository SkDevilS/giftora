import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      synced: false,

      // Fetch wishlist from backend
      fetchWishlist: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ items: [], synced: false });
          return;
        }

        try {
          const response = await api.get('/wishlist');
          const backendItems = response.data.items || [];
          
          // Transform backend items to match frontend structure
          const transformedItems = backendItems.map(item => ({
            ...item.product,
            wishlistItemId: item.id, // Store backend wishlist item ID
          }));

          set({ items: transformedItems, synced: true });
        } catch (error) {
          console.error('Failed to fetch wishlist:', error);
          set({ items: [], synced: false });
        }
      },

      // Sync local wishlist to backend after login
      syncWishlist: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ items: [], synced: false });
          return;
        }

        const { items } = get();
        if (items.length === 0) {
          await get().fetchWishlist();
          return;
        }

        try {
          // Add each local item to backend
          for (const item of items) {
            await api.post('/wishlist', {
              product_id: item.id,
            });
          }

          // Fetch updated wishlist from backend
          await get().fetchWishlist();
        } catch (error) {
          console.error('Failed to sync wishlist:', error);
        }
      },

      // Add item to wishlist
      addItem: async (product) => {
        const token = localStorage.getItem('access_token');

        // Only allow adding to wishlist when logged in
        if (!token) {
          console.warn('Please login to add items to wishlist');
          return;
        }

        // Add to backend
        try {
          await api.post('/wishlist', {
            product_id: product.id,
          });

          // Refresh wishlist from backend
          await get().fetchWishlist();
          return;
        } catch (error) {
          console.error('Failed to add to wishlist:', error);
        }
      },

      // Remove item from wishlist
      removeItem: async (productId) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const { items } = get();

        try {
          const item = items.find((i) => i.id === productId);

          if (item?.wishlistItemId) {
            await api.delete(`/wishlist/${item.wishlistItemId}`);
          } else {
            // Fallback: remove by product ID
            await api.delete(`/wishlist/product/${productId}`);
          }

          await get().fetchWishlist();
          return;
        } catch (error) {
          console.error('Failed to remove from wishlist:', error);
        }
      },

      // Check if item is in wishlist
      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.id === productId);
      },

      // Clear wishlist
      clearWishlist: async () => {
        const token = localStorage.getItem('access_token');

        // If logged in, clear on backend
        if (token) {
          try {
            await api.delete('/wishlist/clear');
          } catch (error) {
            console.error('Failed to clear wishlist:', error);
          }
        }

        set({ items: [], synced: false });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

