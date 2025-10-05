import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, DollarSign, Calendar, CheckCircle } from "lucide-react";
import ApplicationForm from "@/components/ApplicationForm";

interface ProgramCardProps {
  title: string;
  category: string;
  amount: string;
  timeline: string;
  description: string;
  matchScore?: number;
  programId?: string;
}

const ProgramCard = ({ 
  title, 
  category, 
  amount, 
  timeline, 
  description,
  matchScore = 95,
  programId
}: ProgramCardProps) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  return (
    <>
      <Card className="group relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-large bg-card">
      {/* Match score badge */}
      {matchScore >= 90 && (
        <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {matchScore}% Match
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Category tag */}
        <div className="inline-block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Amount and timeline */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4 text-secondary" />
            <span className="font-semibold text-foreground">{amount}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{timeline}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed line-clamp-3">
          {description}
        </p>

        {/* CTA Button */}
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
          onClick={() => setShowApplicationForm(true)}
        >
          Learn more & apply
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Decorative gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>

      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Form</DialogTitle>
          </DialogHeader>
          {programId && (
            <ApplicationForm
              programId={programId}
              programTitle={title}
              onSuccess={() => setShowApplicationForm(false)}
              onCancel={() => setShowApplicationForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProgramCard;
