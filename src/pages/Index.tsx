import Hero from "@/components/Hero";
import QuizSection from "@/components/QuizSection";
import ProgramsSection from "@/components/ProgramsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <QuizSection />
      <ProgramsSection />
    </div>
  );
};

export default Index;
