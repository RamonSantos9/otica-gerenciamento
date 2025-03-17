import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, addCustomer } from "@/services";
import { Customer } from "@/services/types";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search,
  UserPlus,
  Filter,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Função para formatar telefone para (00) 00000-0000
const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, "");
  const phoneNumberLength = phoneNumber.length;

  if (phoneNumberLength < 3) return phoneNumber;
  if (phoneNumberLength < 7)
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;

  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(
    2,
    7
  )}-${phoneNumber.slice(7, 11)}`;
};

// Validador de email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [filters, setFilters] = useState({
    hasEmail: false,
    hasPhone: false,
    hasAddress: false,
    hasPurchased: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });

  const addCustomerMutation = useMutation({
    mutationFn: addCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDialogOpen(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      toast({
        title: "Cliente adicionado",
        description: "O cliente foi adicionado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cliente. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar cliente:", error);
    },
  });

  const handleAddCustomer = () => {
    // Validação básica
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validação de formato de e-mail
    if (!isValidEmail(newCustomer.email)) {
      toast({
        title: "Erro",
        description:
          "Por favor, insira um endereço de e-mail válido (ex: nome@gmail.com).",
        variant: "destructive",
      });
      return;
    }

    addCustomerMutation.mutate(newCustomer);
  };

  const [customersWithVisibility, setCustomersWithVisibility] = useState<
    Customer[]
  >([]);

  React.useEffect(() => {
    if (customers) {
      setCustomersWithVisibility(
        customers.map((c) => ({ ...c, isVisible: true }))
      );
    }
  }, [customers]);

  const toggleVisibility = (id: string) => {
    setCustomersWithVisibility((prev) =>
      prev.map((customer) =>
        customer.id === id
          ? { ...customer, isVisible: !customer.isVisible }
          : customer
      )
    );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setNewCustomer({ ...newCustomer, phone: formattedPhone });
  };

  const openFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const applyFilters = () => {
    closeFilterDialog();
  };

  const resetFilters = () => {
    setFilters({
      hasEmail: false,
      hasPhone: false,
      hasAddress: false,
      hasPurchased: false,
    });
    closeFilterDialog();
  };

  const filteredCustomers = React.useMemo(() => {
    if (!customersWithVisibility) return [];

    return customersWithVisibility.filter((customer) => {
      // Filtro de texto
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm));

      if (!matchesSearch) return false;

      // Aplicar filtros
      if (filters.hasEmail && !customer.email) return false;
      if (filters.hasPhone && !customer.phone) return false;
      if (filters.hasAddress && !customer.address) return false;
      if (filters.hasPurchased && !customer.lastPurchase) return false;

      return true;
    });
  }, [customersWithVisibility, searchTerm, filters]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Clientes</CardTitle>
              <CardDescription>
                Gerencie os clientes da sua ótica
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar novo cliente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cliente para cadastrá-lo no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          email: e.target.value,
                        })
                      }
                      className="col-span-3"
                      placeholder="exemplo@gmail.com"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={handlePhoneChange}
                      className="col-span-3"
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddCustomer}
                    disabled={addCustomerMutation.isPending}
                  >
                    {addCustomerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      "Adicionar cliente"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              className="sm:w-auto"
              onClick={openFilterDialog}
            >
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
              <TableCaption>Lista de clientes da ótica</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Telefone
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Última Compra
                  </TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {customer.isVisible ? customer.email : "••••••••••••"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {customer.isVisible ? customer.phone : "••••••••••••"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {customer.lastPurchase
                          ? format(
                              new Date(customer.lastPurchase),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )
                          : "Sem compras"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.totalSpent)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(customer.id)}
                          title={
                            customer.isVisible
                              ? "Ocultar dados sensíveis"
                              : "Mostrar dados sensíveis"
                          }
                        >
                          {customer.isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar clientes</DialogTitle>
            <DialogDescription>
              Selecione os filtros para refinar sua pesquisa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEmail"
                  checked={filters.hasEmail}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, hasEmail: !!checked }))
                  }
                />
                <label
                  htmlFor="hasEmail"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Possui email
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPhone"
                  checked={filters.hasPhone}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, hasPhone: !!checked }))
                  }
                />
                <label
                  htmlFor="hasPhone"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Possui telefone
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAddress"
                  checked={filters.hasAddress}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, hasAddress: !!checked }))
                  }
                />
                <label
                  htmlFor="hasAddress"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Possui endereço
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPurchased"
                  checked={filters.hasPurchased}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, hasPurchased: !!checked }))
                  }
                />
                <label
                  htmlFor="hasPurchased"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Já realizou compras
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={resetFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
