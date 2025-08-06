import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS, APIEndpoint } from "@/constants/apiEndpoints";
import { getMethodColor } from "@/utils/apiUtils";
import { useClipboard } from "@/hooks/useClipboard";

export const APIReferenceViewer = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint>(API_ENDPOINTS[0].endpoints[0]);
  const { copyCode } = useClipboard();

  const generateCurlCommand = () => {
    const baseUrl = "https://api.lokam.ai";
    const method = selectedEndpoint.method === "WEBHOOK" ? "POST" : selectedEndpoint.method;
    const path = selectedEndpoint.path === "N/A" ? "/webhook" : selectedEndpoint.path;
    
    let curlCommand = `curl -X ${method} "${baseUrl}${path}"`;
    
    // Add headers
    if (selectedEndpoint.method !== "WEBHOOK") {
      curlCommand += ` \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
    }
    curlCommand += ` \\\n  -H "Content-Type: application/json"`;
    
    // Add payload if exists
    if (selectedEndpoint.payload) {
      curlCommand += ` \\\n  -d '${JSON.stringify(selectedEndpoint.payload, null, 2)}'`;
    }
    
    return curlCommand;
  };

  return (
    <div className="flex h-full gap-4">
        {/* Left Sidebar - Endpoints */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h3 className="font-semibold mb-4 text-sm">Endpoints</h3>
          {API_ENDPOINTS.map((category) => (
            <div key={category.category} className="mb-6">
              <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.endpoints.map((endpoint) => (
                  <button
                    key={`${endpoint.method}-${endpoint.path}`}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                      selectedEndpoint === endpoint
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </Badge>
                      <span className="font-medium text-sm truncate">{endpoint.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                      {endpoint.path !== "N/A" ? endpoint.path : "Webhook Event"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Request/Response Samples */}
      <div className="flex-1 bg-muted/30 overflow-y-auto">
        <div className="p-6">
          {/* Endpoint Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className={`${getMethodColor(selectedEndpoint.method)} text-sm px-3 py-1`}>
                {selectedEndpoint.method}
              </Badge>
              <code className="text-base bg-muted px-3 py-2 rounded font-mono">
                {selectedEndpoint.path}
              </code>
            </div>
            <h1 className="text-2xl font-bold mb-3">{selectedEndpoint.name}</h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-6">{selectedEndpoint.description}</p>
            
            {selectedEndpoint.note && (
              <div className="mb-6">
                <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md">
                  <p className="text-sm text-blue-800 font-medium">
                    <span className="font-semibold">Note:</span> {selectedEndpoint.note}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold mb-4 text-lg">Try It</h3>
          
          {selectedEndpoint.method !== "WEBHOOK" ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Request</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyCode(generateCurlCommand())}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-black text-green-400 p-3 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {generateCurlCommand()}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Webhook Event</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyCode(JSON.stringify(selectedEndpoint.response, null, 2))}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 rounded-md text-xs">
                <p className="text-purple-800 mb-2">
                  This is a webhook event that will be sent to your configured webhook URL.
                </p>
                <p className="text-purple-600 text-xs">
                  Configure your webhook URL during API key creation.
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">
                {selectedEndpoint.method === "WEBHOOK" ? "Event Payload" : "Response"}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyCode(JSON.stringify(selectedEndpoint.response, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-black text-gray-300 p-3 rounded-md text-xs font-mono max-h-96 overflow-y-auto">
              <pre>{JSON.stringify(selectedEndpoint.response, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};