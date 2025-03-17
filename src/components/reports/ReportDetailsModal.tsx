
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Download, FileCheck, User } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Report } from '@/services/reportsService';

interface ReportDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | undefined;
  onDownload: (report: Report) => void;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onOpenChange,
  report,
  onDownload,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Relatório</DialogTitle>
        </DialogHeader>
        {report ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-center">{report.title}</h3>
              <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Período: {format(new Date(report.startDate), "dd/MM/yyyy", { locale: ptBR })} a {format(new Date(report.endDate), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold">{report.totalSales}</span>
                    <span className="text-sm text-muted-foreground">Vendas no período</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold">{formatCurrency(report.totalValue)}</span>
                    <span className="text-sm text-muted-foreground">Valor total</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Gerado por: <strong>{report.createdBy}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Em: {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Badge variant="outline" className="flex items-center gap-1">
                  <FileCheck className="h-3 w-3" />
                  PDF Gerado
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Nenhum relatório selecionado.
          </div>
        )}
        <DialogFooter>
          {report && (
            <Button variant="outline" onClick={() => onDownload(report)}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          )}
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
