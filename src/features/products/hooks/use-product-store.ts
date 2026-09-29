import { create } from 'zustand';
import { Product } from '@/core/database/schema';
import { getProducts, saveProduct as dbSaveProduct } from '@/core/database/db';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  loadProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Failed to load products', error);
      set({ isLoading: false });
    }
  },
  saveProduct: async (product) => {
    try {
      await dbSaveProduct(product);
      // Reload products to keep memory in sync
      await get().loadProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      throw error;
    }
  },
}));
