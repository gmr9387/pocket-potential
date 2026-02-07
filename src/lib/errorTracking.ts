import { supabase } from '@/integrations/supabase/client';

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

/**
 * Reports an error to the analytics_events table for tracking
 */
export const reportError = async (error: Error, componentStack?: string): Promise<void> => {
  // Only report errors in production
  if (import.meta.env.DEV) {
    console.error('[Error Tracking] Error captured:', error);
    if (componentStack) {
      console.error('[Error Tracking] Component stack:', componentStack);
    }
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    await supabase.from('analytics_events').insert([{
      event_name: 'error',
      event_data: JSON.parse(JSON.stringify(errorReport)),
      user_id: user?.id ?? null,
      created_at: new Date().toISOString(),
    }]);
  } catch (trackingError) {
    // Silently fail - don't cause additional errors while handling an error
    console.debug('Error tracking failed:', trackingError);
  }
};

/**
 * Global error handler for uncaught errors
 */
export const initGlobalErrorTracking = (): void => {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    reportError(new Error(event.message), undefined);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    reportError(error, undefined);
  });
};
