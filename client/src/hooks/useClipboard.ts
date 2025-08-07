import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/utils/apiUtils";

export const useClipboard = () => {
  const copy = useCallback(async (text: string, successMessage = "Copied to clipboard") => {
    const success = await copyToClipboard(text);
    
    if (success) {
      toast({
        title: "Success",
        description: successMessage,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
    
    return success;
  }, []);

  const copyApiKey = useCallback((key: string) => {
    return copy(key, "API key has been copied to your clipboard.");
  }, [copy]);

  const copyCode = useCallback((code: string) => {
    return copy(code, "Code sample has been copied to your clipboard.");
  }, [copy]);

  return {
    copy,
    copyApiKey,
    copyCode
  };
};