import { supabase } from "@/integrations/supabase/client";
import { StoreSettings, UserSettings } from "@/types/supabase-custom";

// Get store settings
export const getStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching store settings:", error);
      return null;
    }

    return data as StoreSettings;
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return null;
  }
};

// Save store settings
export const saveStoreSettings = async (
  settings: StoreSettings
): Promise<boolean> => {
  try {
    // Check if settings already exist
    const { data: existingSettings, error: fetchError } = await supabase
      .from("store_settings")
      .select("id")
      .limit(1);

    if (fetchError) {
      console.error("Error fetching existing store settings:", fetchError);
      return false;
    }

    let response;

    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      response = await supabase
        .from("store_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings[0].id);
    } else {
      // Create new settings
      response = await supabase.from("store_settings").insert({
        ...settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (response.error) {
      console.error("Error saving store settings:", response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving store settings:", error);
    return false;
  }
};

// Get user settings
export const getUserSettings = async (
  userId: string
): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Settings not found, create default
        const defaultSettings: Omit<
          UserSettings,
          "id" | "created_at" | "updated_at"
        > = {
          user_id: userId,
          language: "pt-BR",
          date_format: "dd/MM/yyyy",
          dark_mode: false,
          notifications: {
            new_sales: true,
            low_stock: true,
            weekly_reports: false,
            system_alerts: true,
            user_messages: true,
          },
        };

        // Insert default settings
        const { data: newData, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            ...defaultSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user settings:", insertError);
          return null;
        }

        return newData as UserSettings;
      }

      console.error("Error fetching user settings:", error);
      return null;
    }

    return data as UserSettings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
};

// Save user settings
export const saveUserSettings = async (
  settings: UserSettings
): Promise<boolean> => {
  try {
    const { error } = await supabase.from("user_settings").upsert({
      ...settings,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving user settings:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    return false;
  }
};
