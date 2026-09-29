import { create } from 'zustand';
import { Product } from '@/core/database/schema';
import { getProducts, saveProduct as dbSaveProduct, deleteProduct as dbDeleteProduct } from '@/core/database/db';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
      await get().loadProducts();
    } catch (error) {
      console.error('Failed to save product', error);
      throw error;
    }
  },
  deleteProduct: async (id) => {
    try {
      await dbDeleteProduct(id);
      await get().loadProducts();
    } catch (error) {
      console.error('Failed to delete product', error);
      throw error;
    }
  },
}));
