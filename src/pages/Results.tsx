import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { matchPrograms, QuizAnswers, Program } from "@/lib/quizMatcher";
import { ArrowRight, TrendingUp, Loader2, Save } from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const answers = localStorage.getItem("quizAnswers");
    if (!answers) {
      navigate("/");
      return;
    }
    
    checkUser();
    fetchMatchedPrograms(JSON.parse(answers));
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchMatchedPrograms = async (quizAnswers: QuizAnswers) => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      // Transform data to match Program interface
      const transformedData: Program[] = (data || []).map(p => ({
        ...p,
        eligibility_criteria: Array.isArray(p.eligibility_criteria) 
          ? p.eligibility_criteria as string[]
          : [],
        requirements: Array.isArray(p.requirements)
          ? p.requirements as string[]
          : []
      }));

      const matchedPrograms = matchPrograms(quizAnswers, transformedData);
      
      setPrograms(matchedPrograms);

      const estimatedValue = matchedPrograms.reduce((sum, program) => {
        const amountStr = program.amount.replace(/[^0-9,-]/g, '');
        const amounts = amountStr.split('-').map(a => parseInt(a.replace(/,/g, '')));
        const avgAmount = amounts.length > 1 
          ? (amounts[0] + amounts[1]) / 2 
          : amounts[0] || 0;
        return sum + avgAmount;
      }, 0);

      setTotalValue(Math.round(estimatedValue));
    } catch (error: any) {
      toast({
        title: "Error loading programs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      <main className="flex-grow py-12 px-4 bg-muted/20">
        {loading ? (
          <div className="container mx-auto max-w-6xl flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Finding your matches...</p>
            </div>
          </div>
        ) : (
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">{programs.length} programs matched</span>
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

            <h2 className="text-2xl font-bold mb-8 text-center mt-16">
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
                    programId={program.id}
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

            {/* Next Steps */}
            <div className="mt-16 py-16 px-8 bg-muted/30 rounded-3xl">
              <h2 className="text-3xl font-bold mb-6 text-center">What's Next?</h2>
              <div className="grid md:grid-cols-3 gap-6">
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
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Results;
