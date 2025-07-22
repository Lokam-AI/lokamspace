import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  UserCreate,
} from "@/api/endpoints/users";
import { useAuth } from "@/contexts/AuthContext";

export function MembersSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState<{
    name: string;
    email: string;
    role: string;
    password: string;
  }>({
    name: "",
    email: "",
    role: "viewer",
    password: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const fetchedMembers = await getUsers();
      setMembers(fetchedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.email || !newMember.name || !newMember.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.organization_id) {
      toast({
        title: "Error",
        description: "Organization information is missing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData: UserCreate = {
        name: newMember.name,
        email: newMember.email,
        password: newMember.password,
        role: newMember.role,
        organization_id: user.organization_id,
      };

      await createUser(userData);

      toast({
        title: "Success",
        description: "Member added successfully.",
      });

      setIsAddModalOpen(false);
      setNewMember({
        name: "",
        email: "",
        role: "viewer",
        password: "",
      });

      fetchMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole });

      setMembers(
        members.map((member) =>
          member.id === userId ? { ...member, role: newRole } : member
        )
      );

      toast({
        title: "Success",
        description: "Member role updated successfully.",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMember = async (userId: number) => {
    try {
      await deleteUser(userId);

      setMembers(members.filter((member) => member.id !== userId));

      toast({
        title: "Success",
        description: "Member removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMembers = members.filter(
    (member) =>
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert user ID to number for comparison
  const currentUserId = user?.id ? Number(user.id) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Members</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-hover">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>
                Add a new member to your organization. They will receive an
                email invitation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newMember.password}
                  onChange={(e) =>
                    setNewMember({ ...newMember, password: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value) =>
                    setNewMember({ ...newMember, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                placeholder="Search members..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-foreground-secondary">
              Loading members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-foreground-secondary">
              {searchTerm
                ? "No members match your search."
                : "No members found."}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 py-3 border-b border-border font-medium text-sm text-foreground-secondary">
                <div className="col-span-4">Email</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="grid grid-cols-12 gap-4 py-3 items-center"
                >
                  <div className="col-span-4">
                    <span className="text-sm text-foreground">
                      {member.email}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-foreground-secondary">
                      {member.name || "-"}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <Select
                      defaultValue={member.role.toLowerCase()}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value)
                      }
                      disabled={
                        currentUserId !== null && member.id === currentUserId
                      }
                    >
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
                  <div className="col-span-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={
                        currentUserId !== null && member.id === currentUserId
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
