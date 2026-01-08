import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface EmergencyMessage {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
  expires_at: string | null;
}

export const useEmergencyMessages = () => {
  return useQuery({
    queryKey: ["emergency_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_messages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as EmergencyMessage[];
    },
  });
};

export const useAllEmergencyMessages = () => {
  return useQuery({
    queryKey: ["all_emergency_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmergencyMessage[];
    },
  });
};

export const useCreateEmergencyMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      title,
      message,
      imageUrl,
    }: {
      title: string;
      message: string;
      imageUrl?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("emergency_messages")
        .insert({
          title,
          message,
          image_url: imageUrl || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: "create_emergency_message",
        target_table: "emergency_messages",
        target_id: data.id,
        details: { title, message },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_messages"] });
      queryClient.invalidateQueries({ queryKey: ["all_emergency_messages"] });
    },
  });
};

export const useToggleEmergencyMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("emergency_messages")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("admin_audit_log").insert({
        admin_id: user.id,
        action: isActive ? "activate_emergency_message" : "deactivate_emergency_message",
        target_table: "emergency_messages",
        target_id: id,
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_messages"] });
      queryClient.invalidateQueries({ queryKey: ["all_emergency_messages"] });
    },
  });
};
