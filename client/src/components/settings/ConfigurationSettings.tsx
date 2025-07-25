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
import { X, Plus, Upload, File, Trash, AlertCircle } from "lucide-react";
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
  listTags,
  createTag,
  deleteTag,
  checkRequiredTags,
  getOrganizationDescriptions,
  updateOrganizationDescriptions,
  getFocusAreas,
  updateFocusAreas,
  getServiceTypes,
  updateServiceTypes,
  getInquiryTopics,
  updateInquiryTopics,
} from "@/api/endpoints/configuration";
import { API_BASE_URL, getHeaders } from "@/api/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadedFile {
  id: string | number;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
}

interface Tag {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export function ConfigurationSettings() {
  const { toast } = useToast();

  // State for tag management
  const [focusAreaTags, setFocusAreaTags] = useState<string[]>([]);
  const [serviceTypeTags, setServiceTypeTags] = useState<string[]>([]);
  const [inquiryTopicTags, setInquiryTopicTags] = useState<string[]>([]);

  const [newFocusArea, setNewFocusArea] = useState("");
  const [newServiceType, setNewServiceType] = useState("");
  const [newInquiryTopic, setNewInquiryTopic] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Tag constraints
  const MIN_TAGS = 5;
  const MAX_TAGS = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [".pdf", ".doc", ".docx", ".txt", ".csv"];

  useEffect(() => {
    // Load data when component mounts
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load organization data and descriptions
      const descriptions = await getOrganizationDescriptions();
      setCompanyDescription(descriptions.companyDescription);
      setServiceCenterDescription(descriptions.serviceCenterDescription);
      setHipaaEnabled(descriptions.hipaaCompliant || false);
      setPciEnabled(descriptions.pciCompliant || false);
      setOrganizationId(descriptions.organizationId || "");

      // Load DMS integration
      const dmsIntegration = await getDMSIntegration();
      if (dmsIntegration && dmsIntegration.length > 0) {
        const integration = dmsIntegration[0]; // Get the first integration
        setDmsIntegrationId(integration.id);
        // Use optional chaining and check for config properties
        if (integration.config) {
          setServerUrl(integration.config.url || "");
          setAuthHeader(integration.config.auth_header || "");
          setApiKey(integration.config.api_key || "");
        }
        setTimeoutSeconds(integration.timeout_seconds || 20);
      }

      // Load knowledge files
      const knowledgeFiles = await getKnowledgeFiles();
      setUploadedFiles(
        knowledgeFiles.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: file.file_size,
          type: file.file_type,
          // Handle case where created_at might not exist
          uploadDate: file.created_at ? new Date(file.created_at) : new Date(),
        }))
      );

      // Load focus areas, service types, and inquiry topics
      await loadTagsAndSettings();
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load configuration data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTagsAndSettings = async () => {
    setLoadingTags(true);
    try {
      // Load focus areas
      const focusAreas = await getFocusAreas();
      setFocusAreaTags(focusAreas || []);

      // Load service types
      const serviceTypes = await getServiceTypes();
      setServiceTypeTags(serviceTypes || []);

      // Load inquiry topics
      const inquiryTopics = await getInquiryTopics();
      setInquiryTopicTags(inquiryTopics || []);
    } catch (error) {
      console.error("Error loading tags and settings:", error);
      toast({
        title: "Error Loading Settings",
        description: "Failed to load tags and settings.",
        variant: "destructive",
      });
    } finally {
      setLoadingTags(false);
    }
  };

