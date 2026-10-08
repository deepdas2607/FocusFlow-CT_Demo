import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Public Dynamic Content Endpoints
 *
 * Provides real-time productivity quotes and focus session presets.
 * Can be queried by web clients or external marketing engines as dynamic linked content.
 */

// GET /api/public/linked-content/quote
router.get('/quote', (req: Request, res: Response) => {
  const quotes = [
    { quote: 'Focus is a muscle. The more you practice, the stronger it gets.', author: 'FocusFlow' },
    { quote: 'Deep work is the ability to focus without distraction on a cognitively demanding task.', author: 'Cal Newport' },
    { quote: 'Small daily streaks compound into massive yearly achievements.', author: 'James Clear' },
    { quote: 'Action precedes motivation. Start a 25-minute session today.', author: 'Productivity Lab' },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(randomQuote);
});

// GET /api/public/linked-content/presets
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
