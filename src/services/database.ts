/**
 * Servicio de Base de Datos Local (usando localStorage)
 * Simula una base de datos SQLite para persistir datos de recibos y electrodomésticos
 */

export interface ReceiptRecord {
  id: string;
  period: string;
  consumption: number;
  amount: number;
  dueDate: string;
  previousConsumption?: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  // Datos adicionales extraídos de la imagen
  rawData?: Record<string, any>;
}

export interface ApplianceRecord {
  id: string;
  name: string;
  type: string;
  consumption: number; // Watts
  hoursPerDay: number;
  image?: string;
  detected: boolean;
  createdAt: string;
  updatedAt: string;
  // Datos adicionales
  notes?: string;
}

export interface DBSchema {
  receipts: ReceiptRecord[];
  appliances: ApplianceRecord[];
  metadata: {
    version: string;
    lastSync: string;
  };
}

const DB_KEY = 'ahorrapp_database';
const DB_VERSION = '1.0.0';

/**
 * Inicializa la base de datos
 */
function initDB(): DBSchema {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (error) {
      console.error('Error parsing DB:', error);
    }
  }

  const initialDB: DBSchema = {
    receipts: [],
    appliances: [],
    metadata: {
      version: DB_VERSION,
      lastSync: new Date().toISOString()
    }
  };

  localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
  return initialDB;
}

/**
 * Guarda la base de datos
 */
function saveDB(db: DBSchema): void {
  db.metadata.lastSync = new Date().toISOString();
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/**
 * Obtiene la base de datos actual
 */
function getDB(): DBSchema {
  return initDB();
}

// ============= RECIBOS =============

/**
 * Guarda un recibo en la base de datos
 */
export function saveReceipt(receipt: Omit<ReceiptRecord, 'createdAt' | 'updatedAt'>): ReceiptRecord {
  const db = getDB();
  
  const now = new Date().toISOString();
  const receiptRecord: ReceiptRecord = {
    ...receipt,
    createdAt: now,
    updatedAt: now
  };

  // Buscar si ya existe uno con el mismo ID
  const existingIndex = db.receipts.findIndex(r => r.id === receipt.id);
  
  if (existingIndex >= 0) {
    // Actualizar existente
    receiptRecord.createdAt = db.receipts[existingIndex].createdAt;
    db.receipts[existingIndex] = receiptRecord;
  } else {
    // Agregar nuevo
    db.receipts.push(receiptRecord);
  }

  saveDB(db);
  console.log('✅ Recibo guardado en BD:', receiptRecord);
  return receiptRecord;
}

/**
 * Obtiene el último recibo registrado
 */
export function getLatestReceipt(): ReceiptRecord | null {
  const db = getDB();
  if (db.receipts.length === 0) return null;
  
  // Ordenar por fecha de creación descendente
  const sorted = [...db.receipts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return sorted[0];
}

/**
 * Obtiene todos los recibos
 */
export function getAllReceipts(): ReceiptRecord[] {
  const db = getDB();
  return db.receipts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Obtiene un recibo por ID
 */
export function getReceiptById(id: string): ReceiptRecord | null {
  const db = getDB();
  return db.receipts.find(r => r.id === id) || null;
}

/**
 * Elimina un recibo
 */
export function deleteReceipt(id: string): boolean {
  const db = getDB();
  const initialLength = db.receipts.length;
  db.receipts = db.receipts.filter(r => r.id !== id);
  
  if (db.receipts.length < initialLength) {
    saveDB(db);
    return true;
  }
  return false;
}

// ============= ELECTRODOMÉSTICOS =============

/**
 * Guarda un electrodoméstico en la base de datos
 */
export function saveAppliance(appliance: Omit<ApplianceRecord, 'createdAt' | 'updatedAt'>): ApplianceRecord {
  const db = getDB();
  
  const now = new Date().toISOString();
  const applianceRecord: ApplianceRecord = {
    ...appliance,
    createdAt: now,
    updatedAt: now
  };

  // Buscar si ya existe uno con el mismo ID
  const existingIndex = db.appliances.findIndex(a => a.id === appliance.id);
  
  if (existingIndex >= 0) {
    // Actualizar existente
    applianceRecord.createdAt = db.appliances[existingIndex].createdAt;
    db.appliances[existingIndex] = applianceRecord;
  } else {
    // Agregar nuevo
    db.appliances.push(applianceRecord);
  }

  saveDB(db);
  console.log('✅ Electrodoméstico guardado en BD:', applianceRecord);
  return applianceRecord;
}

/**
 * Obtiene todos los electrodomésticos
 */
export function getAllAppliances(): ApplianceRecord[] {
  const db = getDB();
  return db.appliances.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Obtiene un electrodoméstico por ID
 */
export function getApplianceById(id: string): ApplianceRecord | null {
  const db = getDB();
  return db.appliances.find(a => a.id === id) || null;
}

/**
 * Actualiza un electrodoméstico
 */
export function updateAppliance(id: string, updates: Partial<ApplianceRecord>): ApplianceRecord | null {
  const db = getDB();
  const index = db.appliances.findIndex(a => a.id === id);
  
  if (index >= 0) {
    db.appliances[index] = {
      ...db.appliances[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDB(db);
    return db.appliances[index];
  }
  
  return null;
}

/**
 * Elimina un electrodoméstico
 */
export function deleteAppliance(id: string): boolean {
  const db = getDB();
  const initialLength = db.appliances.length;
  db.appliances = db.appliances.filter(a => a.id !== id);
  
  if (db.appliances.length < initialLength) {
    saveDB(db);
    return true;
  }
  return false;
}

// ============= ESTADÍSTICAS =============

/**
 * Obtiene estadísticas generales
 */
export function getStats() {
  const db = getDB();
  const latestReceipt = getLatestReceipt();
  
  const totalAppliances = db.appliances.length;
  const totalDailyConsumption = db.appliances.reduce(
    (sum, app) => sum + (app.consumption * app.hoursPerDay) / 1000,
    0
  );
  const totalMonthlyConsumption = totalDailyConsumption * 30;
  const estimatedMonthlyCost = totalMonthlyConsumption * 0.15;

  return {
    totalReceipts: db.receipts.length,
    totalAppliances,
    latestReceipt,
    totalDailyConsumption,
    totalMonthlyConsumption,
    estimatedMonthlyCost,
    lastUpdate: db.metadata.lastSync
  };
}

/**
 * Limpia toda la base de datos (usar con cuidado)
 */
export function clearDatabase(): void {
  localStorage.removeItem(DB_KEY);
  initDB();
  console.log('🗑️ Base de datos limpiada');
}

/**
 * Exporta la base de datos como JSON
 */
export function exportDatabase(): string {
  const db = getDB();
  return JSON.stringify(db, null, 2);
}

/**
 * Importa una base de datos desde JSON
 */
export function importDatabase(jsonData: string): boolean {
  try {
    const db = JSON.parse(jsonData) as DBSchema;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    console.log('✅ Base de datos importada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al importar base de datos:', error);
    return false;
  }
}
