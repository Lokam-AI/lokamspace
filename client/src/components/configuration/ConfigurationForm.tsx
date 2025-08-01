import { useState, useEffect } from "react";
import { Copy, Code2, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientDetailsForm } from "./ClientDetailsForm";
import { OrganizationDetailsForm } from "./OrganizationDetailsForm";
import { useConfiguration } from "@/hooks/useConfiguration";
import { useClipboard } from "@/hooks/useClipboard";
import { generateConfigurationJSON } from "@/utils/configurationGenerator";

export const ConfigurationForm = () => {
  const {
    clientDetails,
    organizationDetails,
    webhookConfig,
    expandedSections,
    toggleSection,
    updateClientDetails,
    updateOrganizationDetails,
    initializeWithDefaults
  } = useConfiguration();

  // Initialize with default values
  useEffect(() => {
    initializeWithDefaults({
      clientDetails: {
        serviceAdvisorName: "Mike Smith",
        serviceType: "oil-change",
        lastServiceComment: "Regular maintenance service completed successfully"
      },
      organizationDetails: {
        organizationName: "ABC Auto Service",
        organizationDescription: "Professional auto service center",
        serviceCentreDescription: "Full-service automotive repair and maintenance",
        location: "123 Main St, City, State",
        googleReviewLink: "https://g.page/abc-auto-service/review",
        areasToFocus: "Customer satisfaction, Service quality"
      }
    });
  }, [initializeWithDefaults]);

  const { copyCode } = useClipboard();

  const handleCopyConfiguration = () => {
    const configJson = generateConfigurationJSON(
      clientDetails,
      organizationDetails,
      [], // Empty knowledge files array
      webhookConfig.serverUrl,
      webhookConfig.timeout,
      webhookConfig.httpHeaders
    );
    copyCode(configJson);
  };

  const handleCopyCurl = () => {
    const configJson = generateConfigurationJSON(
      clientDetails,
      organizationDetails,
      [], // Empty knowledge files array
      webhookConfig.serverUrl,
      webhookConfig.timeout,
      webhookConfig.httpHeaders
    );
    
    const curlCommand = `curl -X POST "http://localhost:8000/api/v1/public/calls" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(JSON.parse(configJson), null, 2)}'`;
    
    copyCode(curlCommand);
  };

  const getConfigurationJSON = () => {
    return generateConfigurationJSON(
      clientDetails,
      organizationDetails,
      [], // Empty knowledge files array
      webhookConfig.serverUrl,
      webhookConfig.timeout,
      webhookConfig.httpHeaders
    );
  };
  
  const getCurlCommand = () => {
    const configJson = generateConfigurationJSON(
      clientDetails,
      organizationDetails,
      [], // Empty knowledge files array
      webhookConfig.serverUrl,
      webhookConfig.timeout,
      webhookConfig.httpHeaders
    );
    
    return `curl -X POST "http://localhost:8000/api/v1/public/calls" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(JSON.parse(configJson), null, 2)}'`;
  };

  return (
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
            <ClientDetailsForm
              clientDetails={clientDetails}
              onUpdate={updateClientDetails}
              expanded={expandedSections.clientDetails}
              onToggle={() => toggleSection('clientDetails')}
            />

            <Separator />

            <OrganizationDetailsForm
              organizationDetails={organizationDetails}
              onUpdate={updateOrganizationDetails}
              expanded={expandedSections.organizationDetails}
              onToggle={() => toggleSection('organizationDetails')}
            />
          </div>

          {/* Right Side - Generated JSON and cURL Command */}
          <div className="space-y-4">
            <Tabs defaultValue="json" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="json" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  JSON
                </TabsTrigger>
                <TabsTrigger value="curl" className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  cURL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="json" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Generated Configuration</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyConfiguration}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy JSON
                  </Button>
                </div>
                
                <div className="border rounded-lg bg-gray-900 text-gray-100 p-4 h-[500px] overflow-y-auto">
                  <pre className="text-sm font-mono">
                    <code>{getConfigurationJSON()}</code>
                  </pre>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>This JSON configuration can be used directly in your API calls to configure the Feedback Agent.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="curl" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">cURL Command</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyCurl}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Command
                  </Button>
                </div>
                
                <div className="border rounded-lg bg-gray-900 text-gray-100 p-4 h-[500px] overflow-y-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    <code>{getCurlCommand()}</code>
                  </pre>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>Replace YOUR_API_KEY with your actual API key and run this command to test your configuration.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};