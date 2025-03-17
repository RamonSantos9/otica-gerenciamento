
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "./types";
import { getRecentSales } from "./saleService";

// Dashboard-related service functions

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Buscar vendas totais
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('total, date, status');
    
    if (salesError) throw salesError;

    // Calcular vendas totais e do mês
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = (currentMonth - 1 + 12) % 12;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const totalSales = salesData
      .filter(sale => sale.status === 'completo')
      .reduce((sum, sale) => sum + Number(sale.total), 0);
    
    const monthlySales = salesData
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return sale.status === 'completo' && 
               saleDate.getMonth() === currentMonth && 
               saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + Number(sale.total), 0);

    const previousMonthSales = salesData
      .filter(sale => {
        const saleDate = new Date(sale.date);
        return sale.status === 'completo' && 
               saleDate.getMonth() === previousMonth && 
               saleDate.getFullYear() === previousMonthYear;
      })
      .reduce((sum, sale) => sum + Number(sale.total), 0);

    // Buscar clientes ativos (com compras no último mês)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const { data: activeCustomersData, error: customersError } = await supabase
      .from('customers')
      .select('id')
      .gte('last_purchase', oneMonthAgo.toISOString());
    
    if (customersError) throw customersError;
    
    const activeCustomers = activeCustomersData.length;

    // Buscar produtos com estoque baixo
    const { data: lowStockData, error: stockError } = await supabase
      .from('products')
      .select('*')
      .lt('stock', 5) // Using a direct number instead of rpc
    
    if (stockError) throw stockError;
    
    const lowStockItems = lowStockData.length;

    // Buscar vendas recentes
    const recentSales = await getRecentSales(4);

    // Calcular vendas por mês (últimos 12 meses)
    const salesByMonth: Array<{ month: string; total: number }> = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const yearOffset = (currentMonth - i < 0) ? -1 : 0;
      const monthYear = currentYear + yearOffset;
      
      const monthTotal = salesData
        .filter(sale => {
          const saleDate = new Date(sale.date);
          return sale.status === 'completo' && 
                 saleDate.getMonth() === monthIndex && 
                 saleDate.getFullYear() === monthYear;
        })
        .reduce((sum, sale) => sum + Number(sale.total), 0);
      
      salesByMonth.unshift({ month: months[monthIndex], total: monthTotal });
    }

    // Buscar top produtos
    // Criando uma consulta mais complexa para obter os produtos mais vendidos
    const { data: topProductsData, error: topProductsError } = await supabase
      .from('sale_items')
      .select(`
        product_id,
        product_name,
        quantity
      `)
      .order('quantity', { ascending: false })
      .limit(5);
    
    if (topProductsError) throw topProductsError;
    
    // Agrupar por produto e somar as quantidades
    const productSales: Record<string, { name: string, sales: number }> = {};
    
    topProductsData.forEach(item => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: item.product_name, sales: 0 };
      }
      productSales[item.product_id].sales += item.quantity;
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      totalSales,
      monthlySales,
      activeCustomers,
      lowStockItems,
      recentSales,
      salesByMonth,
      topProducts,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return {
      totalSales: 0,
      monthlySales: 0,
      activeCustomers: 0,
      lowStockItems: 0,
      recentSales: [],
      salesByMonth: [],
      topProducts: [],
    };
  }
};
