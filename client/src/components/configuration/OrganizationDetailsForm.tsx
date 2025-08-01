import { Building, ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { OrganizationDetails } from "@/types/apiConfig";

interface OrganizationDetailsFormProps {
  organizationDetails: OrganizationDetails;
  onUpdate: (updates: Partial<OrganizationDetails>) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const OrganizationDetailsForm = ({ organizationDetails, onUpdate, expanded, onToggle }: OrganizationDetailsFormProps) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="space-y-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Organization Details</h3>
            </div>
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          <div>
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              value={organizationDetails.organizationName}
              onChange={(e) => onUpdate({ organizationName: e.target.value })}
              placeholder="Enter organization name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={organizationDetails.location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="Enter location"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="org-description">Organization Description</Label>
            <Textarea
              id="org-description"
              value={organizationDetails.organizationDescription}
              onChange={(e) => onUpdate({ organizationDescription: e.target.value })}
              placeholder="Enter organization description"
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="service-centre-description">Service Centre Description</Label>
            <Textarea
              id="service-centre-description"
              value={organizationDetails.serviceCentreDescription}
              onChange={(e) => onUpdate({ serviceCentreDescription: e.target.value })}
              placeholder="Enter service centre description"
              className="mt-1"
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="google-review-link">Google Review Link</Label>
            <Input
              id="google-review-link"
              value={organizationDetails.googleReviewLink}
              onChange={(e) => onUpdate({ googleReviewLink: e.target.value })}
              placeholder="https://g.page/your-business/review"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="areas-to-focus">Areas to Focus</Label>
            <Input
              id="areas-to-focus"
              value={organizationDetails.areasToFocus}
              onChange={(e) => onUpdate({ areasToFocus: e.target.value })}
              placeholder="e.g., Customer satisfaction, Service quality"
              className="mt-1"
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};