import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Sale, SaleItem } from "@/services";

interface EyeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale?: Sale;
}

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

export function EyeModal({ open, onOpenChange, sale }: EyeModalProps) {
  const closeModal = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
        </DialogHeader>
        {sale ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID</p>
                <p>#{sale.id.substring(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data
                </p>
                <p>
                  {format(new Date(sale.date), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Cliente
                </p>
                <p>{sale.customer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Status
                </p>
                <Badge variant={getStatusVariant(sale.status)}>
                  {sale.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Método de Pagamento
                </p>
                <p>{sale.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </p>
                <p className="font-bold">{formatCurrency(sale.total)}</p>
              </div>
            </div>

            {sale.items && sale.items.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium mb-2">Itens</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.map((item: SaleItem) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            {/** Exibe Skeletons enquanto os dados são carregados */}
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        )}
        <DialogFooter>
          <Button onClick={closeModal}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EyeModal;
