import { supabase } from '@/integrations/supabase/client';

export interface GovernmentProgramData {
  programId: string;
  title: string;
  description: string;
  eligibilityCriteria: string[];
  benefits: string[];
  applicationUrl?: string;
}

/**
 * Fetch government program data from external APIs
 * This is a placeholder structure for government API integration
 */
export const fetchGovernmentPrograms = async (): Promise<GovernmentProgramData[]> => {
  try {
    // Call edge function that handles government API integration
    const { data, error } = await supabase.functions.invoke('fetch-government-programs');
    
    if (error) throw error;
    
    return data.programs || [];
  } catch (error) {
    console.error('Error fetching government programs:', error);
    return [];
  }
};

/**
 * Verify eligibility for a specific program using government APIs
 */
export const verifyEligibility = async (
  programId: string,
  userProfile: any
): Promise<{ eligible: boolean; reasons?: string[] }> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-eligibility', {
      body: { programId, userProfile },
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error verifying eligibility:', error);
    return { eligible: false, reasons: ['Unable to verify eligibility at this time'] };
  }
};

/**
 * Sync local programs database with government data
 */
export const syncProgramsWithGovernmentData = async (): Promise<void> => {
  try {
    const { error } = await supabase.functions.invoke('sync-government-programs');
    
    if (error) throw error;
    
    console.log('Successfully synced with government data');
  } catch (error) {
    console.error('Error syncing programs:', error);
    throw error;
  }
};
