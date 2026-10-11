/**
 * Linked Content Routes (Public / Dynamic Endpoints)
 * 
 * In modern web architectures and marketing automation (such as CleverTap Linked Content,
 * RSS feeds, or dynamic app widgets), external systems or web clients often need to query
 * live, dynamic snippets without requiring user authentication.
 * 
 * These endpoints provide real-time motivational quotes and session presets that can be
 * consumed by the frontend or external personalization engines.
 */

import { Router, Request, Response } from 'express';

// Initialize the Express sub-router
const router = Router();

/**
 * GET /api/public/linked-content/quote
 * 
 * Returns a randomized productivity quote.
 * Useful for displaying daily inspiration on the dashboard or embedding inside personalized notifications.
 */
router.get('/quote', (req: Request, res: Response) => {
  // A curated list of quotes from renowned productivity authors
  const quotes = [
    { quote: 'Focus is a muscle. The more you practice, the stronger it gets.', author: 'FocusFlow' },
    { quote: 'Deep work is the ability to focus without distraction on a cognitively demanding task.', author: 'Cal Newport' },
    { quote: 'Small daily streaks compound into massive yearly achievements.', author: 'James Clear' },
    { quote: 'Action precedes motivation. Start a 25-minute session today.', author: 'Productivity Lab' },
  ];

  // Pick a pseudo-random quote from the array
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Return quote object as JSON
  res.json(randomQuote);
});

/**
 * GET /api/public/linked-content/presets
 * 
 * Returns standard focus session presets (durations, break times, and recommendations).
 * This allows the client or dynamic campaign templates to fetch updated presets centrally
 * without hardcoding them into multiple places.
 */
router.get('/presets', (req: Request, res: Response) => {
  res.json({
    presets: [
      { name: 'Pomodoro Classic', duration: 25, breakDuration: 5, recommendedFor: 'Quick sprints' },
      { name: 'Deep Work Flow', duration: 45, breakDuration: 10, recommendedFor: 'Complex problem solving' },
      { name: 'Extended Immersion', duration: 60, breakDuration: 15, recommendedFor: 'Uninterrupted creative flow' },
    ],
  });
});

export default router;

