
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports, Report } from '@/services/reportsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchBar } from '@/components/reports/SearchBar';
import { ReportFilterModal } from '@/components/reports/ReportFilterModal';
import { ReportDetailsModal } from '@/components/reports/ReportDetailsModal';
import { ReportTable } from '@/components/reports/ReportTable';
import { ExportModal } from '@/components/ExportModal';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState({ 
    start: '', 
    end: '' 
  });
  const [filters, setFilters] = useState({
    thisMonth: false,
    lastMonth: false,
    thisYear: false
  });
  const { toast } = useToast();

  const { data: reports, isLoading, refetch } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: getReports
  });

  const selectedReport = reports?.find(report => report.id === selectedReportId);

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  const openViewReportModal = (id: string) => {
    setSelectedReportId(id);
    setIsViewReportModalOpen(true);
  };
  
  const closeViewReportModal = () => {
    setIsViewReportModalOpen(false);
    setSelectedReportId(null);
  };

  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  const applyFilters = () => {
    if (filters.thisMonth) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setDateFilter({
        start: startOfMonth.toISOString().split('T')[0],
        end: endOfMonth.toISOString().split('T')[0]
      });
    } else if (filters.lastMonth) {
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      setDateFilter({
        start: startOfLastMonth.toISOString().split('T')[0],
        end: endOfLastMonth.toISOString().split('T')[0]
      });
    } else if (filters.thisYear) {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      
      setDateFilter({
        start: startOfYear.toISOString().split('T')[0],
        end: endOfYear.toISOString().split('T')[0]
      });
    }
    
    closeFilterModal();
  };

  const resetFilters = () => {
    setDateFilter({ start: '', end: '' });
    setFilters({
      thisMonth: false,
      lastMonth: false,
      thisYear: false
    });
    closeFilterModal();
  };

  const filteredReports = useMemo(() => {
    if (!reports) return [];

    return reports.filter(report => {
      // Filtro de texto
      const matchesSearch = 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Filtro de data - a partir de
      if (dateFilter.start) {
        const fromDate = new Date(dateFilter.start);
        const reportDate = new Date(report.createdAt);
        if (reportDate < fromDate) return false;
      }
      
      // Filtro de data - até
      if (dateFilter.end) {
        const toDate = new Date(dateFilter.end);
        toDate.setHours(23, 59, 59, 999); // Final do dia
        const reportDate = new Date(report.createdAt);
        if (reportDate > toDate) return false;
      }
      
      return true;
    });
  }, [reports, searchTerm, dateFilter]);

  const downloadReport = (report: Report) => {
    // Por enquanto, simulamos o download
    // No futuro, podemos implementar o download do arquivo armazenado
    toast({
      title: "Download iniciado",
      description: `Baixando relatório: ${report.title}`,
    });
  };

  const handleExportComplete = () => {
    // Recarregar a lista de relatórios após exportar
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Relatórios</CardTitle>
              <CardDescription>Visualize e baixe os relatórios gerados</CardDescription>
            </div>
            <Button onClick={openExportModal}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Gerar Novo Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={openFilterModal}
          />

          <ReportTable 
            reports={filteredReports}
            isLoading={isLoading}
            onViewReport={openViewReportModal}
            onDownloadReport={downloadReport}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <ReportFilterModal 
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filters={filters}
        setFilters={setFilters}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
      />

      <ReportDetailsModal 
        isOpen={isViewReportModalOpen}
        onOpenChange={setIsViewReportModalOpen}
        report={selectedReport}
        onDownload={downloadReport}
        onClose={closeViewReportModal}
      />

      <ExportModal 
        open={isExportModalOpen} 
        onOpenChange={closeExportModal} 
        onExportComplete={handleExportComplete}
      />
    </div>
  );
};

export default Reports;
