// Custom type definitions for database tables

// Store settings type definition
export interface StoreSettings {
  id?: string;
  store_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}

// User settings type definition
export interface UserSettings {
  id?: string;
  user_id: string;
  language: string;
  date_format: string;
  dark_mode: boolean;
  notifications: {
    new_sales: boolean;
    low_stock: boolean;
    weekly_reports: boolean;
    system_alerts: boolean;
    user_messages: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// User profile type definition
export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
}

// Email queue type definition
export interface EmailQueue {
  id?: string;
  recipient: string;
  subject: string;
  content: string;
  status: string;
  created_at?: string;
  sent_at?: string;
}

// Database table names
export type DatabaseTable =
  | "profiles"
  | "user_settings"
  | "store_settings"
  | "customers"
  | "products"
  | "reports"
  | "sale_items"
  | "sales"
  | "email_queue";
