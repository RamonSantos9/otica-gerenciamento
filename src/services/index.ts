
// Main export file that re-exports all service functions for better import experience

// Export types
export * from './types';

// Export customer services
export * from './customerService';

// Export product services
export * from './productService';

// Export sale services
export * from './saleService';

// Export dashboard services
export * from './dashboardService';

// Export report services
export * from './reportService';

// Export reports service
// Use a more specific export to avoid name conflicts with the Report type from types.ts
export { 
  getReports, 
  saveReport,
  // Export the Report type with an alias to avoid conflict
  type Report as ReportData 
} from './reportsService';

