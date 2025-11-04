import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { trackPageView } from "@/lib/analytics";
import { exportApplicationsToPDF, exportSingleApplicationToPDF } from "@/lib/pdfExport";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Download,
} from "lucide-react";

interface Application {
  id: string;
  status: string;
  created_at: string;
  programs: {
    title: string;
    amount: string;
    category: string;
  };
}

const statusConfig = {
  draft: { label: "Draft", icon: FileText, color: "text-muted-foreground" },
  submitted: { label: "Submitted", icon: Clock, color: "text-primary" },
  in_review: { label: "In Review", icon: AlertCircle, color: "text-secondary" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-green-600" },
  denied: { label: "Denied", icon: AlertCircle, color: "text-destructive" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    estimatedValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    trackPageView('dashboard');
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchApplications(session.user.id);
  };

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          programs (
            title,
            amount,
            category
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const pending = data?.filter(a => ["submitted", "in_review"].includes(a.status)).length || 0;
      const approved = data?.filter(a => a.status === "approved").length || 0;
      
      setStats({
        total,
        pending,
        approved,
        estimatedValue: 8400, // This would be calculated from approved applications
      });
    } catch (error) {
      toast({
        title: "Error loading applications",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressValue = () => {
    if (stats.total === 0) return 0;
    return (stats.approved / stats.total) * 100;
  };

  const handleExportAll = () => {
    const userName = user?.user_metadata?.full_name || 'User';
    exportApplicationsToPDF(applications, userName);
    toast({
      title: "PDF Downloaded",
      description: "Your applications have been exported successfully.",
    });
  };

  const handleExportSingle = (application: Application) => {
    const userName = user?.user_metadata?.full_name || 'User';
    const userEmail = user?.email || '';
    exportSingleApplicationToPDF(application, userName, userEmail);
    toast({
      title: "PDF Downloaded",
      description: "Application exported successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name || "there"}!
            </h1>
            <p className="text-muted-foreground">
              Track your benefit applications and discover new opportunities
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${stats.estimatedValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Est. Annual Value</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Progress Ring */}
          {stats.total > 0 && (
            <Card className="p-6 mb-8 shadow-soft">
              <h3 className="font-semibold mb-4">Application Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats.approved} of {stats.total} approved</span>
                  <span>{Math.round(getProgressValue())}%</span>
                </div>
                <Progress value={getProgressValue()} className="h-3" />
              </div>
            </Card>
          )}

          {/* Applications List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-2xl font-bold">Your Applications</h2>
              <div className="flex gap-2">
                {applications.length > 0 && (
                  <Button variant="outline" onClick={handleExportAll}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All as PDF
                  </Button>
                )}
                <Button variant="gradient" onClick={() => navigate("/programs")}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </div>
            </div>

            {loading ? (
              <DashboardSkeleton />
            ) : applications.length === 0 ? (
              <Card className="p-12 text-center shadow-soft">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by taking our quiz or browsing available programs
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="gradient" onClick={() => navigate("/")}>
                    Take Quiz
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/programs")}>
                    Browse Programs
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const config = statusConfig[app.status as keyof typeof statusConfig];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={app.id} className="p-6 shadow-soft hover:shadow-medium transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {app.programs?.title || "Program"}
                            </h3>
                            <span className={`inline-flex items-center gap-1 text-sm ${config.color}`}>
                              <Icon className="w-4 h-4" />
                              {config.label}
                            </span>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{app.programs?.category}</span>
                            <span>•</span>
                            <span>{app.programs?.amount}</span>
                            <span>•</span>
                            <span>
                              Applied {new Date(app.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExportSingle(app)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                          <Button variant="ghost">View Details</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
