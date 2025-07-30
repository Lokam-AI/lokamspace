import { useState } from "react";
import { Key, Plus, Trash2, Copy, FileText, Settings, Code2, Eye, EyeOff, Upload, FileText as FileTextIcon, MapPin, Building, User, Phone, Car, MessageSquare, Save, ChevronDown, ChevronRight } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
        method: "POST",
        path: "/call",
        name: "Create Call",
        description: "Create a new call with specified parameters.",
        parameters: [
          {
            name: "phone_number",
            type: "string",
            required: true,
            description: "The phone number to call."
          },
          {
            name: "message",
            type: "string",
            required: false,
            description: "The message to play during the call."
          },
          {
            name: "timeout",
            type: "integer",
            required: false,
            description: "Call timeout in seconds (default: 60)."
          }
        ],
        response: {
          id: "string",
          status: "created",
          phone_number: "string",
          created_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        method: "GET",
        path: "/call",
        name: "List Calls",
        description: "Retrieve a list of all calls with optional filtering.",
        parameters: [
          {
            name: "limit",
            type: "integer",
            required: false,
            description: "Number of calls to return (default: 20, max: 100)."
          },
          {
            name: "offset",
            type: "integer",
            required: false,
            description: "Number of calls to skip for pagination."
          },
          {
            name: "status",
            type: "string",
            required: false,
            description: "Filter calls by status (completed, failed, in-progress)."
          },
          {
            name: "created_at_after",
            type: "string",
            required: false,
            format: "date-time",
            description: "Filter calls created after this timestamp."
          }
        ],
        response: {
          calls: [
            {
              id: "string",
              phone_number: "string",
              status: "completed",
              duration: 120,
              created_at: "2024-01-01T00:00:00Z"
            }
          ],
          total: 100,
          limit: 20,
          offset: 0
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
          phone_number: "string",
          status: "completed",
          duration: 120,
          message: "string",
          transcript: "string",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:05:00Z"
        }
      },
      {
        method: "POST",
        path: "/call/batch",
        name: "Create Batch Call",
        description: "Create multiple calls in a single request.",
        parameters: [
          {
            name: "calls",
            type: "array",
            required: true,
            description: "Array of call objects to create."
          },
          {
            name: "batch_name",
            type: "string",
            required: false,
            description: "Optional name for the batch."
          }
        ],
        response: {
          batch_id: "string",
          status: "processing",
          total_calls: 10,
          created_calls: [
            {
              id: "string",
              phone_number: "string",
              status: "queued"
            }
          ],
          created_at: "2024-01-01T00:00:00Z"
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
  
  // Configuration state
  const [serverUrl, setServerUrl] = useState("https://dev-api.lokam.ai/api/v1/webhooks/vapi-webhook");
  const [secretToken, setSecretToken] = useState("sk-8kIA...8kIA");
  const [showSecretToken, setShowSecretToken] = useState(false);
  const [timeout, setTimeout] = useState("20");
  const [httpHeaders, setHttpHeaders] = useState<Array<{key: string, value: string}>>([]);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");
  const [showAddHeader, setShowAddHeader] = useState(false);
  
  // Agent Configuration state
  const [clientDetails, setClientDetails] = useState({
    customerName: "",
    customerPhone: "",
    serviceAdvisorName: "",
    serviceType: "",
    lastServiceComment: ""
  });
  
  const [organizationDetails, setOrganizationDetails] = useState({
    organizationName: "",
    organizationDescription: "",
    serviceCentreDescription: "",
    location: "",
    googleReviewLink: "",
    areasToFocus: ""
  });
  
  const [knowledgeFiles, setKnowledgeFiles] = useState<Array<{name: string, size: string, type: string}>>([]);

  // Section collapse state
  const [expandedSections, setExpandedSections] = useState({
    apiKeys: false,
    webhookConfiguration: false,
    clientDetails: false,
    organizationDetails: false,
    knowledgeFiles: false
  });

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
    if (key.length <= 6) return key;
    return `${key.substring(0, 3)}...${key.substring(key.length - 3)}`;
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

  const addHttpHeader = () => {
    if (newHeaderKey.trim() && newHeaderValue.trim()) {
      setHttpHeaders([...httpHeaders, { key: newHeaderKey.trim(), value: newHeaderValue.trim() }]);
      setNewHeaderKey("");
      setNewHeaderValue("");
      setShowAddHeader(false);
      toast({
        title: "Header added",
        description: "HTTP header has been added successfully."
      });
    }
  };

  const removeHttpHeader = (index: number) => {
    setHttpHeaders(httpHeaders.filter((_, i) => i !== index));
    toast({
      title: "Header removed",
      description: "HTTP header has been removed."
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type
      }));
      setKnowledgeFiles([...knowledgeFiles, ...newFiles]);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) have been uploaded successfully.`
      });
    }
  };

  const removeKnowledgeFile = (index: number) => {
    setKnowledgeFiles(knowledgeFiles.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "Knowledge file has been removed."
    });
  };

  const handleSaveConfiguration = () => {
    // Save all configuration data
    toast({
      title: "Configuration saved",
      description: "All settings have been saved successfully."
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generateConfigurationJSON = (): string => {
    const config = {
      feedback_call: {
        client_details: {
          customer_name: clientDetails.customerName || null,
          customer_phone: clientDetails.customerPhone || null,
          service_advisor_name: clientDetails.serviceAdvisorName || null,
          service_type: clientDetails.serviceType || null,
          last_service_comment: clientDetails.lastServiceComment || null
        },
        organization_details: {
          organization_name: organizationDetails.organizationName || null,
          organization_description: organizationDetails.organizationDescription || null,
          service_centre_description: organizationDetails.serviceCentreDescription || null,
          location: organizationDetails.location || null,
          google_review_link: organizationDetails.googleReviewLink || null,
          areas_to_focus: organizationDetails.areasToFocus || null
        },
        knowledge_files: knowledgeFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })),
        webhook_configuration: {
          server_url: serverUrl,
          timeout: parseInt(timeout) || 20,
          http_headers: httpHeaders.reduce((acc, header) => {
            acc[header.key] = header.value;
            return acc;
          }, {} as Record<string, string>)
        }
      }
    };

    return JSON.stringify(config, null, 2);
  };

  const renderAPIKeysTab = () => (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Configuration</h2>
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
          <Collapsible open={expandedSections.apiKeys} onOpenChange={() => toggleSection('apiKeys')}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -m-2">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>
                    API keys provide access to Lokam API. Keep them secure.
                  </CardDescription>
                </div>
                {expandedSections.apiKeys ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-4">
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
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <Collapsible open={expandedSections.webhookConfiguration} onOpenChange={() => toggleSection('webhookConfiguration')}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -m-2">
                <div>
                  <CardTitle>Webhook Configuration</CardTitle>
                  <CardDescription>
                    Configure server settings and HTTP headers for API integration
                  </CardDescription>
                </div>
                {expandedSections.webhookConfiguration ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-4 space-y-6">
                {/* Server Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Server Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="server-url">Server URL</Label>
                      <Input
                        id="server-url"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="https://your-server.com/api/webhook"
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="secret-token">Secret Token</Label>
                        <div className="relative mt-1">
                          <Input
                            id="secret-token"
                            type={showSecretToken ? "text" : "password"}
                            value={secretToken}
                            onChange={(e) => setSecretToken(e.target.value)}
                            placeholder="Enter your secret token"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowSecretToken(!showSecretToken)}
                          >
                            {showSecretToken ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="timeout">Timeout (seconds)</Label>
                        <Input
                          id="timeout"
                          type="number"
                          value={timeout}
                          onChange={(e) => setTimeout(e.target.value)}
                          placeholder="20"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* HTTP Headers */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">HTTP Headers</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Custom HTTP headers to include in API requests to your server
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddHeader(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Header
                    </Button>
                  </div>

                  {httpHeaders.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                      <p className="text-gray-500">
                        No headers configured. Click "Add Header" to add your first header.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {httpHeaders.map((header, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{header.key}:</span>
                            <span className="text-sm text-gray-600 ml-2">{header.value}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHttpHeader(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
      </Card>

      {/* Add Header Dialog */}
      <Dialog open={showAddHeader} onOpenChange={setShowAddHeader}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add HTTP Header</DialogTitle>
            <DialogDescription>
              Add a custom HTTP header to include in API requests.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="header-key" className="text-right">
                Key
              </Label>
              <Input
                id="header-key"
                placeholder="Content-Type"
                className="col-span-3"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="header-value" className="text-right">
                Value
              </Label>
              <Input
                id="header-value"
                placeholder="application/json"
                className="col-span-3"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddHeader(false)}>
              Cancel
            </Button>
            <Button onClick={addHttpHeader} disabled={!newHeaderKey.trim() || !newHeaderValue.trim()}>
              Add Header
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Configure your feedback call API</CardTitle>
          <CardDescription>
            Configure default values for the Feedback Agent that will be used in API calls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Left Side - Configuration Form */}
            <div className="space-y-6">
              {/* Section 1: Client & Service Details */}
              <Collapsible open={expandedSections.clientDetails} onOpenChange={() => toggleSection('clientDetails')}>
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Client & Service Details</h3>
                      </div>
                      {expandedSections.clientDetails ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name">Customer Name</Label>
                      <Input
                        id="customer-name"
                        value={clientDetails.customerName}
                        onChange={(e) => setClientDetails({...clientDetails, customerName: e.target.value})}
                        placeholder="Enter customer name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="customer-phone">Customer Phone Number</Label>
                      <Input
                        id="customer-phone"
                        value={clientDetails.customerPhone}
                        onChange={(e) => setClientDetails({...clientDetails, customerPhone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="service-advisor">Service Advisor Name</Label>
                      <Input
                        id="service-advisor"
                        value={clientDetails.serviceAdvisorName}
                        onChange={(e) => setClientDetails({...clientDetails, serviceAdvisorName: e.target.value})}
                        placeholder="Enter service advisor name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="service-type">Service Type</Label>
                      <Select value={clientDetails.serviceType} onValueChange={(value) => setClientDetails({...clientDetails, serviceType: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oil-change">Oil Change</SelectItem>
                          <SelectItem value="brake-service">Brake Service</SelectItem>
                          <SelectItem value="tire-rotation">Tire Rotation</SelectItem>
                          <SelectItem value="engine-repair">Engine Repair</SelectItem>
                          <SelectItem value="transmission">Transmission Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="last-service-comment">Last Service Comment</Label>
                      <Textarea
                        id="last-service-comment"
                        value={clientDetails.lastServiceComment}
                        onChange={(e) => setClientDetails({...clientDetails, lastServiceComment: e.target.value})}
                        placeholder="Enter details about the last service performed"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <Separator />

              {/* Section 2: Organization Details */}
              <Collapsible open={expandedSections.organizationDetails} onOpenChange={() => toggleSection('organizationDetails')}>
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Organization Details</h3>
                      </div>
                      {expandedSections.organizationDetails ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4">
                    <div>
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        value={organizationDetails.organizationName}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, organizationName: e.target.value})}
                        placeholder="Enter organization name"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={organizationDetails.location}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, location: e.target.value})}
                        placeholder="Enter location"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="org-description">Organization Description</Label>
                      <Textarea
                        id="org-description"
                        value={organizationDetails.organizationDescription}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, organizationDescription: e.target.value})}
                        placeholder="Enter organization description"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="service-centre-description">Service Centre Description</Label>
                      <Textarea
                        id="service-centre-description"
                        value={organizationDetails.serviceCentreDescription}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, serviceCentreDescription: e.target.value})}
                        placeholder="Enter service centre description"
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="google-review-link">Google Review Link</Label>
                      <Input
                        id="google-review-link"
                        value={organizationDetails.googleReviewLink}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, googleReviewLink: e.target.value})}
                        placeholder="https://g.page/your-business/review"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="areas-to-focus">Areas to Focus</Label>
                      <Input
                        id="areas-to-focus"
                        value={organizationDetails.areasToFocus}
                        onChange={(e) => setOrganizationDetails({...organizationDetails, areasToFocus: e.target.value})}
                        placeholder="e.g., Customer satisfaction, Service quality"
                        className="mt-1"
                      />
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>

              <Separator />

              {/* Section 3: Knowledge Files */}
              <Collapsible open={expandedSections.knowledgeFiles} onOpenChange={() => toggleSection('knowledgeFiles')}>
                <div className="space-y-4">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Knowledge Files</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedSections.knowledgeFiles ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Upload files that will act as knowledge sources for the Feedback Agent
                      </p>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>

                    {knowledgeFiles.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
                        <FileTextIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-sm">
                          No knowledge files uploaded. Click "Upload Files" to add your first file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {knowledgeFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                            <FileTextIcon className="h-4 w-4 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size} • {file.type}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeKnowledgeFile(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>

            {/* Right Side - Generated JSON */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Generated Configuration</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyCodeToClipboard(generateConfigurationJSON())}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy JSON
                </Button>
              </div>
              
              <div className="border rounded-lg bg-gray-900 text-gray-100 p-4 h-[600px] overflow-y-auto">
                <pre className="text-sm font-mono">
                  <code>{generateConfigurationJSON()}</code>
                </pre>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>This JSON configuration can be used directly in your API calls to configure the Feedback Agent with the specified parameters.</p>
              </div>
            </div>
          </div>
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



  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-background -m-4 p-4">
              <div className="flex flex-col gap-8 p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Platform</h1>
                    <p className="text-muted-foreground mt-2">
                      Manage your API integration and access
                    </p>
                  </div>
                  <Button onClick={handleSaveConfiguration} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </Button>
                </div>

                <Tabs defaultValue="api-keys" className="w-full">
                  <TabsList className="flex w-full bg-transparent p-0 h-auto border-b justify-start">
                    <TabsTrigger value="api-keys" className="flex items-center gap-2 data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent rounded-none relative px-4">
                      <Key className="w-4 h-4" />
                      API Configuration
                    </TabsTrigger>
                    <TabsTrigger value="api-reference" className="flex items-center gap-2 data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=active]:bg-transparent rounded-none relative px-4">
                      <FileText className="w-4 h-4" />
                      API Reference
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="api-keys" className="mt-6">
                    {renderAPIKeysTab()}
                  </TabsContent>
                  
                  <TabsContent value="api-reference" className="mt-6">
                    {renderAPIReferenceTab()}
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