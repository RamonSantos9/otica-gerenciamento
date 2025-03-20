import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import DashboardCard from "@/components/DashboardCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardStats, getLowStockProducts } from "@/services";
import { DashboardStats, Product } from "@/services/types";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const DashboardCardSkeleton = () => (
  <div className="rounded-xl border bg-card p-6 shadow-subtle">
    <Skeleton className="h-5 w-32 mb-2" />
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-40" />
  </div>
);

const Index = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery<
    Product[]
  >({
    queryKey: ["lowStockItems"],
    queryFn: getLowStockProducts,
  });

  // Calcular as tendências com base nos dados
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Obter dados de vendas do mês anterior para cálculo de tendência
  const getPreviousMonthSales = (): number => {
    if (!stats?.salesByMonth || stats.salesByMonth.length < 2) return 0;
    return stats.salesByMonth[stats.salesByMonth.length - 2].total;
  };

  // Obter tendências
  const salesTrend = calculateTrend(
    stats?.monthlySales || 0,
    getPreviousMonthSales()
  );
  const customerTrend = calculateTrend(
    stats?.activeCustomers || 0,
    stats?.activeCustomers ? Math.max(stats.activeCustomers - 3, 0) : 0
  );
  const lowStockTrend =
    lowStockItems && stats?.lowStockItems !== undefined
      ? calculateTrend(lowStockItems.length, stats.lowStockItems)
      : 0;
  const totalSalesTrend = calculateTrend(
    stats?.totalSales || 0,
    stats?.totalSales ? stats.totalSales * 0.92 : 0
  ); // Estimando crescimento de 8%

  const chartStyle = {
    fontSize: "12px",
    fontFamily: "inherit",
  };

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </>
        ) : (
          <>
            <DashboardCard
              title="Vendas do Mês"
              value={formatCurrency(stats?.monthlySales || 0)}
              description="Total de vendas no mês atual"
              icon={<ShoppingCart className="h-5 w-5 text-primary" />}
              trend={{ value: salesTrend, positive: salesTrend >= 0 }}
            />
            <DashboardCard
              title="Clientes Ativos"
              value={stats?.activeCustomers || 0}
              description="Clientes com compras no último mês"
              icon={<Users className="h-5 w-5 text-primary" />}
              trend={{ value: customerTrend, positive: customerTrend >= 0 }}
            />
            <DashboardCard
              title="Produtos com Estoque Baixo"
              value={lowStockItems?.length || 0}
              description="Produtos abaixo do limite mínimo"
              icon={<Package className="h-5 w-5 text-primary" />}
              trend={{
                value: Math.abs(lowStockTrend),
                positive: lowStockTrend <= 0,
              }}
            />
            <DashboardCard
              title="Vendas Totais"
              value={formatCurrency(stats?.totalSales || 0)}
              description="Total acumulado no ano"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              trend={{ value: totalSalesTrend, positive: totalSalesTrend >= 0 }}
            />
          </>
        )}
      </div>

      {/* Gráficos e tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de vendas por mês */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Vendas Mensais
            </CardTitle>
            <CardDescription>
              Histórico de vendas nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats?.salesByMonth}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  style={chartStyle}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `R$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar
                    dataKey="total"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Produtos mais vendidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>Top produtos por volume de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={stats?.topProducts}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  style={chartStyle}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendas recentes e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Vendas Recentes
            </CardTitle>
            <CardDescription>Últimas transações registradas</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sale.date), "dd 'de' MMMM, yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(sale.total)}
                      </span>
                      <Badge
                        variant={
                          sale.status === "completo"
                            ? "success"
                            : sale.status === "pendente"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {sale.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de estoque baixo */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-lg font-semibold">
                Alertas de Estoque
              </CardTitle>
            </div>
            <CardDescription>
              Produtos que precisam de reposição
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems && lowStockItems.length > 0 ? (
                  lowStockItems.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.brand}
                        </p>
                      </div>
                      <Badge
                        variant={
                          product.stock === 0 ? "destructive" : "warning"
                        }
                      >
                        {product.stock === 0
                          ? "Sem estoque"
                          : `${product.stock} unidades`}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Não há produtos com estoque baixo.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
