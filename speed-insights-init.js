/* ═══ VERCEL SPEED INSIGHTS INITIALIZATION ═══ */
import { injectSpeedInsights } from './speed-insights.mjs';

// Initialize Vercel Speed Insights
// This will automatically track Core Web Vitals and send them to Vercel
injectSpeedInsights({
  debug: false, // Set to true to see debug logs in development
  // sampleRate: 1, // Optional: 1 = 100% of events sent (default)
});
