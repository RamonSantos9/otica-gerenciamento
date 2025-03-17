
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getUserSettings, saveUserSettings } from "@/services/settingsService";

type ThemeContextType = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  language: string;
  setLanguage: (language: string) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  language: "pt-BR",
  setLanguage: () => {}
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [language, setLanguageState] = useState<string>("pt-BR");
  const { user } = useAuth();

  // Carregar as configurações do usuário quando ele fizer login
  useEffect(() => {
    const loadUserSettings = async () => {
      if (user?.id) {
        const settings = await getUserSettings(user.id);
        if (settings) {
          setThemeState(settings.dark_mode ? "dark" : "light");
          setLanguageState(settings.language);
          
          // Aplicar tema ao documento
          if (settings.dark_mode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    };

    loadUserSettings();
  }, [user?.id]);

  // Função para alterar o tema
  const setTheme = async (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    
    // Aplicar tema ao documento
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Salvar no banco de dados se o usuário estiver logado
    if (user?.id) {
      const settings = await getUserSettings(user.id);
      if (settings) {
        await saveUserSettings({
          ...settings,
          dark_mode: newTheme === "dark"
        });
      }
    }
  };

  // Função para alterar o idioma
  const setLanguage = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    
    // Salvar no banco de dados se o usuário estiver logado
    if (user?.id) {
      const settings = await getUserSettings(user.id);
      if (settings) {
        await saveUserSettings({
          ...settings,
          language: newLanguage
        });
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};
