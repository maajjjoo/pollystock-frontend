import { BusinessProfile, AttributeDefinition, Product, StockMovement, DataType } from './schema';
import { apiClient, ApiError } from '../api/client';

// MAPPING UTILS
const mapToBackendType = (type: DataType): string => {
  if (type === 'list') return 'OPTIONS';
  return type.toUpperCase();
};

const mapToFrontendType = (type: string): DataType => {
  if (type === 'OPTIONS') return 'list';
  return type.toLowerCase() as DataType;
};

const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// IN-MEMORY MOCK DATA STORE (For Movements only during this stage)
let mockMovements: StockMovement[] = [];

export async function getDb() {
  return {}; 
}

// BUSINESS PROFILE
export async function saveBusinessProfile(profile: BusinessProfile) {
  await apiClient.put('/business', profile);
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  try {
    return await apiClient.get<BusinessProfile>('/business');
  } catch (error: any) {
    if (error instanceof ApiError && error.code === 'NOT_FOUND') {
      return null;
    }
    throw error;
  }
}

// ATTRIBUTE DEFINITIONS
export async function saveAttributeDefinitions(attributes: AttributeDefinition[]) {
  const backendAttrs = attributes.map(a => ({
    id: isUUID(a.id) ? a.id : undefined,
    name: a.name,
    dataType: mapToBackendType(a.dataType),
    isRequired: a.isRequired,
    options: a.options ? JSON.stringify(a.options) : null
  }));
  await apiClient.post('/attributes', { attributes: backendAttrs });
}

export async function getAttributeDefinitions(): Promise<AttributeDefinition[]> {
  try {
    const backendAttrs = await apiClient.get<any[]>('/attributes');
    return backendAttrs.map(a => ({
      id: a.id,
      name: a.name,
      dataType: mapToFrontendType(a.dataType),
      isRequired: a.isRequired,
      options: a.options ? JSON.parse(a.options) : undefined
    }));
  } catch (error: any) {
    if (error instanceof ApiError && error.code === 'NOT_FOUND') {
      return [];
    }
    throw error;
  }
}

// PRODUCTS (Integrated with Backend)
export async function saveProduct(product: Product) {
  const backendData = {
    name: product.name,
    basePrice: product.basePrice,
    stockQuantity: product.stockQuantity,
    sku: product.sku || null,
    category: product.categoryId || null,
    imageUrl: product.imageUrl || null,
    dynamicAttributes: product.dynamicAttributes || {}
  };

  if (isUUID(product.id)) {
    // Exists on backend, so update it
    await apiClient.put('/products/' + product.id, backendData);
  } else {
    // New product
    await apiClient.post('/products', backendData);
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const backendProducts = await apiClient.get<any[]>('/products');
    return backendProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || undefined,
      categoryId: p.category || undefined,
      imageUrl: p.imageUrl || undefined,
      basePrice: Number(p.basePrice),
      stockQuantity: Number(p.stockQuantity),
      dynamicAttributes: p.dynamicAttributes || {}
    }));
  } catch (error: any) {
    if (error instanceof ApiError && error.code === 'NO_BUSINESS') {
      return [];
    }
    throw error;
  }
}

export async function deleteProduct(id: string) {
  try {
    await apiClient.delete('/products/' + id);
  } catch (error: any) {
    if (error instanceof ApiError && error.code === 'PRODUCT_HAS_MOVEMENTS') {
      throw new Error('No se puede eliminar un producto que tiene movimientos registrados.');
    }
    throw error;
  }
}

// MOVEMENTS (Mock remaining)
export async function saveMovement(movement: StockMovement) {
  mockMovements.unshift({ ...movement });
}

export async function getMovements(productId?: string): Promise<StockMovement[]> {
  if (productId) {
    return mockMovements.filter(m => m.productId === productId);
  }
  return [...mockMovements];
}
