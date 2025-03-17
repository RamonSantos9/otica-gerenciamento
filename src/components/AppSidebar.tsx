
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
} from "lucide-react";
import UserProfileButton from "./UserProfileButton";

// Navigation items
const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/inventory",
    label: "Estoque",
    icon: Package,
  },
  {
    path: "/customers",
    label: "Clientes",
    icon: Users,
  },
  {
    path: "/sales",
    label: "Vendas",
    icon: ShoppingCart,
  },
  {
    path: "/reports",
    label: "Relatórios",
    icon: BarChart3,
  },
  {
    path: "/settings",
    label: "Configurações",
    icon: Settings,
  },
];

const AppSidebar = () => {
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <a href={item.path}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <div className="p-4 border-t border-border">
            <UserProfileButton user={user} />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
