import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgramCard from "@/components/ProgramCard";
import ProgramRecommendations from "@/components/ProgramRecommendations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProgramCardSkeleton } from "@/components/LoadingSkeleton";
import { trackPageView, trackEvent } from "@/lib/analytics";

interface Program {
  id: string;
  title: string;
  category: string;
  description: string;
  amount: string;
  timeline: string;
  match_score: number;
}

const categories = [
  { value: "all", label: "All Programs" },
  { value: "Food & Nutrition", label: "Food & Nutrition" },
  { value: "Family Support", label: "Family Support" },
  { value: "Housing & Utilities", label: "Housing & Utilities" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Tax Benefits", label: "Tax Benefits" },
];

const Programs = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [user, setUser] = useState<any>(null);
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    fetchPrograms();
    trackPageView('programs');
  }, []);

  const handleProgramView = (programId: string) => {
    trackEvent('program_viewed', { program_id: programId });
  };

  useEffect(() => {
    filterPrograms();
  }, [searchTerm, selectedCategory, programs]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("is_active", true)
        .order("match_score", { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      toast({
        title: "Error loading programs",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPrograms = () => {
    let filtered = programs;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {user && <ProgramRecommendations />}
        
        {/* Hero */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse All Programs
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore 160+ government assistance programs available to you
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search programs..."
                className="pl-12 h-14 text-lg shadow-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Filters & Programs */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* Category Filters */}
            <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="whitespace-nowrap"
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""}
            </p>

            {/* Program Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProgramCardSkeleton />
                <ProgramCardSkeleton />
                <ProgramCardSkeleton />
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-semibold mb-2">No programs found</p>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program, index) => (
                  <div
                    key={program.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => trackEvent('program_viewed', { program_id: program.id })}
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
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Programs;
