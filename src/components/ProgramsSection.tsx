import ProgramCard from "./ProgramCard";

const samplePrograms = [
  {
    title: "Supplemental Nutrition Assistance (SNAP)",
    category: "Food & Nutrition",
    amount: "Up to $939/month",
    timeline: "Benefits in 30 days",
    description: "Help buying nutritious food for you and your family. SNAP provides monthly benefits to purchase groceries at authorized retailers.",
    matchScore: 98
  },
  {
    title: "Childcare Assistance Program",
    category: "Family Support",
    amount: "Up to $1,200/month",
    timeline: "Benefits in 45 days",
    description: "Financial help for childcare costs while you work or attend school. Covers daycare, after-school programs, and summer care.",
    matchScore: 95
  },
  {
    title: "Low Income Home Energy Assistance (LIHEAP)",
    category: "Housing & Utilities",
    amount: "Up to $800/year",
    timeline: "Seasonal application",
    description: "Assistance with heating and cooling costs. Helps keep your home safe and comfortable year-round with utility bill support.",
    matchScore: 92
  },
  {
    title: "Medicaid Health Coverage",
    category: "Healthcare",
    amount: "Full coverage",
    timeline: "Coverage in 30 days",
    description: "Comprehensive health insurance including doctor visits, hospital care, prescriptions, and preventive services at little to no cost.",
    matchScore: 96
  },
  {
    title: "Earned Income Tax Credit (EITC)",
    category: "Tax Benefits",
    amount: "Up to $6,935/year",
    timeline: "Annual tax filing",
    description: "Federal tax credit for working individuals and families. Get money back when you file your taxes, even if you don't owe anything.",
    matchScore: 94
  },
  {
    title: "Section 8 Housing Voucher",
    category: "Housing & Utilities",
    amount: "Varies by rent",
    timeline: "Waitlist varies",
    description: "Rental assistance to help you afford safe, decent housing. Covers a portion of your monthly rent based on your income.",
    matchScore: 88
  }
];

const ProgramsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Programs designed for{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              people like you
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse popular programs or take our quick quiz to get personalized matches
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samplePrograms.map((program, index) => (
            <div 
              key={program.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProgramCard {...program} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
