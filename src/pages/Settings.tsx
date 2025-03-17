import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Store,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getStoreSettings,
  saveStoreSettings,
  getUserSettings,
  saveUserSettings,
  StoreSettings,
  UserSettings,
} from "@/services/settingsService";

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    store_name: "",
    cnpj: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    country: "Brasil",
  });
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme, language, setLanguage } = useTheme();

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Carregar configurações da loja
        const storeConfig = await getStoreSettings();
        if (storeConfig) {
          setStoreSettings(storeConfig);
        }

        // Carregar configurações do usuário
        if (user?.id) {
          const userConfig = await getUserSettings(user.id);
          if (userConfig) {
            setUserSettings(userConfig);
          }

          // Carregar dados do perfil
          setProfileData({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "",
            phone: user.phone || "",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Função para salvar configurações do perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // No mundo real, aqui chamaríamos uma API para atualizar os dados do usuário
    // Por enquanto, simularemos o sucesso
    try {
      // Simulando tempo de processamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Perfil atualizado",
        description:
          "Suas informações de perfil foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar configurações da loja
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await saveStoreSettings(storeSettings);

      if (success) {
        toast({
          title: "Configurações da loja atualizadas",
          description: "As informações da loja foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Erro ao salvar configurações da loja");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações da loja.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para alterar o tema
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  // Função para alterar o idioma
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  // Função para salvar configurações de notificação
  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userSettings || !user?.id) return;

    setIsLoading(true);

    try {
      const success = await saveUserSettings(userSettings);

      if (success) {
        toast({
          title: "Configurações de notificação atualizadas",
          description:
            "Suas preferências de notificação foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Erro ao salvar configurações de notificação");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description:
          "Não foi possível atualizar as configurações de notificação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar configurações do sistema
  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userSettings || !user?.id) return;

    setIsLoading(true);

    try {
      const success = await saveUserSettings(userSettings);

      if (success) {
        toast({
          title: "Configurações do sistema atualizadas",
          description:
            "Suas preferências do sistema foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Erro ao salvar configurações do sistema");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações do sistema.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua ótica
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Loja</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab de Perfil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="profile-form"
                onSubmit={handleSaveProfile}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Cargo</Label>
                      <Select
                        value={profileData.role}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({ ...prev, role: value }))
                        }
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="attendant">Atendente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="profile-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab de Loja */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Loja</CardTitle>
              <CardDescription>
                Configure as informações da sua ótica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="store-form"
                onSubmit={handleSaveStore}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Nome da loja</Label>
                      <Input
                        id="storeName"
                        value={storeSettings.store_name}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            store_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={storeSettings.cnpj}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            cnpj: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storeEmail">Email da loja</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="storePhone">Telefone da loja</Label>
                      <Input
                        id="storePhone"
                        value={storeSettings.phone}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={storeSettings.address}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={storeSettings.city}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={storeSettings.state}
                        onValueChange={(value) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            state: value,
                          }))
                        }
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipcode">CEP</Label>
                      <Input
                        id="zipcode"
                        value={storeSettings.zipcode}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            zipcode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        value={storeSettings.country}
                        onChange={(e) =>
                          setStoreSettings((prev) => ({
                            ...prev,
                            country: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="store-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab de Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova senha</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirmar nova senha
                      </Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Autenticação de dois fatores
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação por SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba um código de verificação por SMS ao fazer login
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação por aplicativo</Label>
                        <p className="text-sm text-muted-foreground">
                          Use um aplicativo de autenticação para gerar códigos
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure quais notificações você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="notifications-form"
                onSubmit={handleSaveNotifications}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notificações por email
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Novas vendas</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações quando uma nova venda for
                          realizada
                        </p>
                      </div>
                      <Switch
                        checked={userSettings?.notifications.new_sales}
                        onCheckedChange={(checked) =>
                          setUserSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    new_sales: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Estoque baixo</Label>
                        <p className="text-sm text-muted-foreground">
                          Seja notificado quando produtos estiverem com estoque
                          baixo
                        </p>
                      </div>
                      <Switch
                        checked={userSettings?.notifications.low_stock}
                        onCheckedChange={(checked) =>
                          setUserSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    low_stock: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba relatórios semanais com o desempenho da loja
                        </p>
                      </div>
                      <Switch
                        checked={userSettings?.notifications.weekly_reports}
                        onCheckedChange={(checked) =>
                          setUserSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    weekly_reports: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Notificações no sistema
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de sistema</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre o status do sistema
                        </p>
                      </div>
                      <Switch
                        checked={userSettings?.notifications.system_alerts}
                        onCheckedChange={(checked) =>
                          setUserSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    system_alerts: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Mensagens de usuários</Label>
                        <p className="text-sm text-muted-foreground">
                          Notificações quando receber mensagens de outros
                          usuários
                        </p>
                      </div>
                      <Switch
                        checked={userSettings?.notifications.user_messages}
                        onCheckedChange={(checked) =>
                          setUserSettings((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  notifications: {
                                    ...prev.notifications,
                                    user_messages: checked,
                                  },
                                }
                              : null
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                form="notifications-form"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab de Sistema */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Sistema</CardTitle>
              <CardDescription>
                Configure as preferências do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="system-form"
                onSubmit={handleSaveSystem}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Preferências gerais</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Idioma</Label>
                        <p className="text-sm text-muted-foreground">
                          Selecione o idioma do sistema
                        </p>
                      </div>
                      <Select
                        value={language}
                        onValueChange={handleLanguageChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">
                            Português (Brasil)
                          </SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Formato de data</Label>
                        <p className="text-sm text-muted-foreground">
                          Escolha como as datas serão exibidas
                        </p>
                      </div>
                      <Select
                        value={userSettings?.date_format || "dd/MM/yyyy"}
                        onValueChange={(value) =>
                          setUserSettings((prev) =>
                            prev ? { ...prev, date_format: value } : null
                          )
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Formato de data" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                          <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                          <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Tema escuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Ative o tema escuro do sistema
                        </p>
                      </div>
                      <Switch
                        checked={theme === "dark"}
                        onCheckedChange={handleThemeChange}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backups</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Backup automático</Label>
                          <p className="text-sm text-muted-foreground">
                            Realiza backups automáticos do sistema
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="pt-2">
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue placeholder="Frequência de backup" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diariamente</SelectItem>
                            <SelectItem value="weekly">Semanalmente</SelectItem>
                            <SelectItem value="monthly">Mensalmente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                      >
                        Realizar backup manual
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="system-form" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar alterações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
