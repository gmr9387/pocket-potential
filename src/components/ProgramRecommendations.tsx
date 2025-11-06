import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProgramCard from './ProgramCard';
import { Card } from './ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface Program {
  id: string;
  title: string;
  category: string;
  description: string;
  amount: string;
  timeline: string;
  match_score: number;
}

const ProgramRecommendations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('get-recommendations', {
        body: { profile },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      toast({
        title: 'Error loading recommendations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <p className="text-muted-foreground">Getting personalized recommendations...</p>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {t('programs.recommendations')}
              </h2>
              <p className="text-muted-foreground">
                {t('programs.recommendationsDesc')}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={fetchRecommendations}>
            Refresh
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.slice(0, 6).map((program) => (
            <ProgramCard
              key={program.id}
              title={program.title}
              category={program.category}
              amount={program.amount}
              timeline={program.timeline}
              description={program.description}
              matchScore={program.match_score}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramRecommendations;
