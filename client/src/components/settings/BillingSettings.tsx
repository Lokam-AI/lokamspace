
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function BillingSettings() {
  const { toast } = useToast();

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
            <span className="text-2xl font-bold text-primary">5.71</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-3">
            <Button className="bg-primary hover:bg-primary/90">Buy More Credits</Button>
            <Button variant="outline">Apply Coupon</Button>
          </div>
        </CardContent>
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
