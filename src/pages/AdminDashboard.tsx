import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Users, FileText, TrendingUp, Plus, Pencil, Trash2, Shield, Upload } from "lucide-react";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";

interface Application {
  id: string;
  status: string;
  submitted_at: string | null;
  program_id: string;
  user_id: string;
}

interface SuccessStory {
  id: string;
  title: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: string;
  timeline: string;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  profiles?: UserProfile;
}

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "moderator" | "user">("user");
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (error || !data) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchData();
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: appsData } = await supabase
      .from("applications")
      .select("*")
      .order("submitted_at", { ascending: false });

    const { data: storiesData } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: programsData } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("*")
      .order("role", { ascending: true });

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name");

    if (appsData) setApplications(appsData);
    if (storiesData) setStories(storiesData);
    if (programsData) setPrograms(programsData);
    if (rolesData) {
      // Match profiles with roles
      const rolesWithProfiles = rolesData.map(role => ({
        ...role,
        profiles: profilesData?.find(p => p.id === role.user_id)
      }));
      setUserRoles(rolesWithProfiles);
    }
    if (profilesData) setProfiles(profilesData);
  };

  const updateApplicationStatus = async (
    id: string,
    status: "approved" | "denied" | "in_review"
  ) => {
    const { error } = await supabase
      .from("applications")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Application status updated",
      });
      fetchData();
    }
  };

  const approveStory = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("success_stories")
      .update({ is_approved: approved })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update story",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: approved ? "Story approved" : "Story rejected",
      });
      fetchData();
    }
  };

  const handleSaveProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const programData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      amount: formData.get("amount") as string,
      timeline: formData.get("timeline") as string,
      is_active: formData.get("is_active") === "true",
    };

    let error;
    if (editingProgram) {
      ({ error } = await supabase
        .from("programs")
        .update(programData)
        .eq("id", editingProgram.id));
    } else {
      ({ error } = await supabase
        .from("programs")
        .insert([programData]));
    }

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save program",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: editingProgram ? "Program updated" : "Program created",
      });
      setProgramDialogOpen(false);
      setEditingProgram(null);
      fetchData();
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete program",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Program deleted",
      });
      fetchData();
    }
  };

  const handleAssignRole = async () => {
    if (!newUserEmail) {
      toast({
        title: "Error",
        description: "Please enter an email",
        variant: "destructive",
      });
      return;
    }

    const profile = profiles.find(p => p.email === newUserEmail);
    if (!profile) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: profile.id, role: newUserRole }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") ? "User already has this role" : "Failed to assign role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setNewUserEmail("");
      setNewUserRole("user");
      fetchData();
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to remove this role?")) return;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove role",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Role removed",
      });
      fetchData();
    }
  };

  const handleBulkImport = async () => {
    if (!bulkImportFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      
      const programsToImport = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const program: any = {};
        headers.forEach((header, index) => {
          program[header] = values[index];
        });
        programsToImport.push({
          title: program.title || "",
          description: program.description || "",
          category: program.category || "",
          amount: program.amount || "",
          timeline: program.timeline || "",
          is_active: program.is_active === "true" || program.is_active === "1",
        });
      }

      const { error } = await supabase
        .from("programs")
        .insert(programsToImport);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to import programs",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Imported ${programsToImport.length} programs`,
        });
        setBulkImportFile(null);
        fetchData();
      }
    };
    reader.readAsText(bulkImportFile);
  };

  // Analytics data is now handled by AdvancedAnalytics component

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Stories</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stories.filter((s) => !s.is_approved).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{programs.filter(p => p.is_active).length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profiles.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="stories">Success Stories</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="users">User Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <AdvancedAnalytics
                applications={applications}
                programs={programs}
                profiles={profiles}
                stories={stories}
              />
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Application {app.id.slice(0, 8)}</CardTitle>
                      <Badge>{app.status}</Badge>
                    </div>
                    <CardDescription>
                      Submitted: {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Draft"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(app.id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(app.id, "denied")}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="stories" className="space-y-4">
              {stories.map((story) => (
                <Card key={story.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{story.title}</CardTitle>
                      <Badge variant={story.is_approved ? "default" : "secondary"}>
                        {story.is_approved ? "Approved" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 line-clamp-3">{story.content}</p>
                    {!story.is_approved && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveStory(story.id, true)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => approveStory(story.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="programs" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Programs</h2>
                <div className="flex gap-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                      className="max-w-xs"
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleBulkImport}
                      disabled={!bulkImportFile}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                  </div>
                  <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingProgram(null)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Program
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProgram ? "Edit Program" : "Add New Program"}</DialogTitle>
                      <DialogDescription>
                        {editingProgram ? "Update program details" : "Create a new benefit program"}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProgram} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          name="title"
                          defaultValue={editingProgram?.title}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          defaultValue={editingProgram?.description}
                          rows={4}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          defaultValue={editingProgram?.category}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          name="amount"
                          defaultValue={editingProgram?.amount}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="timeline">Timeline</Label>
                        <Input
                          id="timeline"
                          name="timeline"
                          defaultValue={editingProgram?.timeline}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="is_active">Status</Label>
                        <Select name="is_active" defaultValue={editingProgram?.is_active ? "true" : "false"}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">Save Program</Button>
                        <Button type="button" variant="outline" onClick={() => setProgramDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              </div>

              <div className="grid gap-4">
                {programs.map((program) => (
                  <Card key={program.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{program.title}</CardTitle>
                          <CardDescription>{program.category} • {program.amount}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={program.is_active ? "default" : "secondary"}>
                            {program.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingProgram(program);
                              setProgramDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProgram(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2">{program.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assign User Role</CardTitle>
                  <CardDescription>Grant admin or moderator access to users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="user-email">User Email</Label>
                      <Input
                        id="user-email"
                        placeholder="user@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="w-40">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAssignRole}>Assign Role</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userRoles.map((userRole) => (
                        <TableRow key={userRole.id}>
                          <TableCell>{userRole.profiles?.full_name || "N/A"}</TableCell>
                          <TableCell>{userRole.profiles?.email}</TableCell>
                          <TableCell>
                            <Badge variant={userRole.role === "admin" ? "default" : "secondary"}>
                              {userRole.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveRole(userRole.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
