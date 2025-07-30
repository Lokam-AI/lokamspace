import { useState } from "react";
import { Key, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

// Static data for demonstration
const STATIC_API_KEYS = [
  {
    id: "1",
    name: "Development Key",
    secret_key: "sk-8kIA...8kIA",
    created: "Jul 28, 2025",
    created_by: "Admin"
  },
  {
    id: "2",
    name: "Production Key",
    secret_key: "sk-1N4A...1N4A",
    created: "Jul 28, 2025",
    created_by: "Admin"
  },
  {
    id: "3",
    name: "Testing Key",
    secret_key: "sk-Co4A...Co4A",
    created: "Jul 28, 2025",
    created_by: "Admin"
  }
];

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState(STATIC_API_KEYS);
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);

  const handleCreateKey = () => {
    // Generate a random key (in a real app this would come from the backend)
    const randomKey = `sk-${Math.random().toString(36).substring(2, 6)}${Math.random().toString(36).substring(2, 6)}`;
    
    const newKey = {
      id: `${apiKeys.length + 1}`,
      name: newKeyName,
      secret_key: randomKey,
      created: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      created_by: "Admin"
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyValue(randomKey);
    setShowNewKey(true);
    setNewKeyName("");
  };

  // Function to mask the secret key for display
  const maskSecretKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "API Key deleted",
      description: "The API key has been permanently deleted."
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard."
    });
  };

  const closeDialog = () => {
    setNewKeyOpen(false);
    setShowNewKey(false);
    setNewKeyName("");
    setNewKeyValue("");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              <div className="flex flex-col gap-8 p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Platform</h1>
                    <p className="text-muted-foreground mt-2">
                      Manage API keys to securely access the Lokam API
                    </p>
                  </div>
                  <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create new secret key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create new API key</DialogTitle>
                        <DialogDescription>
                          {!showNewKey 
                            ? "Create a new API key to access Lokam services programmatically." 
                            : "Keep your API key secure. You won't be able to see it again."}
                        </DialogDescription>
                      </DialogHeader>
                      
                      {!showNewKey ? (
                        <>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="name" className="text-right">
                                Name
                              </label>
                              <Input
                                id="name"
                                placeholder="My API Key"
                                className="col-span-3"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={closeDialog}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateKey} disabled={!newKeyName}>
                              Create key
                            </Button>
                          </DialogFooter>
                        </>
                      ) : (
                        <>
                          <Alert>
                            <Key className="h-4 w-4" />
                            <AlertDescription>
                              This is the only time your API key will be displayed.
                            </AlertDescription>
                          </Alert>
                          <div className="mt-4 flex items-center space-x-2">
                            <Input
                              readOnly
                              value={newKeyValue}
                              className="font-mono"
                            />
                            <Button 
                              variant="secondary" 
                              onClick={() => copyToClipboard(newKeyValue)}
                            >
                              Copy
                            </Button>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button onClick={closeDialog}>
                              Done
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Your API Keys</CardTitle>
                    <CardDescription>
                      API keys provide access to Lokam API. Keep them secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Secret Key</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Created by</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((key) => (
                          <TableRow key={key.id}>
                            <TableCell>{key.name}</TableCell>
                            <TableCell className="font-mono">{maskSecretKey(key.secret_key)}</TableCell>
                            <TableCell>{key.created}</TableCell>
                            <TableCell>{key.created_by}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {apiKeys.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                              No API keys found. Create your first key to get started.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 