import { supabase } from "@/integrations/supabase/client";

type AnalyticsEvent = 
  | 'quiz_started'
  | 'quiz_completed'
  | 'application_started'
  | 'application_submitted'
  | 'program_viewed'
  | 'document_uploaded'
  | 'story_shared'
  | 'page_view';

interface EventData {
  page?: string;
  program_id?: string;
  quiz_result?: string;
  [key: string]: any;
}

export const trackEvent = async (event: AnalyticsEvent, data?: EventData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_events').insert({
      event_name: event,
      event_data: data,
      user_id: user?.id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

export const trackPageView = (page: string) => {
  trackEvent('page_view', { page });
};
