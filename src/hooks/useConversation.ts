import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useConversation() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);

  const createConversation = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;

    // Generate a title from the first message (first 50 chars)
    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + "..." 
      : firstMessage;

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating conversation:", error);
      return null;
    }

    setConversationId(data.id);
    return data.id;
  }, [user]);

  const saveMessage = useCallback(async (
    convId: string,
    role: "user" | "assistant",
    content: string
  ) => {
    if (!user || !convId) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      role,
      content,
    });

    if (error) {
      console.error("Error saving message:", error);
    }

    // Update conversation's updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId);
  }, [user]);

  const loadConversation = useCallback(async (convId: string): Promise<Message[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      console.error("Error loading conversation:", error);
      return [];
    }

    setConversationId(convId);
    return data.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }, [user]);

  const resetConversation = useCallback(() => {
    setConversationId(null);
  }, []);

  return {
    conversationId,
    createConversation,
    saveMessage,
    loadConversation,
    resetConversation,
  };
}
