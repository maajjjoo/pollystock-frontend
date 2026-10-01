export const ValidationRules = {
  PRODUCT_NAME_MAX: 60,
  CATEGORY_MAX: 40,
  PRODUCT_CODE_MAX: 30,
  CUSTOM_ATTR_NAME_MAX: 40,
  CUSTOM_OPTION_MAX: 30,
  DESCRIPTION_MAX: 200,
  NOTES_MAX: 200,
  BUSINESS_NAME_MAX: 60,
  BUSINESS_TYPE_MAX: 50,
  PRODUCT_TYPE_MAX: 50,
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
