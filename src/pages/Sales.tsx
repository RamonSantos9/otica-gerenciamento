import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSales,
  addSale,
  getSaleById,
  getCustomers,
  saveReport,
} from "@/services";
import { Sale, Customer } from "@/services/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  PlusCircle,
  Eye,
  Download,
  Loader2,
  Filter,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ExportModal } from "@/components/ExportModal";
import { NewSaleModal } from "@/components/sales/NewSaleModal";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EyeModal } from "@/components/EyeModal";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completo":
      return "success";
    case "pendente":
      return "warning";
    case "cancelado":
      return "destructive";
    default:
      return "outline";
  }
};

const Sales = () => {
  // Estados para controlar o modal do Eye
  const [newEyeModalOpen, setNewEyeModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Estados para pesquisa e para os outros modais
  const [searchTerm, setSearchTerm] = useState("");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [newSaleModalOpen, setNewSaleModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para abrir o modal do Eye com os detalhes da venda
  const openEyeModal = (id: string) => {
    setSelectedSaleId(id);
    setNewEyeModalOpen(true);
  };

  // Função para fechar o modal do Eye e limpar a venda selecionada
  const closeEyeModal = () => {
    setNewEyeModalOpen(false);
    setSelectedSaleId(null);
  };

  // Função para abrir o modal de Nova Venda
  const handleNewSale = () => {
    setNewSaleModalOpen(true);
  };

  // Query para buscar a lista de vendas
  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales"],
    queryFn: getSales,
  });

  // Query para buscar os detalhes da venda selecionada
  const { data: selectedSale, isLoading: isLoadingSale } = useQuery({
    queryKey: ["sale", selectedSaleId],
    queryFn: () => (selectedSaleId ? getSaleById(selectedSaleId) : undefined),
    enabled: !!selectedSaleId,
  });

  // Após registrar a venda, atualiza as queries
  const handleSaleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["recent-sales"] });
  };

  // Consulta os clientes (caso seja necessário para filtros ou nova venda)
  useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  // Filtra as vendas conforme a pesquisa
  const filteredSales = React.useMemo(() => {
    if (!sales) return [];
    if (!searchTerm) return sales;
    return sales.filter(
      (sale) =>
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Vendas</CardTitle>
              <CardDescription>Gerencie as vendas da sua ótica</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Botões de ação */}
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                <Button
                  onClick={() => setExportModalOpen(true)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Exportar
                </Button>
                <Button onClick={handleNewSale} size="sm" className="w-full">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Nova Venda
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, número ou método"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de vendas da ótica</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="hidden md:table-cell">Método</TableHead>
                  <TableHead className="text-center md:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Valor
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales && filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium hidden md:table-cell">
                        #{sale.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(sale.date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {sale.paymentMethod}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusVariant(sale.status)}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell className="">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEyeModal(sale.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhuma venda encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Modal de Visualização de Venda com EyeModal */}
          <EyeModal
            open={newEyeModalOpen}
            onOpenChange={setNewEyeModalOpen}
            sale={selectedSale}
          />
        </CardContent>
      </Card>

      {/* Renderização dos modais de Exportar e Nova Venda */}
      <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
      <NewSaleModal
        open={newSaleModalOpen}
        onOpenChange={setNewSaleModalOpen}
        onSuccess={handleSaleSuccess}
      />
    </div>
  );
};

export default Sales;
