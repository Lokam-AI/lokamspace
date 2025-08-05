import { User, ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ClientDetails } from "@/types/apiConfig";
import { SERVICE_TYPES } from "@/constants/apiEndpoints";

interface ClientDetailsFormProps {
  clientDetails: ClientDetails;
  onUpdate: (updates: Partial<ClientDetails>) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const ClientDetailsForm = ({ clientDetails, onUpdate, expanded, onToggle }: ClientDetailsFormProps) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="space-y-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Client & Service Details</h3>
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
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              value={clientDetails.customerName}
              onChange={(e) => onUpdate({ customerName: e.target.value })}
              placeholder="Enter customer name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-phone">Customer Phone Number</Label>
            <Input
              id="customer-phone"
              value={clientDetails.customerPhone}
              onChange={(e) => onUpdate({ customerPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="service-advisor">Service Advisor Name</Label>
            <Input
              id="service-advisor"
              value={clientDetails.serviceAdvisorName}
              onChange={(e) => onUpdate({ serviceAdvisorName: e.target.value })}
              placeholder="Enter service advisor name"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="service-type">Service Type</Label>
            <Select 
              value={clientDetails.serviceType} 
              onValueChange={(value) => onUpdate({ serviceType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="last-service-comment">Last Service Comment</Label>
            <Textarea
              id="last-service-comment"
              value={clientDetails.lastServiceComment}
              onChange={(e) => onUpdate({ lastServiceComment: e.target.value })}
              placeholder="Enter details about the last service performed"
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="vehicle-info">Vehicle Information</Label>
            <Input
              id="vehicle-info"
              value={clientDetails.vehicleInfo}
              onChange={(e) => onUpdate({ vehicleInfo: e.target.value })}
              placeholder="e.g., 2020 Honda Civic"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="appointment-date">Appointment Date</Label>
            <Input
              id="appointment-date"
              type="datetime-local"
              value={clientDetails.appointmentDate}
              onChange={(e) => onUpdate({ appointmentDate: e.target.value })}
              className="mt-1"
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};