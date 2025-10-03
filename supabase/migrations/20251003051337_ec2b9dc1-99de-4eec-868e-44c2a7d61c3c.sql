-- Create enum for application status
CREATE TYPE public.application_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'approved',
  'denied',
  'expired'
);

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  timeline TEXT NOT NULL,
  eligibility_criteria JSONB DEFAULT '[]'::JSONB,
  requirements JSONB DEFAULT '[]'::JSONB,
  match_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create quiz_responses table
CREATE TABLE public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::JSONB,
  matched_programs JSONB DEFAULT '[]'::JSONB,
  estimated_value INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  application_data JSONB DEFAULT '{}'::JSONB,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  document_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Programs policies (public read)
CREATE POLICY "Anyone can view active programs"
  ON public.programs FOR SELECT
  USING (is_active = TRUE);

-- Quiz responses policies
CREATE POLICY "Users can view their own quiz responses"
  ON public.quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz responses"
  ON public.quiz_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_responses_updated_at
  BEFORE UPDATE ON public.quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample programs
INSERT INTO public.programs (title, category, description, amount, timeline, eligibility_criteria, requirements, match_score) VALUES
('Supplemental Nutrition Assistance (SNAP)', 'Food & Nutrition', 'Help buying nutritious food for you and your family. SNAP provides monthly benefits to purchase groceries at authorized retailers.', 'Up to $939/month', 'Benefits in 30 days', 
  '["Household income below 130% of poverty level", "US citizen or legal resident", "Work requirements for able-bodied adults"]'::JSONB,
  '["Proof of identity", "Proof of residence", "Income verification", "Social Security numbers for household"]'::JSONB, 98),

('Childcare Assistance Program', 'Family Support', 'Financial help for childcare costs while you work or attend school. Covers daycare, after-school programs, and summer care.', 'Up to $1,200/month', 'Benefits in 45 days',
  '["Working or attending school", "Income at or below 85% state median", "Children under 13 years old"]'::JSONB,
  '["Employment verification", "School enrollment proof", "Child birth certificates", "Income documentation"]'::JSONB, 95),

('Low Income Home Energy Assistance (LIHEAP)', 'Housing & Utilities', 'Assistance with heating and cooling costs. Helps keep your home safe and comfortable year-round with utility bill support.', 'Up to $800/year', 'Seasonal application',
  '["Income at or below 60% state median", "Responsible for heating/cooling bills", "US citizen or legal resident"]'::JSONB,
  '["Recent utility bill", "Proof of income", "Social Security cards", "Proof of residence"]'::JSONB, 92),

('Medicaid Health Coverage', 'Healthcare', 'Comprehensive health insurance including doctor visits, hospital care, prescriptions, and preventive services at little to no cost.', 'Full coverage', 'Coverage in 30 days',
  '["Income below 138% federal poverty level", "US citizen or legal resident", "State residency"]'::JSONB,
  '["Proof of identity", "Proof of income", "Proof of residency", "Social Security number"]'::JSONB, 96),

('Earned Income Tax Credit (EITC)', 'Tax Benefits', 'Federal tax credit for working individuals and families. Get money back when you file your taxes, even if you don''t owe anything.', 'Up to $6,935/year', 'Annual tax filing',
  '["Earned income from employment", "Valid Social Security number", "Must file tax return"]'::JSONB,
  '["W-2 forms", "1099 forms if self-employed", "Social Security cards", "Bank account for direct deposit"]'::JSONB, 94),

('Section 8 Housing Voucher', 'Housing & Utilities', 'Rental assistance to help you afford safe, decent housing. Covers a portion of your monthly rent based on your income.', 'Varies by rent', 'Waitlist varies',
  '["Income below 50% area median", "US citizen or eligible immigrant", "Pass background check"]'::JSONB,
  '["Proof of income", "Rental history", "Social Security cards", "Photo ID"]'::JSONB, 88),

('WIC (Women, Infants, Children)', 'Food & Nutrition', 'Nutrition program for pregnant women, new mothers, and young children. Provides healthy foods, nutrition education, and healthcare referrals.', 'Up to $50/month per person', 'Benefits in 14 days',
  '["Pregnant, postpartum, or children under 5", "Income below 185% poverty level", "Nutritional risk assessment"]'::JSONB,
  '["Proof of pregnancy or child age", "Income verification", "Proof of residence", "Identification"]'::JSONB, 97),

('Temporary Assistance for Needy Families (TANF)', 'Family Support', 'Cash assistance to families with children. Helps with basic needs while you work toward self-sufficiency through job training and education.', 'Up to $500/month', 'Benefits in 30-45 days',
  '["Have dependent children under 18", "Income below state threshold", "Participate in work activities"]'::JSONB,
  '["Proof of income", "Child birth certificates", "Social Security cards", "Proof of residence"]'::JSONB, 90);