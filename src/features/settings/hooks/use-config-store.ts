import { create } from 'zustand';
import { Alert } from 'react-native';
import { BusinessProfile, AttributeDefinition } from '@/core/database/schema';
import {
  getBusinessProfile,
  getAttributeDefinitions,
  saveBusinessProfile,
  saveAttributeDefinitions,
} from '@/core/database/db';

interface ConfigState {
  profile: BusinessProfile | null;
  attributes: AttributeDefinition[];
  isLoading: boolean;
  isSaving: boolean;
  loadConfig: () => Promise<void>;
  saveProfile: (profile: BusinessProfile) => Promise<void>;
  saveAttributes: (attributes: AttributeDefinition[]) => Promise<void>;
  setProfile: (profile: BusinessProfile | null) => void;
  setAttributes: (attributes: AttributeDefinition[]) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  profile: null,
  attributes: [],
  isLoading: true,
  isSaving: false,
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
  saveProfile: async (updatedProfile: BusinessProfile) => {
    set({ isSaving: true });
    try {
      await saveBusinessProfile(updatedProfile);
      set({ profile: updatedProfile, isSaving: false });
    } catch (error: any) {
      set({ isSaving: false });
      console.error('Failed to save profile', error);
      throw error;
    }
  },
  saveAttributes: async (updatedAttributes: AttributeDefinition[]) => {
    set({ isSaving: true });
    try {
      await saveAttributeDefinitions(updatedAttributes);
      set({ attributes: updatedAttributes, isSaving: false });
    } catch (error: any) {
      set({ isSaving: false });
      console.error('Failed to save attributes', error);
      throw error;
    }
  },
  setProfile: (profile) => set({ profile }),
  setAttributes: (attributes) => set({ attributes }),
}));
