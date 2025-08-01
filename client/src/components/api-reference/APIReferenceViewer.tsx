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
    return `curl -X POST "http://localhost:8000/api/v1/public/calls" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "feedback_call": {
      "client_details": {
        "customer_name": "John Doe",
        "customer_phone": "+1234567890",
        "service_advisor_name": "Mike Smith",
        "service_type": "oil-change",
        "last_service_comment": "Oil and filter changed"
      },
      "organization_details": {
        "organization_name": "ABC Auto Service",
        "organization_description": "Professional auto service center",
        "service_centre_description": "Full-service automotive repair",
        "location": "123 Main St, City, State",
        "google_review_link": "https://g.page/abc-auto/review",
        "areas_to_focus": "Customer satisfaction, Service quality"
      },
      "knowledge_files": [],
      "webhook_configuration": {
        "server_url": "https://your-server.com/webhook",
        "timeout": 20,
        "http_headers": {}
      }
    }
  }'`;
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left Sidebar - Endpoints */}
      <div className="w-48 border-r bg-muted/30 overflow-y-auto">
        <div className="p-3">
          <h3 className="font-semibold mb-3 text-sm">Endpoints</h3>
          {API_ENDPOINTS.map((category) => (
            <div key={category.category} className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="space-y-1">
                {category.endpoints.map((endpoint) => (
                  <button
                    key={`${endpoint.method}-${endpoint.path}`}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
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
        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className={`${getMethodColor(selectedEndpoint.method)}`}>
                {selectedEndpoint.method}
              </Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {selectedEndpoint.path}
              </code>
            </div>
            <h2 className="text-xl font-bold">{selectedEndpoint.name}</h2>
            <p className="text-sm text-muted-foreground mt-2">{selectedEndpoint.description}</p>
          </div>

          {selectedEndpoint.parameters.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Query Parameters</h3>
              <div className="space-y-4">
                {selectedEndpoint.parameters.map((param) => (
                  <div key={param.name} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {param.name}
                        </code>
                        <Badge variant={param.required ? "default" : "secondary"}>
                          {param.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground font-medium">{param.type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{param.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Request/Response Samples */}
      <div className="flex-1 border-l bg-muted/30 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold mb-4 text-sm">Try It</h3>
          
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
            <div className="bg-black text-green-400 p-3 rounded-md text-xs font-mono">
              <div>$ curl -X POST "http://localhost:8000/api/v1/public/calls" \</div>
              <div>&gt;  -H "Authorization: Bearer YOUR_API_KEY" \</div>
              <div>&gt;  -H "Content-Type: application/json" \</div>
              <div>&gt;  -d '{`{`}</div>
              <div>&gt;    "feedback_call": {`{`}</div>
              <div>&gt;      "client_details": {`{`}</div>
              <div>&gt;        "customer_name": "John Doe",</div>
              <div>&gt;        "customer_phone": "+1234567890",</div>
              <div>&gt;        "service_type": "oil-change"</div>
              <div>&gt;      {`}`},</div>
              <div>&gt;      "organization_details": {`{`}</div>
              <div>&gt;        "organization_name": "ABC Auto Service"</div>
              <div>&gt;      {`}`},</div>
              <div>&gt;      "knowledge_files": [],</div>
              <div>&gt;      "webhook_configuration": {`{`}</div>
              <div>&gt;        "server_url": "https://your-server.com/webhook"</div>
              <div>&gt;      {`}`}</div>
              <div>&gt;    {`}`}</div>
              <div>&gt;  {`}`}'</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">Response</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyCode(JSON.stringify(selectedEndpoint.response, null, 2))}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-black text-gray-300 p-3 rounded-md text-xs font-mono h-[calc(100vh-20rem)] overflow-y-auto">
              <pre>{JSON.stringify(selectedEndpoint.response, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};