
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getOrganizationSettings } from "@/api/endpoints/organizations";
import { Loader2 } from "lucide-react";

export function BillingSettings() {
  const { toast } = useToast();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoading(true);
        const orgData = await getOrganizationSettings();
        setCreditBalance(orgData.credit_balance);
      } catch (error) {
        console.error("Failed to fetch organization data:", error);
        toast({
          title: "Error",
          description: "Failed to load credit balance. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, [toast]);

  const handleSaveConfiguration = () => {
    toast({
      title: "Configuration Saved",
      description: "Billing settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
      </div>

      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Current plan
        </Badge>
        <span className="font-semibold text-foreground">Ad-hoc Infra</span>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground">
            Credit Balance:
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-primary">
                ${creditBalance !== null ? creditBalance.toFixed(2) : '0.00'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Payment Method</CardTitle>
          <CardDescription>Enter your card details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Billing Email</Label>
            <Input defaultValue="raoof@lokam.ai" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Payment Method</Label>
            <Input placeholder="•••• •••• •••• ••••" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Expiry Date</Label>
              <Input placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">CVV</Label>
              <Input placeholder="123" maxLength={4} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Enable Auto Reload</Label>
            </div>
            <Switch />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Amount to reload</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">$</span>
                <Input defaultValue="10" className="pl-8" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">When threshold reaches</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary">$</span>
                <Input defaultValue="10" className="pl-8" />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveConfiguration}>Save Configuration</Button>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-foreground">Amount</span>
                <span className="font-medium text-foreground">Status</span>
                <span className="font-medium text-foreground">Date</span>
              </div>
            </div>
            <div className="text-center py-8 text-muted-foreground">
              No payment history available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