  // Tag handlers for focus areas
  const handleAddFocusArea = async () => {
    if (!newFocusArea.trim()) return;

    // Validation
    if (focusAreaTags.length >= MAX_TAGS) {
      toast({
        title: "Maximum Limit Reached",
        description: `You can only have up to ${MAX_TAGS} focus areas.`,
        variant: "destructive",
      });
      return;
    }

    if (focusAreaTags.includes(newFocusArea.trim())) {
      toast({
        title: "Duplicate Entry",
        description: "This focus area already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedAreas = [...focusAreaTags, newFocusArea.trim()];
      await updateFocusAreas(updatedAreas);
      setFocusAreaTags(updatedAreas);
      setNewFocusArea("");

      toast({
        title: "Focus Area Added",
        description: "The focus area has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add focus area:", error);
      toast({
        title: "Error",
        description: "Failed to add focus area.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFocusArea = async (areaToDelete: string) => {
    // Validation
    if (focusAreaTags.length <= MIN_TAGS) {
      toast({
        title: "Minimum Required",
        description: `You need at least ${MIN_TAGS} focus areas.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedAreas = focusAreaTags.filter(
        (area) => area !== areaToDelete
      );
      await updateFocusAreas(updatedAreas);
      setFocusAreaTags(updatedAreas);

      toast({
        title: "Focus Area Deleted",
        description: "The focus area has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete focus area:", error);
      toast({
        title: "Error",
        description: "Failed to delete focus area.",
        variant: "destructive",
      });
    }
  };

  // Tag handlers for service types
  const handleAddServiceType = async () => {
    if (!newServiceType.trim()) return;

    // Validation
    if (serviceTypeTags.length >= MAX_TAGS) {
      toast({
        title: "Maximum Limit Reached",
        description: `You can only have up to ${MAX_TAGS} service types.`,
        variant: "destructive",
      });
      return;
    }

    if (serviceTypeTags.includes(newServiceType.trim())) {
      toast({
        title: "Duplicate Entry",
        description: "This service type already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTypes = [...serviceTypeTags, newServiceType.trim()];
      await updateServiceTypes(updatedTypes);
      setServiceTypeTags(updatedTypes);
      setNewServiceType("");

      toast({
        title: "Service Type Added",
        description: "The service type has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add service type:", error);
      toast({
        title: "Error",
        description: "Failed to add service type.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteServiceType = async (typeToDelete: string) => {
    // Validation
    if (serviceTypeTags.length <= MIN_TAGS) {
      toast({
        title: "Minimum Required",
        description: `You need at least ${MIN_TAGS} service types.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTypes = serviceTypeTags.filter(
        (type) => type !== typeToDelete
      );
      await updateServiceTypes(updatedTypes);
      setServiceTypeTags(updatedTypes);

      toast({
        title: "Service Type Deleted",
        description: "The service type has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete service type:", error);
      toast({
        title: "Error",
        description: "Failed to delete service type.",
        variant: "destructive",
      });
    }
  };

  // Tag handlers for inquiry topics
  const handleAddInquiryTopic = async () => {
    if (!newInquiryTopic.trim()) return;

    // Validation
    if (inquiryTopicTags.length >= MAX_TAGS) {
      toast({
        title: "Maximum Limit Reached",
        description: `You can only have up to ${MAX_TAGS} inquiry topics.`,
        variant: "destructive",
      });
      return;
    }

    if (inquiryTopicTags.includes(newInquiryTopic.trim())) {
      toast({
        title: "Duplicate Entry",
        description: "This inquiry topic already exists.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTopics = [...inquiryTopicTags, newInquiryTopic.trim()];
      await updateInquiryTopics(updatedTopics);
      setInquiryTopicTags(updatedTopics);
      setNewInquiryTopic("");

      toast({
        title: "Inquiry Topic Added",
        description: "The inquiry topic has been added successfully.",
      });
    } catch (error) {
      console.error("Failed to add inquiry topic:", error);
      toast({
        title: "Error",
        description: "Failed to add inquiry topic.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInquiryTopic = async (topicToDelete: string) => {
    // Validation
    if (inquiryTopicTags.length <= MIN_TAGS) {
      toast({
        title: "Minimum Required",
        description: `You need at least ${MIN_TAGS} inquiry topics.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedTopics = inquiryTopicTags.filter(
        (topic) => topic !== topicToDelete
      );
      await updateInquiryTopics(updatedTopics);
      setInquiryTopicTags(updatedTopics);

      toast({
        title: "Inquiry Topic Deleted",
        description: "The inquiry topic has been removed successfully.",
      });
    } catch (error) {
      console.error("Failed to delete inquiry topic:", error);
      toast({
        title: "Error",
        description: "Failed to delete inquiry topic.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    // Validation
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `The file size should be less than ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB.`,
        variant: "destructive",
      });
      return;
    }

    // Check file extension
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_FILE_TYPES.includes(fileExt)) {
      toast({
        title: "Invalid File Type",
        description: `Only ${ALLOWED_FILE_TYPES.join(", ")} files are allowed.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await uploadKnowledgeFile(file);

      setUploadedFiles([
        ...uploadedFiles,
        {
          id: response.id,
          name: response.name,
          size: response.file_size,
          type: response.file_type,
          uploadDate: new Date(response.created_at),
        },
      ]);

      toast({
        title: "File Uploaded",
        description: "The file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update the handleDeleteFile function to handle both string and number IDs
  const handleDeleteFile = async (fileId: string | number) => {
    try {
      // Convert fileId to number if it's a string
      const numericFileId =
        typeof fileId === "string" ? parseInt(fileId) : fileId;
      await deleteKnowledgeFile(numericFileId);

      setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId));

      toast({
        title: "File Deleted",
        description: "File has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      setIsLoading(true);

      // Update organization descriptions
      await updateOrganizationDescriptions(
        companyDescription,
        serviceCenterDescription
      );

      // Update organization data
      await updateOrganizationConfig({
        hipaa_compliant: hipaaEnabled,
        pci_compliant: pciEnabled,
      });

      // Update or create DMS integration
      const dmsData = {
        name: "Primary DMS Integration",
        type: "Generic",
        timeout_seconds: timeoutSeconds,
        config: {
          url: serverUrl,
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
            Define areas where your service center aims to excel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {focusAreaTags.map((area) => (
                <Badge
                  key={area}
                  variant="outline"
                  className="px-3 py-1.5 text-sm flex items-center gap-1"
                >
                  {area}
                  <button
                    type="button"
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    onClick={() => handleDeleteFocusArea(area)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Add new focus area"
                value={newFocusArea}
                onChange={(e) => setNewFocusArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddFocusArea()}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddFocusArea}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              Enter your service center's key focus areas. Add at least{" "}
              {MIN_TAGS} and up to {MAX_TAGS} areas.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Types</CardTitle>
          <CardDescription>
            Define types of services your center offers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {serviceTypeTags.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="px-3 py-1.5 text-sm flex items-center gap-1"
                >
                  {type}
                  <button
                    type="button"
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    onClick={() => handleDeleteServiceType(type)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Add new service type"
                value={newServiceType}
                onChange={(e) => setNewServiceType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddServiceType()}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddServiceType}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              Define the types of services your center offers. Add at least{" "}
              {MIN_TAGS} and up to {MAX_TAGS} service types.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry Topics</CardTitle>
          <CardDescription>
            Define topics for customer inquiries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {inquiryTopicTags.map((topic) => (
                <Badge
                  key={topic}
                  variant="outline"
                  className="px-3 py-1.5 text-sm flex items-center gap-1"
                >
                  {topic}
                  <button
                    type="button"
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    onClick={() => handleDeleteInquiryTopic(topic)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Add new inquiry topic"
                value={newInquiryTopic}
                onChange={(e) => setNewInquiryTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddInquiryTopic()}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddInquiryTopic}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              Define common customer inquiry topics. Add at least {MIN_TAGS} and
              up to {MAX_TAGS} topics.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
          <CardDescription>
            Upload files to help our AI better understand your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT, CSV (Max{" "}
                    {MAX_FILE_SIZE / (1024 * 1024)}
                    MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB •{" "}
                        {file.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded-full"
                    onClick={() => handleDeleteFile(file.id)}
                  >
                    <Trash className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              ))}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No files uploaded yet
                </div>
              )}
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
              Enter the URL to your DMS server endpoint. Lokam Space uses this to
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
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          Reset
        </Button>
        <Button onClick={handleSaveConfiguration} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
