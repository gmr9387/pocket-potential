import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Users, FileText, TrendingUp } from "lucide-react";

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

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
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

    if (appsData) setApplications(appsData);
    if (storiesData) setStories(storiesData);
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

          <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="applications" className="space-y-6">
            <TabsList>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="stories">Success Stories</TabsTrigger>
            </TabsList>

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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
