import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { saveReport } from "./reportsService";

interface ExportPeriod {
  from: Date;
  to: Date;
}

interface FormatOptions {
  title: string;
  paperSize: string;
  orientation: string;
  includeFields: {
    customerName: boolean;
    date: boolean;
    paymentMethod: boolean;
    status: boolean;
    total: boolean;
  };
  headerText: string;
  footerText: string;
}

interface ExportOptions {
  period: ExportPeriod;
  formatting: FormatOptions;
}

export const exportPdf = async (options: ExportOptions) => {
  try {
    // Buscar vendas do período com informações do cliente
    const { from, to } = options.period;

    const { data: sales, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        customers:customer_id (name)
      `
      )
      .gte("date", format(from, "yyyy-MM-dd"))
      .lte("date", format(to, "yyyy-MM-dd"))
      .order("date", { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar vendas: ${error.message}`);
    }

    // Configuração do documento
    const orientation =
      options.formatting.orientation === "landscape" ? "landscape" : "portrait";
    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: (options.formatting.paperSize as any) || "a4",
    });

    // Cabeçalho personalizado
    const headerText = options.formatting.headerText.replace(
      "{{date}}",
      format(new Date(), "dd/MM/yyyy")
    );
    doc.setFontSize(12);
    doc.text(headerText, 14, 10);

    // Título
    doc.setFontSize(16);
    doc.text(options.formatting.title, 14, 20);

    // Período do relatório
    const periodText = `Período: ${format(from, "dd/MM/yyyy", {
      locale: ptBR,
    })} a ${format(to, "dd/MM/yyyy", { locale: ptBR })}`;
    doc.setFontSize(10);
    doc.text(periodText, 14, 26);

    // Totalizadores
    const totalSales = sales?.length || 0;
    const totalValue =
      sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;

    doc.setFontSize(10);
    doc.text(`Total de vendas: ${totalSales}`, 14, 32);
    doc.text(
      `Valor total: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalValue)}`,
      14,
      37
    );

    // Determinar quais colunas incluir
    const headers: string[] = [];
    const columns: string[] = [];

    if (options.formatting.includeFields.customerName) {
      headers.push("Cliente");
      columns.push("customer");
    }

    if (options.formatting.includeFields.date) {
      headers.push("Data");
      columns.push("date");
    }

    if (options.formatting.includeFields.paymentMethod) {
      headers.push("Método de Pagamento");
      columns.push("paymentMethod");
    }

    if (options.formatting.includeFields.status) {
      headers.push("Status");
      columns.push("status");
    }

    if (options.formatting.includeFields.total) {
      headers.push("Valor");
      columns.push("total");
    }

    // Traduzir métodos de pagamento
    const translatePaymentMethod = (method: string) => {
      const methods: Record<string, string> = {
        pix: "PIX",
        cartao_de_credito: "Cartão de Crédito",
        cartao_de_debito: "Cartão de Débito",
        dinheiro: "Dinheiro",
        boleto: "Boleto",
      };
      return methods[method] || method;
    };

    // Traduzir status
    const translateStatus = (status: string) => {
      const statuses: Record<string, string> = {
        completo: "Completo",
        pendente: "Pendente",
        cancelado: "Cancelado",
      };
      return statuses[status] || status;
    };

    // Preparar dados para tabela
    const tableData = sales?.map((sale) => {
      const row: string[] = [];

      columns.forEach((column) => {
        if (column === "date") {
          row.push(
            format(new Date(sale[column]), "dd/MM/yyyy", { locale: ptBR })
          );
        } else if (column === "total") {
          row.push(
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(sale[column] || 0)
          );
        } else if (column === "customer") {
          row.push(sale.customers?.name || "Cliente não informado");
        } else if (column === "paymentMethod") {
          row.push(translatePaymentMethod(sale.payment_method || ""));
        } else if (column === "status") {
          row.push(translateStatus(sale[column] || ""));
        } else {
          row.push(sale[column] || "");
        }
      });

      return row;
    });

    // Gerar tabela
    autoTable(doc, {
      head: [headers],
      body: tableData || [],
      startY: 45,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Rodapé personalizado
    const footerText = options.formatting.footerText.replace(
      "{{date}}",
      format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })
    );
    const pageCount = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Rodapé com data/hora de geração
      doc.setFontSize(8);
      const text = `${footerText} - Página ${i} de ${pageCount}`;
      const textWidth = doc.getTextWidth(text);
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.text(
        text,
        pageWidth - textWidth - 14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Nome do arquivo para download
    const fileName = `relatorio_vendas_${format(
      new Date(),
      "yyyy-MM-dd_HH-mm"
    )}.pdf`;

    // Salvar documento
    doc.save(fileName);

    // Registrar o relatório no banco de dados
    await saveReport({
      startDate: from.toISOString(),
      endDate: to.toISOString(),
      title: options.formatting.title,
      totalSales,
      totalValue,
      filePath: fileName, // No futuro, podemos implementar upload do arquivo para storage
    });

    return true;
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    throw error;
  }
};
