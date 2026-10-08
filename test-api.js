const fetch = require('node-fetch');
global.fetch = fetch;

process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000/api';

const { saveBusinessProfile, getBusinessProfile, saveAttributeDefinitions, getAttributeDefinitions } = require('./src/core/database/db.ts');

(async () => {
  try {
    console.log('1. Trying to get profile (should be not found or existing)');
    let profile = await getBusinessProfile();
    console.log('Initial profile:', profile);

    console.log('2. Saving new business profile');
    await saveBusinessProfile({
      name: 'Frontend Connected Biz',
      businessType: 'Tech',
      productType: 'Gadgets',
      defaultUnit: 'Unidades',
      useCategories: false,
      useProductCodes: false,
      useMinStock: false,
      useExpirationDates: false,
      theme: 'dark'
    });
    console.log('Profile saved successfully.');

    console.log('3. Getting profile again');
    profile = await getBusinessProfile();
    console.log('Saved profile:', profile.name);

    console.log('4. Saving attribute definitions');
    await saveAttributeDefinitions([
      { id: 'attr-1', name: 'Material', dataType: 'text', isRequired: false },
      { id: 'attr-2', name: 'Size', dataType: 'list', isRequired: true, options: ['S', 'M', 'L'] }
    ]);
    console.log('Attributes saved successfully.');

    console.log('5. Getting attributes');
    let attributes = await getAttributeDefinitions();
    console.log('Attributes retrieved:', attributes.length);
    console.log('First attribute dataType:', attributes[0].dataType);
    console.log('Second attribute dataType:', attributes[1].dataType, 'options:', attributes[1].options);

    console.log('\n--- Test Successful ---');
  } catch (error) {
    console.error('Test Failed:', error);
  }
})();
