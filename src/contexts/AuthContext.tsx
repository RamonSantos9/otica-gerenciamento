import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // Added this property to match what's being used in App.tsx
  login: (email: string, password: string) => Promise<boolean>; // Changed return type to boolean
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoading: true, // Added this property
  login: async () => false, // Return false as default
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Simular a busca de dados do usuário
          setUser({
            id: "1",
            name: "Ramon Santos",
            email: "ramon@otica.com",
            role: "Administrador",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Simular a busca de dados do usuário
        setUser({
          id: "1",
          name: "Ramon Santos",
          email: "ramon@otica.com",
          role: "Administrador",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simular login bem-sucedido
      setUser({
        id: "1",
        name: "Ramon Santos",
        email: "ramon@otica.com",
        role: "Administrador",
      });

      navigate("/");

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo à plataforma da Ótica",
      });

      return true; // Return true on success
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      return false; // Return false on error
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate("/login");

      toast({
        title: "Logout realizado",
        description: "Você saiu da plataforma com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isLoading: loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
