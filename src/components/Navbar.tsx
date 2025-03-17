import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  Download,
  PlusCircle,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ExportModal } from "@/components/ExportModal";
import { NewSaleModal } from "@/components/sales/NewSaleModal";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    path: "/inventory",
    label: "Estoque",
    icon: <Package className="w-5 h-5" />,
  },
  {
    path: "/customers",
    label: "Clientes",
    icon: <Users className="w-5 h-5" />,
  },
  {
    path: "/sales",
    label: "Vendas",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    path: "/reports",
    label: "Relatórios",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    path: "/settings",
    label: "Configurações",
    icon: <Settings className="w-5 h-5" />,
  },
];

const Navbar = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();

  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [newSaleModalOpen, setNewSaleModalOpen] = React.useState(false);

  const queryClient = useQueryClient();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNewSale = () => {
    setNewSaleModalOpen(true);
  };

  const handleSaleSuccess = () => {
    // Atualizar as queries relacionadas a vendas
    queryClient.invalidateQueries({ queryKey: ["sales"] });
    queryClient.invalidateQueries({ queryKey: ["recent-sales"] });
  };

  // Mobile navigation using Drawer component
  if (isMobile) {
    return (
      <>
        {/* Botão do menu mobile */}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className="fixed top-4 right-4 z-50 p-2 bg-background shadow-subtle rounded-full"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        )}
        {/* Overlay para menu mobile */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/1 backdrop-blur-sm z-30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className="fixed top-4 right-4 z-50">
          <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <nav
              id="mobile-menu"
              className={cn(
                "fixed inset-y-0 left-0 bg-white border-r border-border flex flex-col z-40 transition-transform duration-300 ease-in-out",
                isMobile
                  ? mobileMenuOpen
                    ? "translate-x-0 w-64"
                    : "-translate-x-full w-64"
                  : "translate-x-0 w-64"
              )}
            >
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-lg font-semibold">
                        Ó
                      </span>
                    </div>
                    <span className="text-xl font-display font-semibold tracking-tight">
                      Ótica
                    </span>
                  </div>
                </div>

                {/* Links de navegação */}
                <div className="flex-1 py-8 px-4 overflow-y-auto">
                  <ul className="space-y-1.5">
                    {navItems.map((item) => (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          onClick={() => isMobile && setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-subtle"
                                : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                            )
                          }
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Perfil do usuário */}
                {user && (
                  <div className="p-4 border-t border-border mt-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-3 p-2 w-full rounded-lg hover:bg-secondary">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground font-medium">
                              {user.name
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-medium truncate text-foreground">
                              {user.name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {user.role}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configurações</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Sair</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </nav>
          </Drawer>
        </div>

        {/* Modais */}
        <ExportModal open={exportModalOpen} onOpenChange={setExportModalOpen} />
        <NewSaleModal
          open={newSaleModalOpen}
          onOpenChange={setNewSaleModalOpen}
          onSuccess={handleSaleSuccess}
        />
      </>
    );
  }

  // Desktop navigation (keeping the original sidebar approach)
  return (
    <>
      {/* Navegação lateral (sidebar) */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col z-40",
          "translate-x-0 w-64"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg font-semibold">
                Ó
              </span>
            </div>
            <span className="text-xl font-display font-semibold tracking-tight">
              Ótica
            </span>
          </div>
        </div>

        {/* Links de navegação */}
        <div className="flex-1 py-8 px-4 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-subtle"
                        : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Perfil do usuário */}
        <div className="p-4 border-t border-border mt-auto">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-2 w-full rounded-lg hover:bg-secondary">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">
                      {user.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.role}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>

      {/* Overlay para menu mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/100 backdrop-blur z-30"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navbar;
