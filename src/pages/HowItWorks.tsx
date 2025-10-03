import { Check, FileText, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const steps = [
  {
    icon: Search,
    title: "Answer Simple Questions",
    description:
      "Tell us about your household in a quick 2-minute quiz. We ask about your family size, income, employment, and needs.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Check,
    title: "Get Matched Instantly",
    description:
      "Our system analyzes 160+ programs and shows you exactly which benefits you qualify for, with estimated dollar amounts.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: FileText,
    title: "Apply with Confidence",
    description:
      "We guide you through each application step-by-step. Upload documents once and reuse them across multiple programs.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Send,
    title: "Track Your Progress",
    description:
      "Monitor all your applications in one dashboard. Get notified when action is needed and celebrate when you're approved!",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              How FundFinder Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Four simple steps to discover and claim the government assistance designed for you.
              No confusion, no complexity—just support.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-8 items-start animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center shadow-medium`}
                      >
                        <step.icon className={`w-10 h-10 ${step.color}`} />
                      </div>
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-soft">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to discover your benefits?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 12,483 families who've already found support through FundFinder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                variant="gradient"
                onClick={() => navigate("/")}
              >
                Start Your Quiz
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => navigate("/programs")}
              >
                Browse Programs
              </Button>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Why Trust FundFinder?
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    title: "100% Free",
                    description: "No fees, no hidden costs. Government benefits are your right.",
                  },
                  {
                    title: "Secure & Private",
                    description: "Your data is encrypted and never sold. We protect your privacy.",
                  },
                  {
                    title: "Expert Guidance",
                    description: "Partnered with legal aid organizations to ensure accuracy.",
                  },
                  {
                    title: "Community Supported",
                    description: "Backed by foundations dedicated to helping your community.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
