export interface ValidationError {
  [key: string]: string;
}

export function validateProductForm(data: {
  title: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
}): ValidationError {
  const errors: ValidationError = {};

  if (!data.title.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  }

  const price = parseFloat(data.price);
  if (isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const stock = parseInt(data.stock);
  if (isNaN(stock) || stock < 0) {
    errors.stock = 'Stock must be 0 or greater';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }

  return errors;
}

export function validateCheckoutForm(data: { address: string }): ValidationError {
  const errors: ValidationError = {};

  if (!data.address.trim()) {
    errors.address = 'Shipping address is required';
  } else if (data.address.trim().length < 10) {
    errors.address = 'Please provide a complete address';
  }

  return errors;
}

export function validateQuantity(quantity: number): string | null {
  if (isNaN(quantity) || quantity < 1) {
    return 'Quantity must be at least 1';
  }
  return null;
}
