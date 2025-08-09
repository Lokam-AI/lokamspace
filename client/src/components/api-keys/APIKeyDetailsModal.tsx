import { useState } from "react";
import { Edit, Trash2, Copy, Plus } from "lucide-react";
import { ApiKey, ApiKeyUpdate } from "@/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/utils/apiUtils";
import { useClipboard } from "@/hooks/useClipboard";

interface APIKeyDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKey | null;
  onUpdate: (id: string, updates: ApiKeyUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  updating: boolean;
}

export const APIKeyDetailsModal = ({ 
  open, 
  onOpenChange, 
  apiKey, 
  onUpdate, 
  onDelete, 
  updating 
}: APIKeyDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyUpdate>({});
  
  const { copyApiKey } = useClipboard();

  const startEditing = () => {
    if (!apiKey) return;
    
    setEditingKey({
      name: apiKey.name,
      webhook_url: apiKey.webhook_url,
      webhook_secret: apiKey.webhook_secret,
      webhook_timeout: apiKey.webhook_timeout,
      webhook_headers: apiKey.webhook_headers,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingKey({});
  };

  const handleUpdate = async () => {
    if (!apiKey) return;
    
    try {
      await onUpdate(apiKey.id, editingKey);
      setIsEditing(false);
      setEditingKey({});
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDelete = async () => {
    if (!apiKey) return;
    
    try {
      await onDelete(apiKey.id);
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const closeModal = () => {
    onOpenChange(false);
    setIsEditing(false);
    setEditingKey({});
  };

  const updateWebhookHeaders = (key: string, value: string) => {
    const newHeaders = { ...(editingKey.webhook_headers || apiKey?.webhook_headers || {}) };
    newHeaders[key] = value;
    setEditingKey({...editingKey, webhook_headers: newHeaders});
  };

  const removeWebhookHeader = (key: string) => {
    const newHeaders = { ...(editingKey.webhook_headers || apiKey?.webhook_headers || {}) };
    delete newHeaders[key];
    setEditingKey({...editingKey, webhook_headers: newHeaders});
  };

  const addWebhookHeader = () => {
    const newHeaders = { ...(editingKey.webhook_headers || apiKey?.webhook_headers || {}) };
    newHeaders[""] = "";
    setEditingKey({...editingKey, webhook_headers: newHeaders});
  };

  if (!apiKey) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 mt-4">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span>API Configuration Details</span>
            {!isEditing && (
              <div className="flex gap-4 mr-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edit your API configuration settings. Note: The secret key cannot be modified."
              : "View and manage your API configuration details."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 px-2">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="config-name">Configuration Name</Label>
                {isEditing ? (
                  <Input
                    id="config-name"
                    value={editingKey.name || apiKey.name}
                    onChange={(e) => setEditingKey({...editingKey, name: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm">{apiKey.name}</p>
                )}
              </div>
              <div>
                <Label>Secret Key</Label>
                <div className="mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded block w-full">
                    {apiKey.secret_key_preview}
                  </code>
                </div>
              </div>
              <div>
                <Label>Created</Label>
                <p className="mt-1 text-sm">{formatDateTime(apiKey.created_at)}</p>
              </div>
              <div>
                <Label>Created By</Label>
                <p className="mt-1 text-sm">{apiKey.created_by_name}</p>
              </div>
              {apiKey.updated_at && (
                <div>
                  <Label>Last Updated</Label>
                  <p className="mt-1 text-sm">{formatDateTime(apiKey.updated_at)}</p>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                    {apiKey.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Webhook Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Webhook Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                {isEditing ? (
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-server.com/webhook"
                    value={editingKey.webhook_url || apiKey.webhook_url || ""}
                    onChange={(e) => setEditingKey({...editingKey, webhook_url: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {apiKey.webhook_url || "Not configured"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="webhook-secret">Webhook Secret</Label>
                {isEditing ? (
                  <Input
                    id="webhook-secret"
                    type="password"
                    placeholder="Your webhook secret"
                    value={editingKey.webhook_secret || apiKey.webhook_secret || ""}
                    onChange={(e) => setEditingKey({...editingKey, webhook_secret: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {apiKey.webhook_secret ? "••••••••" : "Not configured"}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="webhook-timeout">Timeout (seconds)</Label>
                {isEditing ? (
                  <Input
                    id="webhook-timeout"
                    type="number"
                    placeholder="30"
                    value={editingKey.webhook_timeout || apiKey.webhook_timeout || 30}
                    onChange={(e) => setEditingKey({...editingKey, webhook_timeout: parseInt(e.target.value)})}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-sm">{apiKey.webhook_timeout || 30} seconds</p>
                )}
              </div>
            </div>

            {/* HTTP Headers */}
            <div>
              <Label>HTTP Headers</Label>
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  {Object.entries(editingKey.webhook_headers || apiKey.webhook_headers || {}).map(([key, value], index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Header name"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...(editingKey.webhook_headers || apiKey.webhook_headers || {}) };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          setEditingKey({...editingKey, webhook_headers: newHeaders});
                        }}
                      />
                      <Input
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => updateWebhookHeaders(key, e.target.value)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeWebhookHeader(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addWebhookHeader}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Header
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  {apiKey.webhook_headers && Object.keys(apiKey.webhook_headers).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(apiKey.webhook_headers).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <span className="font-mono font-medium">{key}:</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No custom headers configured</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Usage Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usage Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rate Limit</Label>
                <p className="mt-1 text-sm">{apiKey.rate_limit_per_minute} requests per minute</p>
              </div>
              <div>
                <Label>Usage Count</Label>
                <p className="mt-1 text-sm">{apiKey.usage_count} calls</p>
              </div>
              {apiKey.last_used_at && (
                <div>
                  <Label>Last Used</Label>
                  <p className="mt-1 text-sm">{formatDateTime(apiKey.last_used_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 mt-6">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? "Updating..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={closeModal}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};