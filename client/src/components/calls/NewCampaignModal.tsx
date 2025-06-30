
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaignName: string) => void;
}

export const NewCampaignModal = ({ isOpen, onClose, onCampaignCreated }: NewCampaignModalProps) => {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!campaignName.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please enter a campaign name",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    // Simulate campaign creation
    setTimeout(() => {
      toast({
        title: "Campaign created",
        description: `Campaign "${campaignName}" has been created successfully`,
      });
      
      onCampaignCreated(campaignName);
      handleClose();
      setIsCreating(false);
    }, 1000);
  };

  const handleClose = () => {
    setCampaignName("");
    setIsCreating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
