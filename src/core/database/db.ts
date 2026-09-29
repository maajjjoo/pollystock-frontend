import { BusinessProfile, AttributeDefinition, Product, StockMovement } from './schema';

// IN-MEMORY MOCK DATA STORE (Replaces SQLite for Web testing)
let mockProfile: BusinessProfile | null = null;
let mockAttributes: AttributeDefinition[] = [];
let mockProducts: Product[] = [];
let mockMovements: StockMovement[] = [];

export async function getDb() {
  // Mock function to keep signature compatibility if needed elsewhere
  return {}; 
}

export async function saveBusinessProfile(profile: BusinessProfile) {
  mockProfile = { ...profile };
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  return mockProfile ? { ...mockProfile } : null;
}

export async function saveAttributeDefinitions(attributes: AttributeDefinition[]) {
  mockAttributes = [...attributes];
}

export async function getAttributeDefinitions(): Promise<AttributeDefinition[]> {
  return [...mockAttributes];
}

export async function saveProduct(product: Product) {
  const index = mockProducts.findIndex(p => p.id === product.id);
  if (index >= 0) {
    mockProducts[index] = { ...product };
  } else {
    mockProducts.push({ ...product });
  }
}

export async function getProducts(): Promise<Product[]> {
  return [...mockProducts].sort((a, b) => a.name.localeCompare(b.name));
}

export async function deleteProduct(id: string) {
  mockProducts = mockProducts.filter(p => p.id !== id);
}

export async function saveMovement(movement: StockMovement) {
  mockMovements.unshift({ ...movement }); // Add to beginning
}

export async function getMovements(productId?: string): Promise<StockMovement[]> {
  if (productId) {
    return mockMovements.filter(m => m.productId === productId);
  }
  return [...mockMovements];
}
