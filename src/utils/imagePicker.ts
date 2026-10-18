import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Abre la galería del dispositivo para que el usuario seleccione una imagen para el producto.
 * Retorna una data URI en base64 para persistencia confiable y compatibilidad universal
 * (Web, Android, iOS y reinicio de la app), o null si se cancela o rechaza el permiso.
 */
export async function pickImageFromLibrary(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se requiere permiso de acceso a la galería para seleccionar imágenes de tus productos.'
        );
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      return `data:${mime};base64,${asset.base64}`;
    }

    return asset.uri;
  } catch (error: any) {
    console.error('Error al abrir la galería:', error);
    Alert.alert(
      'Error al abrir galería',
      error?.message || 'No se pudo abrir el selector de imágenes de la galería.'
    );
    return null;
  }
}

/**
 * Abre la cámara del dispositivo para capturar una foto del producto.
 * Retorna una data URI en base64, o null si se cancela o rechaza el permiso.
 */
export async function takePhotoWithCamera(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se requiere permiso para usar la cámara y capturar fotos de tus productos.'
        );
        return null;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      return `data:${mime};base64,${asset.base64}`;
    }

    return asset.uri;
  } catch (error: any) {
    console.error('Error al usar la cámara:', error);
    Alert.alert(
      'Error al usar la cámara',
      error?.message || 'No se pudo activar la cámara para tomar la fotografía.'
    );
    return null;
  }
}
