
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const usageData = [
  { date: "2025-06-01", minutes: 0 },
  { date: "2025-06-05", minutes: 5 },
  { date: "2025-06-09", minutes: 12 },
  { date: "2025-06-13", minutes: 8 },
  { date: "2025-06-17", minutes: 15 },
  { date: "2025-06-21", minutes: 20 },
  { date: "2025-06-25", minutes: 18 },
  { date: "2025-06-29", minutes: 22 },
];

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
          <CardTitle className="text-foreground">Minutes</CardTitle>
          <CardDescription>The total number of Vapi minutes used</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <h3 className="text-2xl font-bold text-foreground">137.206 Mins</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Daily</Button>
                <Button variant="outline" size="sm">Weekly</Button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Bar dataKey="minutes" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Plans</CardTitle>
          <CardDescription>
            Select a plan for your organization. Bundled minutes include the cost of every provider used during a call (LLM, TTS, STT, etc.). 
            Overage cost applies when you exceed your monthly bundled minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-primary bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Ad-hoc Infra</CardTitle>
                <div className="text-2xl font-bold text-foreground">Pay as you go</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes overage cost:</span>
                  <span className="text-foreground">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Concurrency included:</span>
                  <span className="text-foreground">10</span>
                </div>
                <Badge className="w-full justify-center bg-primary/10 text-primary hover:bg-primary/20">
                  Current Plan
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Agency</CardTitle>
                <div className="text-2xl font-bold text-foreground">$500 <span className="text-sm font-normal">/ month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes:</span>
                  <span className="text-foreground">3,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes overage cost:</span>
                  <span className="text-foreground">$0.18/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Concurrency included:</span>
                  <span className="text-foreground">50</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Upgrade
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Startup</CardTitle>
                <div className="text-2xl font-bold text-foreground">$1,000 <span className="text-sm font-normal">/ month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes:</span>
                  <span className="text-foreground">7,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes overage cost:</span>
                  <span className="text-foreground">$0.16/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Concurrency included:</span>
                  <span className="text-foreground">100</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Upgrade
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Growth</CardTitle>
                <div className="text-2xl font-bold text-foreground">$5,000 <span className="text-sm font-normal">/ month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes:</span>
                  <span className="text-foreground">40,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Bundled minutes overage cost:</span>
                  <span className="text-foreground">$0.14/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Concurrency included:</span>
                  <span className="text-foreground">500</span>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
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
                <span className="font-medium text-foreground">When</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-foreground">$10.00</span>
              <Badge className="bg-primary/10 text-primary">Finalized</Badge>
              <span className="text-sm text-foreground-secondary">June 25th 2025: 9:24 PM</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
