import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

type WebVitalName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

interface WebVitalMetric {
  name: WebVitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

const sendToAnalytics = async (metric: WebVitalMetric) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('analytics_events').insert({
      event_name: 'web_vital',
      event_data: {
        metric_name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        metric_id: metric.id,
        navigation_type: metric.navigationType,
        page: window.location.pathname,
        user_agent: navigator.userAgent,
      },
      user_id: user?.id,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience for analytics
    console.debug('Web Vitals tracking error:', error);
  }
};

const handleMetric = (metric: Metric) => {
  const webVitalMetric: WebVitalMetric = {
    name: metric.name as WebVitalName,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown',
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: metric.rating,
    });
  }

  // Send to analytics in production
  if (import.meta.env.PROD) {
    sendToAnalytics(webVitalMetric);
  }
};

/**
 * Initialize Core Web Vitals monitoring
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Interactivity (replaces FID)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 */
export const initWebVitals = () => {
  // Core Web Vitals (the main three)
  onLCP(handleMetric);  // Largest Contentful Paint
  onINP(handleMetric);  // Interaction to Next Paint
  onCLS(handleMetric);  // Cumulative Layout Shift
  
  // Additional useful metrics
  onFCP(handleMetric);  // First Contentful Paint
  onTTFB(handleMetric); // Time to First Byte
};

/**
 * Get performance thresholds for each metric
 */
export const getMetricThresholds = () => ({
  LCP: { good: 2500, poor: 4000 },    // milliseconds
  INP: { good: 200, poor: 500 },      // milliseconds
  CLS: { good: 0.1, poor: 0.25 },     // score
  FCP: { good: 1800, poor: 3000 },    // milliseconds
  TTFB: { good: 800, poor: 1800 },    // milliseconds
});
