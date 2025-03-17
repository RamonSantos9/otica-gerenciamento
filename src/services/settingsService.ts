
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StoreSettings {
  id?: string;
  store_name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  language: string;
  date_format: string;
  dark_mode: boolean;
  notifications: {
    new_sales: boolean;
    low_stock: boolean;
    weekly_reports: boolean;
    system_alerts: boolean;
    user_messages: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// Obter configurações da loja
export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao buscar configurações da loja:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar configurações da loja:', error);
    return null;
  }
};

// Salvar configurações da loja
export const saveStoreSettings = async (settings: StoreSettings): Promise<boolean> => {
  try {
    // Verificar se já existe configuração
    const { data: existingSettings } = await supabase
      .from('store_settings')
      .select('id')
      .limit(1);

    let response;
    
    if (existingSettings && existingSettings.length > 0) {
      // Atualizar configuração existente
      response = await supabase
        .from('store_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSettings[0].id);
    } else {
      // Criar nova configuração
      response = await supabase
        .from('store_settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    if (response.error) {
      console.error('Erro ao salvar configurações da loja:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações da loja:', error);
    return false;
  }
};

// Obter configurações do usuário
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrou configurações, criar padrão
        const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId,
          language: 'pt-BR',
          date_format: 'dd/MM/yyyy',
          dark_mode: false,
          notifications: {
            new_sales: true,
            low_stock: true,
            weekly_reports: false,
            system_alerts: true,
            user_messages: true
          }
        };
        
        // Inserir configurações padrão
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            ...defaultSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Erro ao criar configurações do usuário:', insertError);
          return null;
        }
        
        return newData;
      }
      
      console.error('Erro ao buscar configurações do usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar configurações do usuário:', error);
    return null;
  }
};

// Salvar configurações do usuário
export const saveUserSettings = async (settings: UserSettings): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar configurações do usuário:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações do usuário:', error);
    return false;
  }
};
