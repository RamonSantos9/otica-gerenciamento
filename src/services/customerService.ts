
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "./types";
import { formatCustomerFromSupabase } from "./utils";

// Customer-related service functions

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  return data.map(formatCustomerFromSupabase);
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<Customer | undefined> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar cliente:', error);
    return undefined;
  }

  return formatCustomerFromSupabase(data);
};

// Add a new customer
export const addCustomer = async (customer: Omit<Customer, 'id' | 'lastPurchase' | 'totalSpent'>): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      total_spent: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar cliente:', error);
    return null;
  }

  return formatCustomerFromSupabase(data);
};
