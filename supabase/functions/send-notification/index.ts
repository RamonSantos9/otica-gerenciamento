import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, data } = await req.json();

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar tipo de notificação
    let subject = "";
    let message = "";

    switch (type) {
      case "new_sale":
        subject = "Nova venda registrada";
        message = `Uma nova venda no valor de ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(data.total)} foi registrada para o cliente ${
          data.customerName
        }.`;
        break;
      case "low_stock":
        subject = "Estoque baixo";
        message = `O produto ${data.productName} está com estoque baixo. Quantidade atual: ${data.currentStock}, abaixo do limite de ${data.threshold}.`;
        break;
      case "weekly_report":
        subject = "Relatório Semanal";
        message = `O relatório semanal está disponível. Total de vendas: ${
          data.totalSales
        }. Valor total: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(data.totalValue)}.`;
        break;
      default:
        throw new Error("Tipo de notificação inválido");
    }

    // Verificar se o usuário tem notificações habilitadas para este tipo
    const userEmail = email;

    // Buscar o usuário pelo email
    const { data: userData, error: userError } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError) {
      console.error("Erro ao buscar usuário:", userError);
      throw new Error("Usuário não encontrado");
    }

    // Verificar configurações de notificação do usuário
    const notificationType =
      type === "new_sale"
        ? "new_sales"
        : type === "low_stock"
        ? "low_stock"
        : "weekly_reports";

    const { data: settingsData, error: settingsError } = await supabase
      .from("user_settings")
      .select("notifications")
      .eq("user_id", userData.id)
      .single();

    if (settingsError) {
      console.error(
        "Erro ao buscar configurações de notificação:",
        settingsError
      );
      throw new Error("Configurações de notificação não encontradas");
    }

    // Se o usuário não tiver notificações habilitadas para este tipo, não envia
    if (!settingsData.notifications[notificationType]) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notificação ignorada (desabilitada pelo usuário)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Enviar e-mail através do Supabase
    const { error } = await supabase.from("email_queue").insert([
      {
        to: email,
        subject,
        content: message,
        status: "pending",
      },
    ]);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notificação enfileirada com sucesso",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro ao processar notificação:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
