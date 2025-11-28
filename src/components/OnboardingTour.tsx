import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='quiz']",
    title: "Start with the Quiz",
    description: "Take our quick 2-minute quiz to find programs tailored to your needs.",
    position: "bottom",
  },
  {
    target: "[data-tour='programs']",
    title: "Browse Programs",
    description: "Explore all available government assistance programs and their benefits.",
    position: "bottom",
  },
  {
    target: "[data-tour='dashboard']",
    title: "Track Your Applications",
    description: "Monitor your application status and estimated benefits in your dashboard.",
    position: "bottom",
  },
  {
    target: "[data-tour='language']",
    title: "Language Support",
    description: "Switch between languages for a better experience.",
    position: "left",
  },
];

export const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, currentStep]);

  const updatePosition = () => {
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(step.target);
    
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (step.position) {
        case "bottom":
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2;
          break;
        case "top":
          top = rect.top - 20;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - 20;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + 20;
          break;
      }

      setPosition({ top, left });
    }
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenTour", "true");
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={handleClose} />
      
      {/* Tour Card */}
      <Card 
        className="fixed z-[60] w-80 p-6 shadow-large animate-scale-in"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(-50%, 0)",
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button variant="gradient" size="sm" onClick={handleNext}>
            {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </>
  );
};
