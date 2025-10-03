import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Save } from "lucide-react";
import ProgramCard from "@/components/ProgramCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const answers = localStorage.getItem("quizAnswers");
    if (!answers) {
      navigate("/");
      return;
    }

    fetchMatchedPrograms();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchMatchedPrograms = async () => {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .eq("is_active", true)
      .gte("match_score", 85)
      .order("match_score", { ascending: false })
      .limit(7);

    if (!error && data) {
      setPrograms(data);
      // Rough estimate calculation
      const estimate = data.reduce((sum, p) => {
        const match = p.amount.match(/\$([0-9,]+)/);
        if (match) {
          const amount = parseInt(match[1].replace(/,/g, ""));
          return sum + (amount * 12); // Annualize monthly amounts
        }
        return sum + 1000; // Default estimate
      }, 0);
      setTotalValue(Math.round(estimate / 1000) * 1000);
    }
  };

  const handleSaveResults = async () => {
    if (!user) {
      navigate("/auth?signup=true");
      return;
    }

    setSaving(true);
    try {
      const answers = JSON.parse(localStorage.getItem("quizAnswers") || "{}");
      const { error } = await supabase.from("quiz_responses").insert({
        user_id: user.id,
        responses: answers,
        matched_programs: programs.map(p => p.id),
        estimated_value: totalValue,
      });

      if (error) throw error;

      toast({
        title: "Results saved!",
        description: "You can view your matches anytime from your dashboard.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error saving results",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Results Header */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center animate-scale-in">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Analysis complete!</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              You may qualify for{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                {programs.length} programs
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Total estimated value:{" "}
              <span className="text-3xl font-bold text-foreground">
                ${totalValue.toLocaleString()}/year
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                variant="gradient"
                onClick={handleSaveResults}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-5 h-5" />
                {user ? "Save to Dashboard" : "Sign up to save results"}
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate("/programs")}
              >
                Browse All Programs
              </Button>
            </div>
          </div>
        </section>

        {/* Matched Programs */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Your Program Matches
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {programs.map((program, index) => (
                <div
                  key={program.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProgramCard
                    title={program.title}
                    category={program.category}
                    amount={program.amount}
                    timeline={program.timeline}
                    description={program.description}
                    matchScore={program.match_score}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">What's Next?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold mb-2">Create Your Account</h3>
                <p className="text-sm text-muted-foreground">
                  Save your results and track applications in one dashboard.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="font-bold mb-2">Gather Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Upload required documents to our secure vault for easy reuse.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl shadow-soft border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-accent-foreground">3</span>
                </div>
                <h3 className="font-bold mb-2">Start Applying</h3>
                <p className="text-sm text-muted-foreground">
                  Apply to programs with step-by-step guidance and track progress.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
