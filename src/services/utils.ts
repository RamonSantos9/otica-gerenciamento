
import { supabase } from "@/integrations/supabase/client";
import { Customer, Product, Sale, SaleItem } from "./types";

// Utility functions for formatting data from Supabase

// Format customer data from Supabase
export const formatCustomerFromSupabase = (customer: any): Customer => ({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  phone: customer.phone || '',
  address: customer.address || '',
  lastPurchase: customer.last_purchase ? new Date(customer.last_purchase).toISOString() : '',
  totalSpent: Number(customer.total_spent) || 0,
  isVisible: true,
});

// Format product data from Supabase
export const formatProductFromSupabase = (product: any): Product => ({
  id: product.id,
  name: product.name,
  category: product.category || '',
  brand: product.brand || '',
  price: Number(product.price) || 0,
  stock: product.stock || 0,
  threshold: product.threshold || 5,
  lastRestock: product.last_restock ? new Date(product.last_restock).toISOString() : '',
});

// Format sale data from Supabase, including related data
export const formatSaleFromSupabase = async (sale: any): Promise<Sale> => {
  // Buscar cliente
  const { data: customer } = await supabase
    .from('customers')
    .select('name')
    .eq('id', sale.customer_id)
    .single();

  // Buscar itens da venda
  const { data: items } = await supabase
    .from('sale_items')
    .select('*')
    .eq('sale_id', sale.id);

  const formattedItems: SaleItem[] = items ? items.map(item => ({
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    total: Number(item.total),
  })) : [];

  return {
    id: sale.id,
    customer: customer?.name || 'Cliente não encontrado',
    customer_id: sale.customer_id,
    date: sale.date ? new Date(sale.date).toISOString() : '',
    items: formattedItems,
    status: sale.status as 'pendente' | 'completo' | 'cancelado',
    total: Number(sale.total) || 0,
    paymentMethod: sale.payment_method || '',
  };
};
