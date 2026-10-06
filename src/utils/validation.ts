export const ValidationRules = {
  // 100/200 chars defaults
  BUSINESS_NAME_MAX: 100,
  BUSINESS_DESC_MAX: 200,
  BUSINESS_TYPE_MAX: 100,
  PRODUCT_NAME_MAX: 100,
  PRODUCT_DESC_MAX: 200,
  CATEGORY_MAX: 100,
  PRODUCT_TYPE_MAX: 100,
  CUSTOM_ATTR_NAME_MAX: 100,
  CUSTOM_OPTION_MAX: 100,
  NOTES_MAX: 200,
  AI_QUESTION_MAX: 500,

  // Short text fields
  PRODUCT_CODE_MAX: 30,
  REFERENCE_MAX: 30,
  BRAND_MAX: 60,
  MODEL_MAX: 60,
  COLOR_MAX: 40,
  SIZE_MAX: 20,
  UNIT_MAX: 30,

  // Numeric fields
  PRICE_MAX: 12,
  QUANTITY_MAX: 10,
  WEIGHT_MAX: 10,
  MIN_STOCK_MAX: 10,
  PERCENTAGE_MAX: 5,
  YEAR_MAX: 4,
  PHONE_MAX: 15,
};

export function validateRequired(value: string | undefined | null): string | null {
  if (!value || value.trim() === '') {
    return 'Este campo es obligatorio.';
  }
  return null;
}

export function validateMaxLength(value: string | undefined | null, max: number): string | null {
  if (value && value.length > max) {
    return `Máximo ${max} caracteres.`;
  }
  return null;
}

export function validateNumeric(value: string | undefined | null): string | null {
  if (!value || value.trim() === '') return null; // Let required handle emptiness
  const num = Number(value.replace(',', '.')); // Replace comma with dot for validation
  if (isNaN(num)) {
    return 'Ingresa un número válido.';
  }
  return null;
}

export function validatePositiveNumber(value: string | undefined | null, allowZero = true): string | null {
  const numericError = validateNumeric(value);
  if (numericError) return numericError;
  
  if (!value || value.trim() === '') return null;
  
  const num = Number(value.replace(',', '.'));
  if (num < 0) {
    return 'El valor no puede ser negativo.';
  }
  if (!allowZero && num === 0) {
    return 'El valor debe ser mayor que 0.';
  }
  return null;
}

export function sanitizeNumericInput(value: string): string {
  // Allow only digits, dot, and comma
  return value.replace(/[^0-9.,]/g, '');
}
