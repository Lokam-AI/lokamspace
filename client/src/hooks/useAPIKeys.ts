import { useState, useEffect, useCallback } from "react";
import { listApiKeys, createApiKey, deleteApiKey, updateApiKey, ApiKey, ApiKeyCreate, ApiKeyUpdate } from "@/api";
import { toast } from "@/components/ui/use-toast";

export const useAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const keys = await listApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewApiKey = useCallback(async (keyData: ApiKeyCreate) => {
    try {
      setCreating(true);
      const result = await createApiKey(keyData);
      
      // Reload API keys
      await loadApiKeys();
      
      toast({
        title: "API Key created",
        description: "Your new API key has been created successfully.",
      });
      
      return result;
    } catch (error) {
      console.error("Failed to create API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      throw error;
    } finally {
      setCreating(false);
    }
  }, [loadApiKeys]);

  const deleteApiKey = useCallback(async (id: string) => {
    try {
      await deleteApiKey(id);
      
      // Remove from local state
      setApiKeys(apiKeys => apiKeys.filter(key => key.id !== id));
      
      toast({
        title: "API Key deleted",
        description: "The API key has been permanently deleted."
      });
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const updateApiKey = useCallback(async (id: string, updates: ApiKeyUpdate) => {
    try {
      setUpdating(true);
      await updateApiKey(id, updates);
      
      // Reload API keys to get updated data
      await loadApiKeys();
      
      toast({
        title: "API Key updated",
        description: "The API key has been updated successfully."
      });
    } catch (error) {
      console.error("Failed to update API key:", error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [loadApiKeys]);

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys();
  }, [loadApiKeys]);

  return {
    apiKeys,
    loading,
    creating,
    updating,
    loadApiKeys,
    createApiKey: createNewApiKey,
    deleteApiKey,
    updateApiKey
  };
};