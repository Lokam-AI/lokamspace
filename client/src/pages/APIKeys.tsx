import { useState } from "react";
import { Key, Plus, Trash2, Copy, FileText, Settings, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

// API Reference data
const API_ENDPOINTS = [
  {
    category: "Calls",
    endpoints: [
      {
        method: "GET",
        path: "/call",
        name: "List Calls",
        description: "Retrieve a list of all calls with optional filtering.",
        parameters: [
          {
            name: "createdAtLe",
            type: "string",
            required: false,
            format: "date-time",
            description: "This will return items where the createdAt is less than or equal to the specified value."
          },
          {
            name: "updatedAtGt",
            type: "string", 
            required: false,
            format: "date-time",
            description: "This will return items where the updatedAt is greater than the specified value."
          },
          {
            name: "updatedAtLt",
            type: "string",
            required: false,
            format: "date-time", 
            description: "This will return items where the updatedAt is less than the specified value."
          }
        ],
        response: {
          id: "string",
          transferFrom: "1",
          model: "blind-transfer",
          message: "foo",
          timeout: 60,
          sipVerb: "refer",
          holdAudioUrl: "foo",
          transferCompleteAudioUrl: "foo",
          twilML: "foo",
          summaryPlan: {
            messages: [{}],
            enabled: true,
            timeoutSeconds: 42
          },
          sipHeadersInReferToEnabled: true,
          fallbackPlan: {
            message: "Hi, how can I help you today?",
            endCallEnable: false
          }
        }
      },
      {
        method: "POST", 
        path: "/call",
        name: "Create Call",
        description: "Create a new call with specified parameters.",
        parameters: [],
        response: {
          id: "string",
          status: "created"
        }
      },
      {
        method: "GET",
        path: "/call/{id}",
        name: "Get Call", 
        description: "Retrieve details of a specific call by ID.",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "The unique identifier for the call."
          }
        ],
        response: {
          id: "string",
          status: "completed"
        }
      },
      {
        method: "DELETE",
        path: "/call/{id}",
        name: "Delete Call Data",
        description: "Delete call data for a specific call.",
        parameters: [
          {
            name: "id", 
            type: "string",
            required: true,
            description: "The unique identifier for the call."
          }
        ],
        response: {
          success: true
        }
      },
      {
        method: "PATCH",
        path: "/call/{id}",
        name: "Update Call",
        description: "Update call information.",
        parameters: [
          {
            name: "id",
            type: "string", 
            required: true,
            description: "The unique identifier for the call."
          }
        ],
        response: {
          id: "string",
          status: "updated"
        }
      }
    ]
  },
  {
    category: "Chats",
    endpoints: [
      {
        method: "GET",
        path: "/chat",
        name: "List Chats",
        description: "Retrieve a list of all chats.",
        parameters: [],
        response: {
          chats: []
        }
      },
      {
        method: "POST",
        path: "/chat", 
        name: "Create Chat",
        description: "Create a new chat session.",
        parameters: [],
        response: {
          id: "string",
          status: "created"
        }
      },
      {
        method: "GET",
        path: "/chat/{id}",
        name: "Get Chat",
        description: "Get details of a specific chat.",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "The unique identifier for the chat."
          }
        ],
        response: {
          id: "string",
          messages: []
        }
      },
      {
        method: "DELETE",
        path: "/chat/{id}",
        name: "Delete Chat",
        description: "Delete a chat session.",
        parameters: [
          {
            name: "id",
            type: "string", 
            required: true,
            description: "The unique identifier for the chat."
          }
        ],
        response: {
          success: true
        }
      }
    ]
  },
  {
    category: "Campaigns",
    endpoints: [
      {
        method: "GET",
        path: "/campaign",
        name: "List Campaigns", 
        description: "Retrieve a list of all campaigns.",
        parameters: [],
        response: {
          campaigns: []
        }
      },
      {
        method: "POST",
        path: "/campaign",
        name: "Create Campaign",
        description: "Create a new campaign.",
        parameters: [],
        response: {
          id: "string",
          status: "created"
        }
      },
      {
        method: "GET",
        path: "/campaign/{id}",
        name: "Get Campaign",
        description: "Get details of a specific campaign.",
        parameters: [
          {
            name: "id",
            type: "string",
            required: true,
            description: "The unique identifier for the campaign."
          }
        ],
        response: {
          id: "string",
          name: "string"
        }
      }
    ]
  }
];

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState(STATIC_API_KEYS);
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0].endpoints[0]);

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

  const getMethodColor = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800 border-green-200",
      POST: "bg-blue-100 text-blue-800 border-blue-200", 
      PATCH: "bg-yellow-100 text-yellow-800 border-yellow-200",
      DELETE: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Code sample has been copied to your clipboard."
    });
  };

  const renderAPIKeysTab = () => (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
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
  );

  const renderAPIReferenceTab = () => (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left Sidebar - Endpoints */}
      <div className="w-80 border-r bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Endpoints</h3>
          {API_ENDPOINTS.map((category) => (
            <div key={category.category} className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.endpoints.map((endpoint) => (
                  <button
                    key={`${endpoint.method}-${endpoint.path}`}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedEndpoint === endpoint
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </Badge>
                      <span className="truncate">{endpoint.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section - Documentation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`${getMethodColor(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {selectedEndpoint.path}
              </code>
            </div>
            <h2 className="text-2xl font-bold">{selectedEndpoint.name}</h2>
            <p className="text-muted-foreground mt-2">{selectedEndpoint.description}</p>
          </div>

          {selectedEndpoint.parameters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Query Parameters</h3>
              <div className="space-y-4">
                {selectedEndpoint.parameters.map((param) => (
                  <div key={param.name} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {param.name}
                      </code>
                      <Badge variant={param.required ? "default" : "secondary"}>
                        {param.required ? "Required" : "Optional"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{param.type}</span>
                      {param.format && (
                        <span className="text-xs text-muted-foreground">
                          format: {param.format}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Response</h3>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">200 Retrieved</span>
              </div>
              <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
                <code>{JSON.stringify(selectedEndpoint.response, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Request/Response Samples */}
      <div className="w-96 border-l bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4">Try It</h3>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{selectedEndpoint.method}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyCodeToClipboard(`curl https://api.vapi.ai${selectedEndpoint.path} \\
  -H "Authorization: Bearer <token>"`)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-black text-green-400 p-4 rounded-md text-sm font-mono">
              <div>$ curl https://api.vapi.ai{selectedEndpoint.path} \</div>
              <div>&gt;    -H "Authorization: Bearer &lt;token&gt;"</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">200 Retrieved</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyCodeToClipboard(JSON.stringify(selectedEndpoint.response, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-black text-gray-300 p-4 rounded-md text-sm font-mono max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(selectedEndpoint.response, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Configure your API settings and preferences
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Configuration Coming Soon</h3>
            <p className="text-muted-foreground">
              This section will contain API configuration options.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              <div className="flex flex-col gap-8 p-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">API Platform</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your API integration and access
                  </p>
                </div>

                <Tabs defaultValue="api-keys" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="api-keys" className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Keys
                    </TabsTrigger>
                    <TabsTrigger value="api-reference" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      API Reference
                    </TabsTrigger>
                    <TabsTrigger value="configuration" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configuration
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="api-keys" className="mt-6">
                    {renderAPIKeysTab()}
                  </TabsContent>
                  
                  <TabsContent value="api-reference" className="mt-6">
                    {renderAPIReferenceTab()}
                  </TabsContent>
                  
                  <TabsContent value="configuration" className="mt-6">
                    {renderConfigurationTab()}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 