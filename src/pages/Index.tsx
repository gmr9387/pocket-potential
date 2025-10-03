import Hero from "@/components/Hero";
import QuizSection from "@/components/QuizSection";
import ProgramsSection from "@/components/ProgramsSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <Hero />
        <QuizSection />
        <ProgramsSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
