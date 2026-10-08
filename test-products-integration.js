const fetch = require('node-fetch');
global.fetch = fetch;

process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000/api';

const { saveProduct, getProducts, deleteProduct, saveBusinessProfile, getAttributeDefinitions } = require('./src/core/database/db.ts');

(async () => {
  try {
    // 1. Setup
    await saveBusinessProfile({
      name: 'Integration Test Biz',
      businessType: 'Tech',
      productType: 'Gadgets',
      defaultUnit: 'Unidades',
      useCategories: false,
      useProductCodes: false,
      useMinStock: false,
      useExpirationDates: false,
      theme: 'dark'
    });

    const attributes = await getAttributeDefinitions();
    const sizeAttr = attributes.find(a => a.name === 'Size');
    const colorAttr = attributes.find(a => a.name === 'Material'); // I used 'Material' in previous script

    // 2. Load Products
    let products = await getProducts();

    // 3. Create Product
    console.log('Creating product...');
    const dynamicAttributes = {};
    if (sizeAttr) dynamicAttributes[sizeAttr.id] = 'M'; // 'M' is a valid option

    const newProduct = {
      id: Date.now().toString(), // Mock frontend ID
      name: 'Integration Test Product',
      basePrice: 99.99,
      stockQuantity: 50,
      sku: 'ITP-001',
      categoryId: 'Test Category',
      dynamicAttributes
    };
    await saveProduct(newProduct);
    console.log('Product created successfully');

    // 4. Load Products again
    products = await getProducts();
    const created = products.find(p => p.name === 'Integration Test Product');
    console.log('Created product price:', created.basePrice);

    // 5. Edit product
    console.log('Editing product...');
    const updatedProduct = {
      ...created,
      name: 'Integration Test Product - Updated',
      basePrice: 199.99
    };
    await saveProduct(updatedProduct);
    
    // 6. Load products again to verify edit
    products = await getProducts();
    const verifiedUpdate = products.find(p => p.id === created.id);
    console.log('Updated product name:', verifiedUpdate.name);

    // 7. Test validation error (negative price)
    console.log('Testing validation error (negative price)...');
    try {
      await saveProduct({
        id: Date.now().toString(),
        name: 'Invalid Product',
        basePrice: -10,
        stockQuantity: 10
      });
      console.error('FAIL: Should have thrown validation error');
    } catch (e) {
      console.log('Caught expected error:', e.message);
    }

    // 8. Delete product
    console.log('Deleting product...');
    await deleteProduct(created.id);
    console.log('Product deleted successfully');

    console.log('\n--- Test Successful ---');
  } catch (error) {
    console.error('Test Failed:', error);
  }
})();
