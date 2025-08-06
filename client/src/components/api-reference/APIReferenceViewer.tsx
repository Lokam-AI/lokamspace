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
    <div className="flex flex-col h-full">
      {/* Authentication Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">🔐 Authentication</h2>
        <p className="text-sm text-blue-800 mb-3">
          All API endpoints require authentication using an API Key provided by Lokam.
        </p>
        <div className="bg-white border border-blue-200 rounded p-3">
          <p className="text-xs font-medium text-blue-700 mb-2">Required Headers:</p>
          <div className="bg-black text-green-400 p-2 rounded text-xs font-mono">
            <div>Authorization: Bearer &lt;API_KEY&gt;</div>
            <div>Content-Type: application/json</div>
          </div>
        </div>
      </div>

      {/* API Reference Viewer */}
      <div className="flex flex-1 gap-4 min-h-0">
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

      {/* Middle Section - Documentation */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className={`${getMethodColor(selectedEndpoint.method)} text-sm px-3 py-1`}>
                {selectedEndpoint.method}
              </Badge>
              <code className="text-base bg-muted px-3 py-2 rounded font-mono">
                {selectedEndpoint.path}
              </code>
            </div>
            <h1 className="text-2xl font-bold mb-3">{selectedEndpoint.name}</h1>
            <p className="text-base text-muted-foreground leading-relaxed">{selectedEndpoint.description}</p>
          </div>

          {/* Path Parameters */}
          {selectedEndpoint.path.includes('{') && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Path parameters</h2>
              <div className="space-y-3">
                {selectedEndpoint.path.match(/\{([^}]+)\}/g)?.map((param) => {
                  const paramName = param.replace(/[{}]/g, '');
                  return (
                    <div key={paramName} className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded font-semibold">
                          {paramName}
                        </code>
                        <span className="text-sm text-muted-foreground">string</span>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {paramName === 'call_id' ? 'The unique identifier for the call.' : 
                         paramName === 'campaign_id' ? 'The unique identifier for the campaign.' :
                         `The ${paramName} parameter.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Query Parameters */}
          {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Query parameters</h2>
              <div className="space-y-4">
                {selectedEndpoint.parameters.map((param) => (
                  <div key={param.name} className="pb-4 border-b border-muted last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded font-semibold">
                        {param.name}
                      </code>
                      <span className="text-sm text-muted-foreground">{param.type}</span>
                      <Badge variant={param.required ? "destructive" : "secondary"} className="text-xs">
                        {param.required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Headers */}
          {selectedEndpoint.method !== "WEBHOOK" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Headers</h2>
              <div className="space-y-4">
                <div className="pb-4 border-b border-muted">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded font-semibold">
                      Authorization
                    </code>
                    <span className="text-sm text-muted-foreground">string</span>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bearer authentication of the form Bearer &lt;token&gt;, where token is your auth token.
                  </p>
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded font-semibold">
                      Content-Type
                    </code>
                    <span className="text-sm text-muted-foreground">string</span>
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Must be set to application/json for all API requests.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request Body */}
          {selectedEndpoint.payload && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Request</h2>
              <p className="text-sm text-muted-foreground mb-4">This endpoint expects an object.</p>
              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="bg-black text-gray-300 p-4 rounded-md text-sm font-mono overflow-x-auto">
                  <pre>{JSON.stringify(selectedEndpoint.payload, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Response */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Response</h2>
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="bg-black text-gray-300 p-4 rounded-md text-sm font-mono overflow-x-auto max-h-96">
                <pre>{JSON.stringify(selectedEndpoint.response, null, 2)}</pre>
              </div>
            </div>
          </div>

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
      </div>

      {/* Right Section - Request/Response Samples */}
      <div className="flex-1 border-l bg-muted/30 overflow-y-auto min-w-0">
        <div className="p-4">
          <h3 className="font-semibold mb-4 text-sm">Try It</h3>
          
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
    </div>
  );
};