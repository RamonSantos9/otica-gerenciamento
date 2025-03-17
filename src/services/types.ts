
// Types for the data models used across the application

// Customer type
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  lastPurchase: string;
  totalSpent: number;
  isVisible?: boolean;
};

// Product type
export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  threshold: number;
  lastRestock: string;
};

// Sale item type
export type SaleItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// Sale type
export type Sale = {
  id: string;
  customer: string;
  customer_id: string;
  date: string;
  items: SaleItem[];
  status: 'pendente' | 'completo' | 'cancelado';
  total: number;
  paymentMethod: string;
};

// Dashboard statistics type
export type DashboardStats = {
  totalSales: number;
  monthlySales: number;
  activeCustomers: number;
  lowStockItems: number;
  recentSales: Sale[];
  salesByMonth: Array<{ month: string; total: number }>;
  topProducts: Array<{ name: string; sales: number }>;
};

// Report type
export type Report = {
  id: string;
  title: string;
  createdBy: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  totalValue: number;
};
