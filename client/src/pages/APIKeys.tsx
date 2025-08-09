import { useState } from "react";
import { Key, Plus, FileText } from "lucide-react";
import { ApiKey } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Hooks
import { useAPIKeys } from "@/hooks/useAPIKeys";

// Components
import { APIKeysTable } from "@/components/api-keys/APIKeysTable";
import { APIKeyDetailsModal } from "@/components/api-keys/APIKeyDetailsModal";
import { CreateAPIKeyDialog } from "@/components/api-keys/CreateAPIKeyDialog";
import { APIReferenceViewer } from "@/components/api-reference/APIReferenceViewer";

// API Keys will be loaded from the backend

export default function APIKeys() {
  // State for modals and dialogs
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  
  // Custom hook for API key management
  const { 
    apiKeys, 
    loading, 
    creating, 
    updating, 
    createApiKey: createNewApiKey, 
    deleteApiKey: deleteKey, 
    updateApiKey: updateKey 
  } = useAPIKeys();

  // Event handlers
  const handleViewDetails = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedApiKey(null);
  };

  const handleDeleteKey = async (id: string) => {
    await deleteKey(id);
    // Close modal if it was open for this key
    if (selectedApiKey?.id === id) {
      handleCloseDetails();
    }
  };



  const renderAPIKeysTab = () => (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Your API Configurations</CardTitle>
            <CardDescription>
              Each configuration includes an API key and webhook settings for secure access to Lokam API.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <APIKeysTable 
            apiKeys={apiKeys}
            loading={loading}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Details Modal */}
      <APIKeyDetailsModal
        open={detailsModalOpen}
        onOpenChange={handleCloseDetails}
        apiKey={selectedApiKey}
        onUpdate={updateKey}
        onDelete={handleDeleteKey}
        updating={updating}
      />

    </div>
  );

  const renderAPIReferenceTab = () => <APIReferenceViewer />;

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
                  <div className="flex gap-2">
                    <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex items-center gap-2">
                          <Plus className="w-3 h-3" />
                          Create New Configuration
                        </Button>
                      </DialogTrigger>
                      <CreateAPIKeyDialog 
                        open={newKeyOpen}
                        onOpenChange={setNewKeyOpen}
                        onCreateKey={createNewApiKey}
                        creating={creating}
                      />
                    </Dialog>

                  </div>
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
                  
                  <TabsContent value="api-reference" className="mt-6 h-[calc(100vh-16rem)] overflow-hidden">
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