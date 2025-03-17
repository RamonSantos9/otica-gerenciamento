import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, addProduct, updateProduct } from "@/services";
import { Product } from "@/services/types";
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
  PackagePlus,
  Filter,
  Edit,
  Loader2,
  Check,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getStockStatusVariant = (stock: number, threshold: number) => {
  if (stock === 0) return "destructive";
  if (stock <= threshold) return "warning";
  return "success";
};

const getStockStatusText = (stock: number, threshold: number) => {
  if (stock === 0) return "Sem estoque";
  if (stock <= threshold) return "Estoque baixo";
  return "Em estoque";
};

const productCategories = [
  { value: "armacoes", label: "Armações" },
  { value: "lentes", label: "Lentes" },
  { value: "oculos_de_sol", label: "Óculos de Sol" },
  { value: "acessorios", label: "Acessórios" },
  { value: "estojos", label: "Estojos" },
  { value: "produtos_limpeza", label: "Produtos de Limpeza" },
  { value: "outros", label: "Outros" },
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    brand: "",
    price: 0,
    stock: 0,
    threshold: 5,
    lastRestock: new Date().toISOString(),
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    minPrice: "",
    maxPrice: "",
    dateFrom: "",
    dateTo: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      setNewProduct({
        name: "",
        category: "",
        brand: "",
        price: 0,
        stock: 0,
        threshold: 5,
        lastRestock: new Date().toISOString(),
      });
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao adicionar produto:", error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao atualizar produto:", error);
    },
  });

  const handleAddProduct = () => {
    // Validação básica
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      toast({
        title: "Erro",
        description: "Nome, categoria e preço válido são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (newProduct.stock < 0) {
      toast({
        title: "Erro",
        description: "Estoque não pode ser negativo.",
        variant: "destructive",
      });
      return;
    }

    addProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    // Validação básica
    if (
      !editingProduct.name ||
      !editingProduct.category ||
      editingProduct.price <= 0
    ) {
      toast({
        title: "Erro",
        description: "Nome, categoria e preço válido são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateProductMutation.mutate(editingProduct);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
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
      categories: [],
      minPrice: "",
      maxPrice: "",
      dateFrom: "",
      dateTo: "",
    });
    closeFilterDialog();
  };

  const filteredProducts = React.useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      // Filtro de texto
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Filtro de categorias
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.category)
      ) {
        return false;
      }

      // Filtro de preço mínimo
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
        return false;
      }

      // Filtro de preço máximo
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
        return false;
      }

      // Filtro de data - a partir de
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        const productDate = new Date(product.lastRestock);
        if (productDate < fromDate) return false;
      }

      // Filtro de data - até
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        const productDate = new Date(product.lastRestock);
        if (productDate > toDate) return false;
      }

      return true;
    });
  }, [products, searchTerm, filters]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Estoque</CardTitle>
              <CardDescription>
                Gerencie o inventário da sua ótica
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Adicionar novo produto</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do produto para cadastrá-lo no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Categoria
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) =>
                          setNewProduct({ ...newProduct, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brand" className="text-right">
                      Marca
                    </Label>
                    <Input
                      id="brand"
                      value={newProduct.brand}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, brand: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Preço
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock" className="text-right">
                      Estoque
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="threshold" className="text-right">
                      Mín. Estoque
                    </Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      value={newProduct.threshold}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          threshold: Number(e.target.value),
                        })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleAddProduct}
                    disabled={addProductMutation.isPending}
                  >
                    {addProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adicionando...
                      </>
                    ) : (
                      "Adicionar produto"
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
                placeholder="Buscar por nome, categoria ou marca"
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
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de produtos em estoque</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produto</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Categoria
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Marca</TableHead>
                  <TableHead className="text-right hidden md:table-cell">
                    Preço
                  </TableHead>
                  <TableHead className="text-center">Estoque</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Última Reposição
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {productCategories.find(
                          (cat) => cat.value === product.category
                        )?.label || product.category}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.brand}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={getStockStatusVariant(
                            product.stock,
                            product.threshold
                          )}
                        >
                          {product.stock}{" "}
                          {getStockStatusText(product.stock, product.threshold)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(product.lastRestock), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
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
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar produto</DialogTitle>
            <DialogDescription>
              Atualize os dados do produto selecionado.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Categoria
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand" className="text-right">
                  Marca
                </Label>
                <Input
                  id="edit-brand"
                  value={editingProduct.brand}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      brand: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Preço
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Estoque
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  disabled
                  value={editingProduct.stock}
                  className="col-span-3 bg-gray-100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-threshold" className="text-right">
                  Mín. Estoque
                </Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  min="1"
                  disabled
                  value={editingProduct.threshold}
                  className="col-span-3 bg-gray-100"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-lastRestock" className="text-right">
                  Última Reposição
                </Label>
                <Input
                  id="edit-lastRestock"
                  type="date"
                  disabled
                  value={
                    new Date(editingProduct.lastRestock)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="col-span-3 bg-gray-100"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              onClick={handleUpdateProduct}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtrar produtos</DialogTitle>
            <DialogDescription>
              Selecione os filtros para refinar sua pesquisa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Categorias</Label>
              <div className="grid grid-cols-2 gap-2">
                {productCategories.map((category) => (
                  <div
                    key={category.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={filters.categories.includes(category.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters((prev) => ({
                            ...prev,
                            categories: [...prev.categories, category.value],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            categories: prev.categories.filter(
                              (c) => c !== category.value
                            ),
                          }));
                        }
                      }}
                    />
                    <label
                      htmlFor={`category-${category.value}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Preço Mínimo</Label>
                <Input
                  id="minPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="R$ 0,00"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Preço Máximo</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="R$ 999,99"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Data a partir de</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">Data até</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters({ ...filters, dateTo: e.target.value })
                  }
                />
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

export default Inventory;
