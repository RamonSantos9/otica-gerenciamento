import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: "new_sale" | "low_stock" | "weekly_report";
  email: string;
  data: any;
}

// Enviar notificação
export const sendNotification = async (
  notification: NotificationData
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-notification",
      {
        body: notification,
      }
    );

    if (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    return false;
  }
};

// Enviar notificação de nova venda
export const notifyNewSale = async (
  email: string,
  saleData: { customerName: string; total: number }
): Promise<boolean> => {
  return await sendNotification({
    type: "new_sale",
    email,
    data: saleData,
  });
};

// Enviar notificação de estoque baixo
export const notifyLowStock = async (
  email: string,
  productData: { productName: string; currentStock: number; threshold: number }
): Promise<boolean> => {
  return await sendNotification({
    type: "low_stock",
    email,
    data: productData,
  });
};

// Enviar notificação de relatório semanal
export const notifyWeeklyReport = async (
  email: string,
  reportData: { totalSales: number; totalValue: number }
): Promise<boolean> => {
  return await sendNotification({
    type: "weekly_report",
    email,
    data: reportData,
  });
};
