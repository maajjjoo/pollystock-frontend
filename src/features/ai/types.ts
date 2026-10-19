export type HistorySufficiencyLevel = 'NONE' | 'MINIMAL' | 'PARTIAL' | 'SUFFICIENT';

export interface HistorySufficiency {
  level: HistorySufficiencyLevel;
  hasProducts: boolean;
  hasMovements: boolean;
  hasExitMovements: boolean;
  reason: string;
  canEstimateTrends: boolean;
  canEstimateReplenishment: boolean;
}

export interface StockSummary {
  totalProducts: number;
  totalUnitsInStock: number;
  totalInventoryValue: number;
  inStockProductsCount: number;
}

export interface StockoutMetrics {
  outOfStockCount: number;
  outOfStockProducts: Array<{
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
    stockQuantity: number;
  }>;
}

export interface MinStockMetrics {
  isMinStockEnabled: boolean;
  minStockThreshold: number | null;
  lowStockCount: number;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
    stockQuantity: number;
    threshold: number;
    deficit: number;
  }>;
}

export interface PeriodMovementMetrics {
  periodDays: number;
  startDate: string;
  endDate: string;
  entryMovementsCount: number;
  exitMovementsCount: number;
  entryUnitsTotal: number;
  exitUnitsTotal: number;
  netUnitsBalance: number;
}

export interface TopProductMetric {
  productId: string;
  name: string;
  sku: string | null;
  category: string | null;
  currentStock: number;
  exitUnits: number;
  exitMovementsCount: number;
}

export interface InactiveProductMetric {
  productId: string;
  name: string;
  sku: string | null;
  category: string | null;
  currentStock: number;
  hasEverExited: boolean;
  lastExitDate: string | null;
}

export interface InventoryAnalytics {
  business: {
    id: string;
    name: string;
    businessType: string;
    defaultUnit: string;
  };
  generatedAt: string;
  stockSummary: StockSummary;
  stockoutMetrics: StockoutMetrics;
  minStockMetrics: MinStockMetrics;
  periods: {
    last7Days: PeriodMovementMetrics;
    last30Days: PeriodMovementMetrics;
  };
  topExitedProducts: {
    last7Days: TopProductMetric[];
    last30Days: TopProductMetric[];
  };
  productsWithoutExitLast30Days: {
    count: number;
    products: InactiveProductMetric[];
  };
  historySufficiency: HistorySufficiency;
}

export interface AIInsightsData {
  summary: string;
  metrics: InventoryAnalytics;
  historySufficiency: HistorySufficiency;
  model: string;
  generatedAt: string;
}

export interface AIChatRequest {
  message: string;
  businessId?: string;
}

export interface AIChatData {
  reply: string;
  historySufficiency: HistorySufficiency;
  model: string;
  timestamp: string;
}
