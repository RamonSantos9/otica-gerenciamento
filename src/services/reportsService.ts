
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface Report {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdBy: string;
  totalSales: number;
  totalValue: number;
  filePath?: string;
}

export const getReports = async (): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar relatórios:', error);
      throw error;
    }
    
    return data.map(report => ({
      id: report.id,
      title: report.title,
      startDate: report.start_date,
      endDate: report.end_date,
      createdAt: report.created_at,
      createdBy: report.created_by,
      totalSales: report.total_sales,
      totalValue: report.total_value,
      filePath: report.file_path
    }));
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    return [];
  }
};

export const saveReport = async (reportData: {
  startDate: string;
  endDate: string;
  title: string;
  totalSales: number;
  totalValue: number;
  filePath?: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reports')
      .insert({
        title: reportData.title,
        created_by: 'Ramon Santos', // No futuro, usar o usuário atual
        start_date: reportData.startDate,
        end_date: reportData.endDate,
        total_sales: reportData.totalSales,
        total_value: reportData.totalValue,
        file_path: reportData.filePath
      });
    
    if (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    return false;
  }
};
