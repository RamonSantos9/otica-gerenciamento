
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, addSale } from "@/services";
import { Customer } from "@/services/types";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  CalendarIcon,
  CreditCard,
  DollarSign,
  Loader2,
  Search,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const NewSale = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estados para o formulário
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [saleData, setSaleData] = useState({
    customer: "",
    customer_id: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "pix",
    status: "completo" as "completo" | "pendente" | "cancelado",
    total: 0,
  });
  const [rawTotal, setRawTotal] = useState("");

  // Buscar clientes
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers
  });

  // Mutação para adicionar venda
  const addSaleMutation = useMutation({
    mutationFn: addSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast({
        title: "Venda registrada com sucesso",
        variant: "default",
      });
      navigate("/sales");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar venda",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // Filtra os clientes com base na busca
  const filteredCustomers = React.useMemo(() => {
    if (!customers) return [];
    
    if (!customerSearchTerm) return customers;
    
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
  }, [customers, customerSearchTerm]);

  // Função para selecionar cliente
  const selectCustomer = (customer: Customer) => {
    setSaleData((prev) => ({
      ...prev,
      customer: customer.name,
      customer_id: customer.id,
    }));
    setSelectedCustomerId(customer.id);
    setCustomerSearchOpen(false);
  };

  // Função para formatar o valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  // Funções para tratar a formatação do valor
  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawTotal(e.target.value);
  };

  const handleTotalBlur = () => {
    try {
      const cleaned = rawTotal.replace(/\D/g, "");
      const numericValue = parseInt(cleaned) / 100;
      const formatted = formatCurrency(numericValue);
      
      setSaleData((prev) => ({
        ...prev,
        total: numericValue,
      }));
      
      setRawTotal(formatted);
    } catch (error) {
      setRawTotal("");
      setSaleData((prev) => ({
        ...prev,
        total: 0,
      }));
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!saleData.customer || !saleData.customer_id) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para a venda.",
        variant: "destructive",
      });
      return;
    }

    if (saleData.total <= 0) {
      toast({
        title: "Erro",
        description: "O valor da venda deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }
    
    // Submeter venda
    addSaleMutation.mutate({
      customer: saleData.customer,
      customer_id: saleData.customer_id,
      date: saleData.date,
      paymentMethod: saleData.paymentMethod,
      total: saleData.total,
      status: saleData.status,
      items: [] // Itens seriam adicionados em uma implementação mais completa
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => navigate("/sales")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nova Venda</h1>
          <p className="text-muted-foreground">
            Registre uma nova venda para sua ótica
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Venda</CardTitle>
          <CardDescription>
            Preencha os dados para registrar a venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="new-sale-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente</Label>
                  <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={customerSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedCustomerId
                          ? saleData.customer
                          : "Selecione um cliente"}
                        <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar cliente..." 
                          className="h-9"
                          value={customerSearchTerm}
                          onValueChange={setCustomerSearchTerm}
                        />
                        {isLoadingCustomers ? (
                          <div className="p-4 text-center">
                            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">
                              Carregando clientes...
                            </p>
                          </div>
                        ) : (
                          <CommandList>
                            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                            <CommandGroup>
                              {filteredCustomers.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={customer.id}
                                  onSelect={() => selectCustomer(customer)}
                                >
                                  <div className="flex flex-col">
                                    <span>{customer.name}</span>
                                    <span className="text-xs text-muted-foreground">{customer.email}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={saleData.date}
                      onChange={(e) => 
                        setSaleData((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Método de Pagamento</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={saleData.paymentMethod}
                      onValueChange={(value) =>
                        setSaleData((prev) => ({
                          ...prev,
                          paymentMethod: value,
                        }))
                      }
                    >
                      <SelectTrigger id="payment-method" className="pl-9">
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao_de_credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="cartao_de_debito">Cartão de Débito</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={saleData.status}
                    onValueChange={(value: "completo" | "pendente" | "cancelado") =>
                      setSaleData((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completo">Completo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Valor Total</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="total"
                  type="text"
                  value={rawTotal}
                  onChange={handleTotalChange}
                  onBlur={handleTotalBlur}
                  placeholder="R$ 0,00"
                  className="pl-9"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/sales")}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="new-sale-form"
            disabled={addSaleMutation.isPending || !selectedCustomerId || saleData.total <= 0}
          >
            {addSaleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Registrar Venda'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewSale;
