import * as SQLite from 'expo-sqlite';
import { BusinessProfile, AttributeDefinition } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('pollystock.db');
    await initDb(db);
  }
  return db;
}

async function initDb(database: SQLite.SQLiteDatabase) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS business_profile (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      businessType TEXT NOT NULL,
      productType TEXT NOT NULL,
      defaultUnit TEXT NOT NULL,
      useCategories INTEGER NOT NULL DEFAULT 0,
      useProductCodes INTEGER NOT NULL DEFAULT 0,
      useMinStock INTEGER NOT NULL DEFAULT 0,
      useExpirationDates INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attribute_definition (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      dataType TEXT NOT NULL,
      isRequired INTEGER NOT NULL DEFAULT 0,
      options TEXT
    );

    CREATE TABLE IF NOT EXISTS product (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT,
      categoryId TEXT,
      basePrice REAL NOT NULL DEFAULT 0,
      stockQuantity REAL NOT NULL DEFAULT 0,
      dynamicAttributes TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS stock_movement (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (productId) REFERENCES product (id) ON DELETE CASCADE
    );
  `);
}

export async function saveBusinessProfile(profile: BusinessProfile) {
  const database = await getDb();
  await database.runAsync(`
    INSERT OR REPLACE INTO business_profile 
    (id, name, businessType, productType, defaultUnit, useCategories, useProductCodes, useMinStock, useExpirationDates)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    profile.id, profile.name, profile.businessType, profile.productType, profile.defaultUnit,
    profile.useCategories ? 1 : 0, profile.useProductCodes ? 1 : 0, profile.useMinStock ? 1 : 0, profile.useExpirationDates ? 1 : 0
  ]);
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const database = await getDb();
  const result = await database.getFirstAsync<any>('SELECT * FROM business_profile LIMIT 1');
  if (!result) return null;
  
  return {
    ...result,
    useCategories: result.useCategories === 1,
    useProductCodes: result.useProductCodes === 1,
    useMinStock: result.useMinStock === 1,
    useExpirationDates: result.useExpirationDates === 1,
  };
}

export async function saveAttributeDefinitions(attributes: AttributeDefinition[]) {
  const database = await getDb();
  // Simplified: clear and re-insert for configuration stage
  // In a real scenario, we'd handle updates/deletions more carefully to not break products,
  // but during initial config, this is safe.
  await database.runAsync('DELETE FROM attribute_definition');
  
  for (const attr of attributes) {
    await database.runAsync(`
      INSERT INTO attribute_definition (id, name, dataType, isRequired, options)
      VALUES (?, ?, ?, ?, ?)
    `, [attr.id, attr.name, attr.dataType, attr.isRequired ? 1 : 0, attr.options ? JSON.stringify(attr.options) : null]);
  }
}

export async function getAttributeDefinitions(): Promise<AttributeDefinition[]> {
  const database = await getDb();
  const results = await database.getAllAsync<any>('SELECT * FROM attribute_definition');
  return results.map(row => ({
    ...row,
    isRequired: row.isRequired === 1,
    options: row.options ? JSON.parse(row.options) : undefined
  }));
}

export async function saveProduct(product: import('./schema').Product) {
  const database = await getDb();
  await database.runAsync(`
    INSERT OR REPLACE INTO product 
    (id, name, sku, categoryId, basePrice, stockQuantity, dynamicAttributes) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    product.id, 
    product.name, 
    product.sku || null, 
    product.categoryId || null, 
    product.basePrice, 
    product.stockQuantity, 
    JSON.stringify(product.dynamicAttributes)
  ]);
}

export async function getProducts(): Promise<import('./schema').Product[]> {
  const database = await getDb();
  const results = await database.getAllAsync<any>('SELECT * FROM product ORDER BY name ASC');
  return results.map(row => ({
    ...row,
    dynamicAttributes: JSON.parse(row.dynamicAttributes)
  }));
}

export async function deleteProduct(id: string) {
  const database = await getDb();
  await database.runAsync('DELETE FROM product WHERE id = ?', [id]);
}

export async function saveMovement(movement: import('./schema').StockMovement) {
  const database = await getDb();
  await database.runAsync(`
    INSERT INTO stock_movement (id, productId, type, quantity, date, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [movement.id, movement.productId, movement.type, movement.quantity, movement.date, movement.note || null]);
}

export async function getMovements(productId?: string): Promise<import('./schema').StockMovement[]> {
  const database = await getDb();
  if (productId) {
    return await database.getAllAsync<any>('SELECT * FROM stock_movement WHERE productId = ? ORDER BY date DESC', [productId]);
  }
  return await database.getAllAsync<any>('SELECT * FROM stock_movement ORDER BY date DESC');
}
