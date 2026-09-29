export type DataType = 'text' | 'number' | 'boolean' | 'date' | 'list';

export interface AttributeDefinition {
  id: string;
  name: string;
  dataType: DataType;
  isRequired: boolean;
  options?: string[]; // For 'list' type, comma separated or JSON string in DB
}

export interface BusinessProfile {
  id: string;
  name: string;
  businessType: string;
  productType: string;
  defaultUnit: string;
  useCategories: boolean;
  useProductCodes: boolean;
  useMinStock: boolean;
  useExpirationDates: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  categoryId?: string;
  basePrice: number;
  stockQuantity: number;
  dynamicAttributes: Record<string, any>; // JSON mapping AttributeDefinition.id to value
}
