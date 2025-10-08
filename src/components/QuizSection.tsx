import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const questions = [
  {
    id: "household",
    question: "How many people live in your household?",
    options: ["1", "2", "3-4", "5 or more"]
  },
  {
    id: "income",
    question: "What is your annual household income?",
    options: ["Under $25,000", "$25,000 - $50,000", "$50,000 - $75,000", "Over $75,000"]
  },
  {
    id: "situation",
    question: "Which best describes your current situation?",
    options: ["Working full-time", "Working part-time", "Unemployed", "Retired", "Disabled", "Student"]
  },
  {
    id: "children",
    question: "Do you have children under 18?",
    options: ["Yes", "No"]
  },
  {
    id: "housing",
    question: "What is your housing situation?",
    options: ["Own home", "Rent", "Living with family/friends", "Homeless"]
  },
  {
    id: "health",
    question: "Do you have health insurance?",
    options: ["Yes, through employer", "Yes, through government program", "No", "Not sure"]
  },
  {
    id: "food",
    question: "In the past month, did you ever worry about running out of food?",
    options: ["Often", "Sometimes", "Rarely", "Never"]
  },
  {
    id: "utilities",
    question: "Do you have difficulty paying utility bills?",
    options: ["Often", "Sometimes", "Rarely", "Never"]
  },
  {
    id: "transportation",
    question: "Do you have reliable transportation?",
    options: ["Own vehicle", "Public transit", "Depend on others", "No reliable transportation"]
  },
  {
    id: "age",
    question: "What is your age range?",
    options: ["Under 25", "25-40", "41-59", "60+"]
  },
  {
    id: "pregnant",
    question: "Are you or a household member pregnant?",
    options: ["Yes", "No"]
  },
  {
    id: "veteran",
    question: "Are you or anyone in your household a veteran?",
    options: ["Yes", "No"]
  }
];

const QuizSection = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    trackEvent('quiz_started');
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      trackEvent('quiz_completed');
      // Save to localStorage and navigate to results
      localStorage.setItem("quizAnswers", JSON.stringify(answers));
      navigate("/results");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  return (
    <section id="quiz-section" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Find your benefits in{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              2 minutes
            </span>
          </h2>
          <p className="text-muted-foreground">
            Answer a few simple questions to discover programs designed for you
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <Card className="p-8 shadow-medium animate-scale-in">
          <h3 className="text-2xl font-bold mb-6">{currentQ.question}</h3>
          
          <RadioGroup 
            value={answers[currentQ.id] || ""}
            onValueChange={(value) => setAnswers({ ...answers, [currentQ.id]: value })}
            className="space-y-3"
          >
            {currentQ.options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <RadioGroupItem value={option} id={option} />
                <Label 
                  htmlFor={option} 
                  className="flex-grow cursor-pointer font-medium"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex gap-3 mt-8">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                size="lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              size="lg"
              className="flex-grow"
              variant="gradient"
            >
              {currentQuestion === questions.length - 1 ? "See my results" : "Next question"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>🔒 Your information is secure and confidential</p>
        </div>
      </div>
    </section>
  );
};

export default QuizSection;
