
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfileSettings() {
  const { toast } = useToast();
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  const handleUpdatePassword = () => {
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmEmail === "raoof@lokam.ai") {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invalid confirmation",
        description: "Please type your exact email address to confirm deletion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue="raoof@lokam.ai" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>

          <Button onClick={handleUpdatePassword} className="bg-primary hover:bg-primary-hover">
            Update New Password
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Permanently remove your account and all its contents. Upon deletion of your account, any 
            orgs without any members will be deleted immediately. Neither the account, nor the orgs will 
            be recoverable. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>To confirm, please type your email address: <strong>raoof@lokam.ai</strong></Label>
            <Input
              placeholder="Enter your email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={deleteConfirmEmail !== "raoof@lokam.ai"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
