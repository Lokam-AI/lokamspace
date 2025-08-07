import { METHOD_COLORS } from "@/constants/apiEndpoints";

export const maskSecretKey = (key: string): string => {
  if (key.length <= 6) return key;
  return `${key.substring(0, 3)}...${key.substring(key.length - 3)}`;
};

export const getMethodColor = (method: string): string => {
  return METHOD_COLORS[method as keyof typeof METHOD_COLORS] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};