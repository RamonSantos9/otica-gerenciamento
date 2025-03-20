import { supabase } from "@/integrations/supabase/client";
import { Sale } from "./types";
import { formatSaleFromSupabase } from "./utils";

// Sale-related service functions

// Get all sales
export const getSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Erro ao buscar vendas:", error);
    return [];
  }

  const sales = await Promise.all(data.map(formatSaleFromSupabase));
  return sales;
};

// Get sale by ID
export const getSaleById = async (id: string): Promise<Sale | undefined> => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar venda:", error);
    return undefined;
  }

  return await formatSaleFromSupabase(data);
};

// Add a new sale
export const addSale = async (sale: Omit<Sale, "id">): Promise<Sale | null> => {
  // Primeiro insere a venda
  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .insert({
      customer_id: sale.customer_id,
      date: sale.date,
      status: sale.status,
      total: sale.total,
      payment_method: sale.paymentMethod,
    })
    .select()
    .single();

  if (saleError) {
    console.error("Erro ao adicionar venda:", saleError);
    return null;
  }

  // Se houver itens, insere cada um
  if (sale.items && sale.items.length > 0) {
    const saleItems = sale.items.map((item) => ({
      sale_id: saleData.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems);

    if (itemsError) {
      console.error("Erro ao adicionar itens da venda:", itemsError);
      // Não retornamos null aqui porque a venda já foi criada
    }
  }

  // Retorna a venda formatada
  return await formatSaleFromSupabase(saleData);
};

// Get recent sales with optional limit
export const getRecentSales = async (limit: number = 5): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao buscar vendas recentes:", error);
    return [];
  }

  const sales = await Promise.all(data.map(formatSaleFromSupabase));
  return sales;
};
