import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Heart } from "lucide-react";
import heroImage1024 from "@/assets/hero-families-compressed.webp";
import heroImage768 from "@/assets/hero-families-768w.webp";
import heroImage512 from "@/assets/hero-families-512w.webp";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary/5 via-secondary/5 to-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slide-up">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full border border-secondary/20">
              <Heart className="w-4 h-4 fill-secondary" />
              <span className="text-sm font-medium">Trusted by 12,483 families this month</span>
            </div>

            {/* Main headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Billions in aid go{" "}
                <span className="text-gradient-primary">
                  unclaimed
                </span>
                .
              </h1>
              <p className="text-2xl lg:text-3xl font-semibold text-foreground/80">
                Let's find what's yours.
              </p>
            </div>

            {/* Value proposition */}
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Every household deserves the support that exists for them. FundFinder makes 
              discovering and claiming government assistance simple, dignified, and fast.
            </p>

            {/* Benefits list */}
            <div className="space-y-3">
              {[
                "Free personalized matching in under 2 minutes",
                "146+ federal and state programs",
                "Secure document storage and tracking"
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="xl" 
                variant="gradient" 
                className="group"
                onClick={() => {
                  const quizSection = document.getElementById('quiz-section');
                  quizSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Start finding benefits
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                onClick={() => window.location.href = '/how-it-works'}
              >
                See how it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">Supported by</p>
              <div className="flex gap-6 items-center opacity-60">
                <div className="font-semibold text-sm">Detroit Community Foundation</div>
                <div className="w-px h-4 bg-border" />
                <div className="font-semibold text-sm">Legal Aid Society</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative lg:block hidden animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-large">
              <img 
                src={heroImage1024} 
                srcSet={`${heroImage512} 512w, ${heroImage768} 768w, ${heroImage1024} 1024w`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                alt="Happy families discovering their benefits"
                className="w-full h-auto object-cover"
                fetchPriority="high"
                decoding="async"
              />
              {/* Floating stat card */}
              <div className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-large border border-border/50 animate-fade-in-up">
                <div className="text-4xl font-bold text-gradient-primary">
                  $8,400
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Average benefits discovered
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
