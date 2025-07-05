import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, File, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  updateOrganizationConfig,
  updateSettingByKey,
  getSettingsByCategory,
  getDMSIntegration,
  createDMSIntegration,
  updateDMSIntegration,
  uploadKnowledgeFile,
  getKnowledgeFiles,
  deleteKnowledgeFile,
  initializeSettings,
} from "@/api/endpoints/configuration";
import { API_BASE_URL, getHeaders } from "@/api/config";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

export function ConfigurationSettings() {
  const { toast } = useToast();

  // Default focus areas (8 items)
  const defaultFocusAreas = [
    "Customer Service Excellence",
    "Timeliness & Efficiency",
    "Service Quality & Workmanship",
    "Pricing Transparency",
    "Communication & Updates",
    "Facility Cleanliness",
    "Staff Professionalism",
    "Follow-up & Support",
  ];

  // Default service types (8 items)
  const defaultServiceTypes = [
    "Oil Change & Maintenance",
    "Brake Service & Repair",
    "Tire Services",
    "Engine Diagnostics",
    "Transmission Service",
    "Air Conditioning Service",
    "Electrical System Repair",
    "General Auto Repair",
  ];

  // Default inquiry topics (8 items)
  const defaultInquiryTopics = [
    "Service Estimate Request",
    "Appointment Scheduling",
    "Service Status Update",
    "Billing & Payment Questions",
    "Warranty Information",
    "Parts Availability",
    "Customer Complaints",
    "General Information Request",
  ];

  const [focusAreas, setFocusAreas] = useState<string[]>(defaultFocusAreas);
  const [serviceTypes, setServiceTypes] =
    useState<string[]>(defaultServiceTypes);
  const [inquiryTopics, setInquiryTopics] =
    useState<string[]>(defaultInquiryTopics);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [newFocusArea, setNewFocusArea] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newInquiryTopic, setNewInquiryTopic] = useState("");

  // State for form fields
  const [companyDescription, setCompanyDescription] = useState("");
  const [serviceCenterDescription, setServiceCenterDescription] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(20);
  const [authHeader, setAuthHeader] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hipaaEnabled, setHipaaEnabled] = useState(false);
  const [pciEnabled, setPciEnabled] = useState(false);

  // State for DMS integration
  const [dmsIntegrationId, setDmsIntegrationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const MIN_ITEMS = 5;
  const MAX_ITEMS = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [".pdf", ".doc", ".docx", ".txt", ".csv"];

  const addFocusArea = () => {
    if (newFocusArea.trim() && focusAreas.length < MAX_ITEMS) {
      setFocusAreas([...focusAreas, newFocusArea.trim()]);
      setNewFocusArea("");
    }
  };

  const removeFocusArea = (index: number) => {
    if (focusAreas.length > MIN_ITEMS) {
      setFocusAreas(focusAreas.filter((_, i) => i !== index));
    }
  };

  const addServiceType = () => {
    if (newServiceType.trim() && serviceTypes.length < MAX_ITEMS) {
      setServiceTypes([...serviceTypes, newServiceType.trim()]);
      setNewServiceType("");
    }
  };

  const removeServiceType = (index: number) => {
    if (serviceTypes.length > MIN_ITEMS) {
      setServiceTypes(serviceTypes.filter((_, i) => i !== index));
    }
  };

  const addInquiryTopic = () => {
    if (newInquiryTopic.trim() && inquiryTopics.length < MAX_ITEMS) {
      setInquiryTopics([...inquiryTopics, newInquiryTopic.trim()]);
      setNewInquiryTopic("");
    }
  };

  const removeInquiryTopic = (index: number) => {
    if (inquiryTopics.length > MIN_ITEMS) {
      setInquiryTopics(inquiryTopics.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Validate file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type. Please upload PDF, DOC, DOCX, TXT, or CSV files.`,
          variant: "destructive",
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: `${file.name} is larger than 10MB. Please upload a smaller file.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Create form data for upload
        const formData = new FormData();
        formData.append("file", file);
        if (
          file.name.toLowerCase().includes("policy") ||
          file.name.toLowerCase().includes("procedure")
        ) {
          formData.append("description", "Policy or procedure document");
        }

        // Upload file to server
        const response = await uploadKnowledgeFile(formData);

        // Add to state with server ID
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: response.id.toString(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date(),
          },
        ]);

        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error("Failed to upload file:", error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    // Reset the input
    event.target.value = "";
  };

  const removeFile = async (fileId: string) => {
    try {
      // Delete from server
      await deleteKnowledgeFile(parseInt(fileId));

      // Update state
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));

      toast({
        title: "File Removed",
        description: "File has been removed from knowledge sources.",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: "Failed to remove file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch organization data
        const orgResponse = await fetch(`${API_BASE_URL}/organizations`, {
          credentials: "include",
          headers: getHeaders(),
        });

        if (!orgResponse.ok) {
          throw new Error(
            `Failed to fetch organization data: ${orgResponse.statusText}`
          );
        }

        const orgData = await orgResponse.json();
        // Store organization ID for settings creation if needed
        localStorage.setItem("organizationId", orgData.id);

        // Set organization fields
        setCompanyDescription(orgData.description || "");
        setServiceCenterDescription(orgData.service_center_description || "");
        setFocusAreas(orgData.focus_areas || defaultFocusAreas);
        setServiceTypes(orgData.service_types || defaultServiceTypes);
        setHipaaEnabled(orgData.hipaa_compliant || false);
        setPciEnabled(orgData.pci_compliant || false);

        // Fetch settings by category
        try {
          const settingsResponse = await getSettingsByCategory();
          if (
            settingsResponse.settings &&
            settingsResponse.settings.inquiries
          ) {
            const inquirySettings = settingsResponse.settings.inquiries;
            if (inquirySettings.inquiry_topics) {
              // Parse the JSON string if needed
              let topicsValue = inquirySettings.inquiry_topics.value;
              try {
                // Check if it's a JSON string and parse it
                if (typeof topicsValue === "string") {
                  topicsValue = JSON.parse(topicsValue);
                }
              } catch (e) {
                console.error("Failed to parse inquiry topics:", e);
              }

              // Use the parsed value or default
              setInquiryTopics(
                Array.isArray(topicsValue) ? topicsValue : defaultInquiryTopics
              );
            }
          } else {
            console.log("No inquiry settings found, initializing defaults");
            await initializeSettings();
            // Fetch settings again after initialization
            const refreshedSettings = await getSettingsByCategory();
            if (
              refreshedSettings.settings &&
              refreshedSettings.settings.inquiries &&
              refreshedSettings.settings.inquiries.inquiry_topics
            ) {
              let topicsValue =
                refreshedSettings.settings.inquiries.inquiry_topics.value;
              try {
                // Check if it's a JSON string and parse it
                if (typeof topicsValue === "string") {
                  topicsValue = JSON.parse(topicsValue);
                }
              } catch (e) {
                console.error("Failed to parse inquiry topics:", e);
              }

              // Use the parsed value or default
              setInquiryTopics(
                Array.isArray(topicsValue) ? topicsValue : defaultInquiryTopics
              );
            } else {
              setInquiryTopics(defaultInquiryTopics);
            }
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
          // Use defaults if settings fetch fails
          setInquiryTopics(defaultInquiryTopics);
        }

        // Fetch DMS integration
        try {
          const dmsData = await getDMSIntegration();
          if (dmsData) {
            setDmsIntegrationId(dmsData.id);
            setServerUrl(dmsData.config.server_url || "");
            setTimeoutSeconds(dmsData.timeout_seconds || 20);
            setAuthHeader(dmsData.config.auth_header || "");
            setApiKey(dmsData.config.api_key || "");
          }
        } catch (error) {
          // No DMS integration exists yet - that's okay
          console.log("No DMS integration found");
        }

        // Fetch knowledge files
        try {
          const files = await getKnowledgeFiles();
          if (Array.isArray(files)) {
            const formattedFiles: UploadedFile[] = files.map((file) => ({
              id: file.id.toString(),
              name: file.name,
              size: file.file_size,
              type: file.file_type,
              uploadDate: new Date(file.created_at),
            }));
            setUploadedFiles(formattedFiles);
          }
        } catch (error) {
          console.error("Failed to fetch knowledge files:", error);
        }
      } catch (error) {
        console.error("Error fetching configuration data:", error);
        toast({
          title: "Error",
          description: "Failed to load configuration data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveConfiguration = async () => {
    try {
      setIsLoading(true);

      // Update organization data
      await updateOrganizationConfig({
        description: companyDescription,
        service_center_description: serviceCenterDescription,
        focus_areas: focusAreas,
        service_types: serviceTypes,
        hipaa_compliant: hipaaEnabled,
        pci_compliant: pciEnabled,
      });

      // Update inquiry topics via settings
      await updateSettingByKey(
        "inquiry_topics",
        inquiryTopics,
        "Types of inquiries expected from customers"
      );

      // Update or create DMS integration
      const dmsData = {
        name: "Primary DMS Integration",
        type: "Generic",
        timeout_seconds: timeoutSeconds,
        config: {
          server_url: serverUrl,
          auth_header: authHeader,
          api_key: apiKey,
        },
        is_active: true,
      };

      if (dmsIntegrationId) {
        await updateDMSIntegration(dmsIntegrationId, dmsData);
      } else if (serverUrl.trim()) {
        const response = await createDMSIntegration(dmsData);
        setDmsIntegrationId(response.id);
      }

      toast({
        title: "Configuration Saved",
        description: "Configuration settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast({
        title: "Error Saving Configuration",
        description: "An error occurred while saving the configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuration</h1>
        <p className="text-gray-600 mt-1">
          Configure your business details and service classifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Basic information about your company and service center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name and Service Center Name removed as requested */}

          <div className="space-y-2">
            <Label htmlFor="company-description">Description of Company</Label>
            <Textarea
              id="company-description"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Enter company description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-center-description">
              Description of Service Center
            </Label>
            <Textarea
              id="service-center-description"
              value={serviceCenterDescription}
              onChange={(e) => setServiceCenterDescription(e.target.value)}
              placeholder="Enter service center description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Areas to Focus</CardTitle>
          <CardDescription>
            Key feedback areas to highlight (minimum {MIN_ITEMS}, maximum{" "}
            {MAX_ITEMS})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Current items: {focusAreas.length}/{MAX_ITEMS}
            </span>
            {focusAreas.length < MIN_ITEMS && (
              <span className="text-amber-600">
                Minimum {MIN_ITEMS} items required
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {area}
                <X
                  className={`h-3 w-3 cursor-pointer hover:text-red-500 ${
                    focusAreas.length <= MIN_ITEMS
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => removeFocusArea(index)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add focus area..."
              value={newFocusArea}
              onChange={(e) => setNewFocusArea(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addFocusArea()}
              disabled={focusAreas.length >= MAX_ITEMS}
            />
            <Button
              onClick={addFocusArea}
              disabled={!newFocusArea.trim() || focusAreas.length >= MAX_ITEMS}
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {focusAreas.length >= MAX_ITEMS && (
            <p className="text-sm text-amber-600">
              Maximum of {MAX_ITEMS} focus areas reached
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Types</CardTitle>
          <CardDescription>
            Types of services offered at your center (minimum {MIN_ITEMS},
            maximum {MAX_ITEMS})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Current items: {serviceTypes.length}/{MAX_ITEMS}
            </span>
            {serviceTypes.length < MIN_ITEMS && (
              <span className="text-amber-600">
                Minimum {MIN_ITEMS} items required
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((service, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1"
              >
                {service}
                <X
                  className={`h-3 w-3 cursor-pointer hover:text-red-500 ${
                    serviceTypes.length <= MIN_ITEMS
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => removeServiceType(index)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add service type..."
              value={newServiceType}
              onChange={(e) => setNewServiceType(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addServiceType()}
              disabled={serviceTypes.length >= MAX_ITEMS}
            />
            <Button
              onClick={addServiceType}
              disabled={
                !newServiceType.trim() || serviceTypes.length >= MAX_ITEMS
              }
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {serviceTypes.length >= MAX_ITEMS && (
            <p className="text-sm text-amber-600">
              Maximum of {MAX_ITEMS} service types reached
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Topics</CardTitle>
          <CardDescription>
            Types of inquiries expected from customers (minimum {MIN_ITEMS},
            maximum {MAX_ITEMS})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Current items: {inquiryTopics.length}/{MAX_ITEMS}
            </span>
            {inquiryTopics.length < MIN_ITEMS && (
              <span className="text-amber-600">
                Minimum {MIN_ITEMS} items required
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {inquiryTopics.map((topic, index) => (
              <Badge
                key={index}
                variant="outline"
                className="flex items-center gap-1"
              >
                {topic}
                <X
                  className={`h-3 w-3 cursor-pointer hover:text-red-500 ${
                    inquiryTopics.length <= MIN_ITEMS
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => removeInquiryTopic(index)}
                />
              </Badge>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Add inquiry topic..."
              value={newInquiryTopic}
              onChange={(e) => setNewInquiryTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addInquiryTopic()}
              disabled={inquiryTopics.length >= MAX_ITEMS}
            />
            <Button
              onClick={addInquiryTopic}
              disabled={
                !newInquiryTopic.trim() || inquiryTopics.length >= MAX_ITEMS
              }
              variant="outline"
              size="icon"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {inquiryTopics.length >= MAX_ITEMS && (
            <p className="text-sm text-amber-600">
              Maximum of {MAX_ITEMS} inquiry topics reached
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Knowledge Source Files</CardTitle>
          <CardDescription>
            Upload documents and files that the Inquiry agent can reference to
            provide accurate answers to customer questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer text-sm font-medium text-gray-900"
                >
                  Upload knowledge source files
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: PDF, DOC, DOCX, TXT, CSV (Max 10MB per
                  file)
                </p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Uploaded Files ({uploadedFiles.length})
                </Label>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <File className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • Uploaded{" "}
                            {file.uploadDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                How to use knowledge source files:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Upload documents containing your business policies,
                  procedures, and frequently asked questions
                </li>
                <li>
                  • Include service manuals, pricing guides, and warranty
                  information
                </li>
                <li>
                  • The Inquiry agent will reference these files to provide
                  accurate, consistent answers
                </li>
                <li>
                  • Keep files updated to ensure the agent has the latest
                  information
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Settings</CardTitle>
          <CardDescription>
            Configure compliance and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hipaa-switch">HIPAA Enabled</Label>
              <div className="text-sm text-gray-500">
                Enabling HIPAA will disable storage of call recordings, logs or
                transcripts of any future calls.
              </div>
            </div>
            <Switch
              id="hipaa-switch"
              checked={hipaaEnabled}
              onCheckedChange={setHipaaEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pci-switch">PCI Enabled</Label>
              <div className="text-sm text-gray-500">
                Enabling PCI will disable storage of call recordings, logs or
                transcripts of any future calls.
              </div>
            </div>
            <Switch
              id="pci-switch"
              checked={pciEnabled}
              onCheckedChange={setPciEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DMS Integration</CardTitle>
          <CardDescription>
            Connect to your Dealer Management System for seamless data
            integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-url">Server URL</Label>
            <Input
              id="server-url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://your-dms-server.com/api"
            />
            <div className="text-sm text-gray-500">
              Enter the URL to your DMS server endpoint. AutoPulse uses this to
              fetch service records and customer data.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeout">Timeout Seconds</Label>
            <Input
              id="timeout"
              type="number"
              value={timeoutSeconds}
              onChange={(e) =>
                setTimeoutSeconds(parseInt(e.target.value) || 20)
              }
              min={1}
              max={120}
            />
            <div className="text-sm text-gray-500">
              This is the timeout in seconds for the request to your server.
              Must be between 1 and 120 seconds.
            </div>
          </div>

          <div className="space-y-4">
            <Label>Authentication Headers</Label>
            <div className="text-sm text-gray-500 mb-3">
              Add authentication headers required by your DMS system.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auth-header">Authorization Header</Label>
                <Input
                  id="auth-header"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  placeholder="Bearer token or API key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your API key"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">Test Connection</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSaveConfiguration} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
