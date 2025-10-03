import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "Is FundFinder really free?",
    answer:
      "Yes, 100% free. Government assistance is your right, and FundFinder helps you access it without any fees or hidden costs. We're supported by community foundations and nonprofits.",
  },
  {
    question: "How do you determine which programs I qualify for?",
    answer:
      "Our matching system analyzes your quiz responses against the eligibility criteria of 160+ federal and state programs. We compare factors like household size, income, employment status, and specific needs to find programs you're eligible for.",
  },
  {
    question: "Do I need to apply to every program separately?",
    answer:
      "Yes, each program requires its own application. However, FundFinder makes this easier by storing your documents securely so you can reuse them across applications, and we guide you through each application step-by-step.",
  },
  {
    question: "How long does it take to get approved?",
    answer:
      "Approval times vary by program. Some benefits like SNAP can be processed in 30 days, while others like Section 8 housing may have waiting lists. We show you the timeline for each program on its detail page.",
  },
  {
    question: "Is my information secure?",
    answer:
      "Absolutely. We use bank-level encryption to protect your data. Your documents and personal information are stored securely, never sold, and only used to help you apply for benefits. You can delete your account and data at any time.",
  },
  {
    question: "What documents do I need?",
    answer:
      "Common documents include proof of identity (ID, birth certificate), proof of residence (utility bill, lease), income verification (pay stubs, tax returns), and Social Security numbers for your household. Each program lists its specific requirements.",
  },
  {
    question: "Can I use FundFinder if I'm not a U.S. citizen?",
    answer:
      "Many programs are available to legal residents and certain visa holders. FundFinder shows you which programs you're eligible for based on your immigration status.",
  },
  {
    question: "What if I'm denied?",
    answer:
      "If you're denied, we help you understand why and whether you can appeal. We also suggest alternative programs you might qualify for. Our partner legal aid organizations can provide additional support.",
  },
  {
    question: "Can I apply for multiple programs at once?",
    answer:
      "Yes! Many people qualify for several programs. FundFinder helps you manage multiple applications from one dashboard, tracking their status and next steps for each one.",
  },
  {
    question: "How often is program information updated?",
    answer:
      "We update program details monthly and monitor federal and state policy changes. If a program's requirements or benefits change, we notify affected users.",
  },
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
          <div className="container mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground animate-fade-in">
              Everything you need to know about using FundFinder to discover and apply for government assistance.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 shadow-soft hover:shadow-medium transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              We're here to help. Reach out to our support team or explore our help center.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="lg">
                Contact Support
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/how-it-works")}
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
