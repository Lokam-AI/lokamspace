
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types/campaign";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onCampaignCreated: (campaignName: string) => void;
}

export const BulkUploadModal = ({ isOpen, onClose, campaigns, onCampaignCreated }: BulkUploadModalProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or Excel file",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template with the fields from Ready For Call table
    const csvContent = `Customer Name,Vehicle,Service Advisor,Service Type,Phone Number,Call Details
John Doe,VH001,Sarah Johnson,Oil Change,+1 (555) 123-4567,Oil change reminder - Due in 3 days
Jane Smith,VH002,Mike Chen,Brake Inspection,+1 (555) 987-6543,Brake inspection follow-up
Robert Brown,VH003,Lisa Rodriguez,Warranty Service,+1 (555) 456-7890,Warranty reminder call`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_calls_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "CSV template has been downloaded to your device",
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !campaignName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide campaign name and select a file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const mockCallsAdded = Math.floor(Math.random() * 200) + 50;
      
      // Create new campaign
      onCampaignCreated(campaignName);
      
      toast({
        title: "Upload successful",
        description: `${mockCallsAdded} calls added to "${campaignName}" campaign`,
      });
      
      setIsUploading(false);
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setCampaignName("");
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Feedback Calls Campaign</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
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
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop a CSV file here or click to select file</p>
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
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">CSV Template</p>
                <p className="text-sm text-blue-700 mt-1">
                  Download the template to see the required format with columns: Customer Name, Vehicle, Service Advisor, Service Type, Phone Number, and Call Details.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
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
