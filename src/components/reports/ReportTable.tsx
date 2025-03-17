
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Download, FileText } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Report } from '@/services/reportsService';

interface ReportTableProps {
  reports: Report[];
  isLoading: boolean;
  onViewReport: (id: string) => void;
  onDownloadReport: (report: Report) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  isLoading,
  onViewReport,
  onDownloadReport
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>
        Lista de relatórios gerados
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Título</TableHead>
          <TableHead>Gerado por</TableHead>
          <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
          <TableHead className="hidden lg:table-cell">Período</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.length > 0 ? (
          reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.title}</TableCell>
              <TableCell>{report.createdBy}</TableCell>
              <TableCell className="hidden md:table-cell">
                {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {format(new Date(report.startDate), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(report.endDate), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewReport(report.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onDownloadReport(report)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
              Nenhum relatório encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
