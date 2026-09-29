import { create } from 'zustand';
import { StockMovement } from '@/core/database/schema';
import { getMovements, saveMovement as dbSaveMovement } from '@/core/database/db';

interface MovementState {
  movements: StockMovement[];
  isLoading: boolean;
  loadMovements: (productId?: string) => Promise<void>;
  registerMovement: (movement: StockMovement) => Promise<void>;
}

export const useMovementStore = create<MovementState>((set, get) => ({
  movements: [],
  isLoading: false,
  loadMovements: async (productId?: string) => {
    set({ isLoading: true });
    try {
      const movements = await getMovements(productId);
      set({ movements, isLoading: false });
    } catch (error) {
      console.error('Failed to load movements', error);
      set({ isLoading: false });
    }
  },
  registerMovement: async (movement) => {
    try {
      await dbSaveMovement(movement);
      // We don't blindly reload all here unless we need to, but it's simpler to just prepend
      set((state) => ({
        movements: [movement, ...state.movements]
      }));
    } catch (error) {
      console.error('Failed to register movement', error);
      throw error;
    }
  },
}));
