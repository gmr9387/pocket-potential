import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Bootstrap = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBootstrap = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please sign in first before bootstrapping admin access.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Call the bootstrap function
      const { data, error } = await supabase.rpc('bootstrap_admin');

      if (error) {
        throw error;
      }

      if (data) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: "You are now an admin. Redirecting to dashboard...",
        });
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        toast({
          title: "Bootstrap Unavailable",
          description: "An admin already exists in the system.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Bootstrap error:", error);
      toast({
        title: "Bootstrap Failed",
        description: error.message || "An error occurred during bootstrap.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Admin Bootstrap</h1>
        
        <p className="text-muted-foreground mb-6">
          This page allows you to become the first admin of the system. This can only be done once when no admins exist.
        </p>

        {success ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-success" />
            <p className="text-success">Admin access granted!</p>
          </div>
        ) : (
          <Button
            onClick={handleBootstrap}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Processing..." : "Become Admin"}
          </Button>
        )}

        <div className="mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Bootstrap;
