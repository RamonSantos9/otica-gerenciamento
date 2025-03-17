
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { exportPdf } from "@/services/reportService";
import { PeriodTab } from "./export/PeriodTab";
import { FormatTab } from "./export/FormatTab";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportComplete?: () => void;
}

export function ExportModal({ open, onOpenChange, onExportComplete }: ExportModalProps) {
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("period");
  const [dateRange, setDateRange] = useState<{from: Date; to: Date}>({
    from: new Date(),
    to: new Date()
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7days");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  
  // Opções de formatação
  const [documentTitle, setDocumentTitle] = useState("Relatório de Vendas");
  const [paperSize, setPaperSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const [includeFields, setIncludeFields] = useState({
    customerName: true,
    date: true,
    paymentMethod: true,
    status: true,
    total: true,
  });
  const [headerText, setHeaderText] = useState("Relatório de Vendas - Ótica");
  const [footerText, setFooterText] = useState("Gerado em {{date}}");
  
  const { toast } = useToast();

  // Função para gerar o relatório
  const handleExport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Erro",
        description: "Selecione um período válido para exportar.",
        variant: "destructive",
      });
      return;
    }

    setExportLoading(true);
    
    try {
      await exportPdf({
        period: {
          from: dateRange.from,
          to: dateRange.to
        },
        formatting: {
          title: documentTitle,
          paperSize,
          orientation,
          includeFields,
          headerText,
          footerText
        }
      });
      
      toast({
        title: "Exportação concluída",
        description: "O relatório foi gerado e salvo com sucesso.",
      });
      
      onOpenChange(false);
      
      // Chamar o callback de conclusão, se existir
      if (onExportComplete) {
        onExportComplete();
      }
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>
            Configure as opções de exportação para seu relatório PDF
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="period" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="period">Período</TabsTrigger>
            <TabsTrigger value="format">Formatação</TabsTrigger>
          </TabsList>
          
          {/* Tab de Período */}
          <TabsContent value="period" className="space-y-4 mt-4">
            <PeriodTab
              dateRange={dateRange}
              setDateRange={setDateRange}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
            />
          </TabsContent>
          
          {/* Tab de Formatação */}
          <TabsContent value="format" className="space-y-4 mt-4">
            <FormatTab
              documentTitle={documentTitle}
              setDocumentTitle={setDocumentTitle}
              paperSize={paperSize}
              setPaperSize={setPaperSize}
              orientation={orientation}
              setOrientation={setOrientation}
              includeFields={includeFields}
              setIncludeFields={setIncludeFields}
              headerText={headerText}
              setHeaderText={setHeaderText}
              footerText={footerText}
              setFooterText={setFooterText}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleExport}
            disabled={exportLoading || !dateRange.from || !dateRange.to}
          >
            {exportLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
