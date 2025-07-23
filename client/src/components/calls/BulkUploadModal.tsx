import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";
import { getCallsCSVTemplate, bulkUploadCalls } from "@/api/endpoints/calls";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onCampaignCreated: (campaignName: string) => void;
  onSuccess?: () => void;
}

export const BulkUploadModal = ({
  isOpen,
  onClose,
  campaigns,
  onCampaignCreated,
  onSuccess,
}: BulkUploadModalProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvSampleRow, setCsvSampleRow] = useState<string[]>([]);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<{
    successful_calls: number;
    failed_calls: number;
    errors: string[];
  } | null>(null);

  // Fetch CSV template headers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCsvTemplate();
    }
  }, [isOpen]);

  const fetchCsvTemplate = async () => {
    setIsLoadingTemplate(true);
    setError(null);
    try {
      const template = await getCallsCSVTemplate();
      setCsvHeaders(template.headers);
      setCsvSampleRow(template.sample_row);
    } catch (err) {
      console.error("Failed to fetch CSV template:", err);
      setError("Failed to load CSV template. Please try again.");
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx"))
    ) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template with the fields from our API
    const headerRow = csvHeaders.join(",");
    const sampleRow = csvSampleRow.join(",");
    const csvContent = `${headerRow}\n${sampleRow}`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback_calls_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "CSV template has been downloaded to your device",
    });
  };

  const parseCsvToJson = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          // Split by new line, handling different line endings
          const rows = text.split(/\r?\n/).filter((row) => row.trim());
          if (rows.length < 2) {
            throw new Error(
              "CSV file must have a header row and at least one data row"
            );
          }

          // Detect delimiter (comma or semicolon)
          const delimiter = rows[0].includes(";") ? ";" : ",";
          const headers = rows[0].split(delimiter).map((h) => h.trim());

          const jsonData = [];
          for (let i = 1; i < rows.length; i++) {
            if (!rows[i].trim()) continue; // Skip empty rows

            // Handle quoted values that might contain commas
            const values = [];
            let inQuotes = false;
            let currentValue = "";

            for (let j = 0; j < rows[i].length; j++) {
              const char = rows[i][j];

              if (char === '"' && (j === 0 || rows[i][j - 1] !== "\\")) {
                inQuotes = !inQuotes;
              } else if (char === delimiter && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = "";
              } else {
                currentValue += char;
              }
            }

            // Don't forget the last value
            values.push(currentValue.trim());

            // Make sure we have all columns
            while (values.length < headers.length) {
              values.push("");
            }

            // Create object from headers and values
            const entry: Record<string, string> = {};
            headers.forEach((header, index) => {
              // Remove quotes if present
              let value = values[index] || "";
              if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
              }
              entry[header] = value;
            });

            jsonData.push(entry);
          }

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !campaignName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide campaign name and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResults(null);

    try {
      // Parse CSV file to JSON
      const callsData = await parseCsvToJson(selectedFile);

      if (callsData.length === 0) {
        throw new Error("No valid records found in the CSV file");
      }

      // Upload calls to server
      const result = await bulkUploadCalls(campaignName, callsData);

      // Save the results
      setUploadResults({
        successful_calls: result.successful_calls,
        failed_calls: result.failed_calls,
        errors: result.errors || [],
      });

      // Create new campaign in UI
      onCampaignCreated(campaignName);

      toast({
        title: "Upload successful",
        description: `${
          result.successful_calls
        } calls added to "${campaignName}" campaign${
          result.failed_calls > 0
            ? `. ${result.failed_calls} calls failed to upload.`
            : ""
        }`,
      });

      if (onSuccess) onSuccess();

      if (result.failed_calls === 0) {
        handleClose();
      }
    } catch (err: any) {
      console.error("Failed to upload calls:", err);
      setError(
        err.message ||
          "Failed to upload calls. Please check your CSV file and try again."
      );

      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload calls. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCampaignName("");
    setIsUploading(false);
    setError(null);
    setUploadResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Feedback Calls Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Results with Errors */}
          {uploadResults && uploadResults.failed_calls > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <div className="space-y-2">
                <p className="font-medium text-yellow-800">
                  Upload completed with errors
                </p>
                <p className="text-sm text-yellow-700">
                  Successfully added {uploadResults.successful_calls} calls, but{" "}
                  {uploadResults.failed_calls} calls failed to upload.
                </p>
                {uploadResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">
                      Errors:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-yellow-700 mt-1">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Alert>
          )}

          {/* Campaign Name */}
          <div>
            <Label htmlFor="campaign-name">Campaign Name *</Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Enter campaign name"
              className="mt-2"
            />
          </div>

          {/* Upload CSV */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Upload CSV</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isLoadingTemplate || csvHeaders.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop a CSV file here or click to select file
              </p>
              <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="mt-4"
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="ml-2 h-auto p-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Template Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 mt-0.5">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  CSV Template
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Download the template to see the required format. Make sure
                  phone numbers are in the format: +1XXXXXXXXXX for US or
                  +91XXXXXXXXXX for India. The appointment date should be in
                  YYYY-MM-DD format.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !campaignName.trim() || isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
