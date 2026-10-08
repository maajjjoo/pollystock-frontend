import { create } from 'zustand';
import { Alert } from 'react-native';
import { BusinessProfile, AttributeDefinition } from '@/core/database/schema';
import { getBusinessProfile, getAttributeDefinitions } from '@/core/database/db';

interface ConfigState {
  profile: BusinessProfile | null;
  attributes: AttributeDefinition[];
  isLoading: boolean;
  loadConfig: () => Promise<void>;
  setProfile: (profile: BusinessProfile) => void;
  setAttributes: (attributes: AttributeDefinition[]) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  profile: null,
  attributes: [],
  isLoading: true,
  loadConfig: async () => {
    set({ isLoading: true });
    try {
      const profile = await getBusinessProfile();
      const attributes = await getAttributeDefinitions();
      set({ profile, attributes, isLoading: false });
    } catch (error: any) {
      console.error('Failed to load config', error);
      Alert.alert('Error de conexión', error.message || 'No se pudo cargar la configuración.');
      set({ isLoading: false });
    }
  },
  setProfile: (profile) => set({ profile }),
  setAttributes: (attributes) => set({ attributes }),
}));
