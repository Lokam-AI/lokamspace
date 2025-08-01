import { useState } from "react";
import { Key, Plus, Trash2 } from "lucide-react";
import { ApiKeyCreate, ApiKeySecret } from "@/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HttpHeader } from "@/types/apiConfig";
import { useClipboard } from "@/hooks/useClipboard";

interface CreateAPIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateKey: (keyData: ApiKeyCreate) => Promise<ApiKeySecret>;
  creating: boolean;
}

export const CreateAPIKeyDialog = ({ open, onOpenChange, onCreateKey, creating }: CreateAPIKeyDialogProps) => {
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [secretToken, setSecretToken] = useState("");
  const [timeout, setTimeout] = useState("30");
  const [httpHeaders, setHttpHeaders] = useState<HttpHeader[]>([]);
  
  const { copyApiKey } = useClipboard();

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    try {
      const keyData: ApiKeyCreate = {
        name: newKeyName,
        rate_limit_per_minute: 10,
        webhook_url: serverUrl || undefined,
        webhook_secret: secretToken || undefined,
        webhook_timeout: parseInt(timeout) || 30,
        webhook_headers: httpHeaders.reduce((acc, header) => {
          acc[header.key] = header.value;
          return acc;
        }, {} as Record<string, string>),
      };
      
      const result = await onCreateKey(keyData);
      setNewKeyValue(result.secret_key);
      setShowNewKey(true);
      setNewKeyName("");
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const closeDialog = () => {
    onOpenChange(false);
    setShowNewKey(false);
    setNewKeyName("");
    setNewKeyValue("");
    setServerUrl("");
    setSecretToken("");
    setTimeout("30");
    setHttpHeaders([]);
  };

  const addHttpHeader = () => {
    setHttpHeaders([...httpHeaders, { key: "", value: "" }]);
  };

  const removeHttpHeader = (index: number) => {
    setHttpHeaders(httpHeaders.filter((_, i) => i !== index));
  };

  const updateHttpHeader = (index: number, field: 'key' | 'value', value: string) => {
    setHttpHeaders(httpHeaders.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle>Create new Configuration</DialogTitle>
          <DialogDescription>
            {!showNewKey 
              ? "Create a new API configuration with webhook settings to access Lokam services programmatically." 
              : "Keep your API key secure. You won't be able to see it again."}
          </DialogDescription>
        </DialogHeader>
        
        {!showNewKey ? (
          <>
            <div className="space-y-6 px-2">
              {/* API Key Name */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    placeholder="Production API Configuration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Webhook Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Webhook Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhook-secret"
                      placeholder="Your webhook secret"
                      value={secretToken}
                      onChange={(e) => setSecretToken(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                    <Input
                      id="webhook-timeout"
                      type="number"
                      placeholder="30"
                      value={timeout}
                      onChange={(e) => setTimeout(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* HTTP Headers */}
                <div className="space-y-2">
                  <Label>HTTP Headers (Optional)</Label>
                  <div className="mt-2 space-y-2">
                    {httpHeaders.map((header, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Header name"
                          value={header.key}
                          onChange={(e) => updateHttpHeader(index, 'key', e.target.value)}
                        />
                        <Input
                          placeholder="Header value"
                          value={header.value}
                          onChange={(e) => updateHttpHeader(index, 'value', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeHttpHeader(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addHttpHeader}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Header
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4 mt-6">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={!newKeyName || creating}>
                {creating ? "Creating..." : "Create Configuration"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 px-2">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  This is the only time your API key will be displayed.
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={newKeyValue}
                  className="font-mono"
                />
                <Button 
                  variant="secondary" 
                  onClick={() => copyApiKey(newKeyValue)}
                >
                  Copy
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-4 mt-6">
              <Button onClick={closeDialog}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};