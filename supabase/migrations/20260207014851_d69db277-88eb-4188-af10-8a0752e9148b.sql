-- Fix RLS policies for profiles, analytics_events, and documents tables

-- 1. Drop the potentially problematic anonymous SELECT on profiles (if exists)
-- The current policies are fine - users can view their own profile, admins can view all
-- No changes needed for profiles as the policies are correct

-- 2. Make analytics_events INSERT more restrictive - require authentication
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

CREATE POLICY "Authenticated users can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to insert events (user_id must match or be null for anonymous events)
  auth.uid() IS NOT NULL AND (auth.uid() = user_id OR user_id IS NULL)
);

-- 3. Add admin SELECT policy for documents table so admins can view all documents
CREATE POLICY "Admins can view all documents" 
ON public.documents 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));