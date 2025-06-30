
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search } from "lucide-react";

const members = [
  {
    email: "saleeq@lokam.ai",
    name: "",
    role: "Admin"
  },
  {
    email: "rameezh072@gmail.com",
    name: "",
    role: "Editor"
  },
  {
    email: "raoof@lokam.ai",
    name: "",
    role: "Admin"
  }
];

export function MembersSettings() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <Button className="bg-primary hover:bg-primary-hover">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input placeholder="Search members..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 py-3 border-b border-border font-medium text-sm text-foreground-secondary">
              <div className="col-span-5">Email</div>
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Role</div>
            </div>

            {members.map((member, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 py-3 items-center">
                <div className="col-span-5">
                  <span className="text-sm text-foreground">{member.email}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-foreground-secondary">{member.name || "-"}</span>
                </div>
                <div className="col-span-3">
                  <Select defaultValue={member.role.toLowerCase()}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
