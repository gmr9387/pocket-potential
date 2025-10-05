// Quiz matching algorithm to match user answers with program eligibility

export interface QuizAnswers {
  household: string;
  income: string;
  situation: string;
  children: string;
  housing: string;
  health: string;
  food: string;
  utilities: string;
  transportation: string;
  age: string;
  pregnant: string;
  veteran: string;
}

export interface Program {
  id: string;
  title: string;
  category: string;
  amount: string;
  timeline: string;
  description: string;
  eligibility_criteria: string[];
  requirements: string[];
  match_score?: number;
  is_active: boolean;
}

export const calculateMatchScore = (answers: QuizAnswers, program: Program): number => {
  let score = 0;
  const criteria = program.eligibility_criteria || [];
  
  // Convert criteria to lowercase for easier matching
  const criteriaText = criteria.join(' ').toLowerCase();
  
  // Income matching (high impact)
  if (answers.income === "Under $25,000") {
    if (criteriaText.includes('low-income') || criteriaText.includes('poverty') || 
        criteriaText.includes('income below')) score += 20;
  }
  if (answers.income === "$25,000 - $50,000") {
    if (criteriaText.includes('moderate-income') || criteriaText.includes('150%') || 
        criteriaText.includes('200% poverty')) score += 15;
  }
  
  // Household size matching
  const householdNum = answers.household === "5 or more" ? 5 : parseInt(answers.household) || 1;
  if (criteriaText.includes('family') && householdNum > 2) score += 10;
  if (criteriaText.includes('household') || criteriaText.includes('dependents')) score += 5;
  
  // Children matching (high impact)
  if (answers.children === "Yes") {
    if (criteriaText.includes('child') || criteriaText.includes('dependent') || 
        criteriaText.includes('family') || program.category === 'Childcare & Family' ||
        program.category === 'Education') score += 15;
  }
  
  // Employment situation matching
  if (answers.situation === "Unemployed") {
    if (criteriaText.includes('unemployed') || program.category === 'Employment & Business' ||
        criteriaText.includes('job training')) score += 20;
  }
  if (answers.situation === "Disabled") {
    if (program.category === 'Disability' || criteriaText.includes('disability') ||
        criteriaText.includes('disabled')) score += 25;
  }
  if (answers.situation === "Retired") {
    if (program.category === 'Seniors' || criteriaText.includes('senior') ||
        answers.age === "60+" && criteriaText.includes('age 60')) score += 20;
  }
  if (answers.situation === "Student") {
    if (program.category === 'Education' || criteriaText.includes('student') ||
        criteriaText.includes('education')) score += 15;
  }
  
  // Housing situation matching
  if (answers.housing === "Homeless") {
    if (program.category === 'Housing' || program.category === 'Emergency & Crisis' ||
        criteriaText.includes('homeless') || criteriaText.includes('shelter')) score += 25;
  }
  if (answers.housing === "Rent") {
    if (criteriaText.includes('rent') || criteriaText.includes('tenant') ||
        program.title.includes('Rental')) score += 10;
  }
  if (answers.housing === "Own home") {
    if (criteriaText.includes('homeowner') || criteriaText.includes('mortgage')) score += 10;
  }
  
  // Health insurance matching
  if (answers.health === "No" || answers.health === "Not sure") {
    if (program.category === 'Healthcare' || criteriaText.includes('medicaid') ||
        criteriaText.includes('health insurance') || criteriaText.includes('chip')) score += 20;
  }
  
  // Food security matching
  if (answers.food === "Often" || answers.food === "Sometimes") {
    if (program.category === 'Food' || criteriaText.includes('food') ||
        criteriaText.includes('snap') || criteriaText.includes('nutrition')) score += 20;
  }
  
  // Utilities matching
  if (answers.utilities === "Often" || answers.utilities === "Sometimes") {
    if (program.category === 'Utilities' || criteriaText.includes('utility') ||
        criteriaText.includes('heating') || criteriaText.includes('liheap')) score += 15;
  }
  
  // Transportation matching
  if (answers.transportation === "No reliable transportation" || 
      answers.transportation === "Depend on others") {
    if (program.category === 'Transportation' || criteriaText.includes('transit') ||
        criteriaText.includes('transportation')) score += 15;
  }
  
  // Age-based matching
  if (answers.age === "60+") {
    if (program.category === 'Seniors' || criteriaText.includes('senior') ||
        criteriaText.includes('age 60') || criteriaText.includes('age 65')) score += 20;
  }
  if (answers.age === "Under 25") {
    if (criteriaText.includes('youth') || criteriaText.includes('young adult') ||
        program.category === 'Education') score += 10;
  }
  
  // Pregnancy matching
  if (answers.pregnant === "Yes") {
    if (criteriaText.includes('pregnant') || criteriaText.includes('wic') ||
        criteriaText.includes('maternal') || criteriaText.includes('prenatal')) score += 20;
  }
  
  // Veteran matching (high impact)
  if (answers.veteran === "Yes") {
    if (program.category === 'Veterans' || criteriaText.includes('veteran') ||
        criteriaText.includes('military')) score += 25;
  }
  
  // Category-specific baseline scores
  const categoryBonus: Record<string, number> = {
    'Food': 5,
    'Healthcare': 5,
    'Housing': 5,
    'Utilities': 5,
  };
  
  if (categoryBonus[program.category]) {
    score += categoryBonus[program.category];
  }
  
  // Normalize score to 0-100 range
  return Math.min(Math.round(score), 100);
};

export const matchPrograms = (answers: QuizAnswers, programs: Program[]): Program[] => {
  // Calculate match scores for all programs
  const programsWithScores = programs.map(program => ({
    ...program,
    match_score: calculateMatchScore(answers, program)
  }));
  
  // Filter programs with match score >= 50 and sort by score
  return programsWithScores
    .filter(p => p.match_score >= 50)
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
};
