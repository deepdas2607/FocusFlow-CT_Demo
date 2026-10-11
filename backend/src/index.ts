/**
 * FocusFlow Backend Server Entry Point
 * 
 * This file configures and starts the Express HTTP server:
 * 1. Loads environment variables (.env)
 * 2. Configures security & middleware (CORS, JSON parser)
 * 3. Mounts REST API route handlers
 * 4. Provides a health check endpoint
 * 5. Handles unmatched routes (404 catch-all)
 * 6. Starts listening on the configured TCP port
 */

// Load environment variables from .env file into process.env before anything else runs
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import all domain route handlers
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import focusRoutes from './routes/focusRoutes';
import profileRoutes from './routes/profileRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import linkedContentRoutes from './routes/linkedContentRoutes';

// Create Express application instance
const app = express();

/**
 * CORS (Cross-Origin Resource Sharing) Configuration
 * 
 * Because the Next.js frontend runs on http://localhost:3000 and the Express API
 * runs on http://localhost:4000, modern browsers will block cross-origin requests
 * unless the server explicitly permits them via CORS headers.
 * 
 * 'credentials: true' allows cookies and Authorization headers to pass through.
 */
const allowedOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigins, credentials: true }));

/**
 * Body Parser Middleware
 * 
 * express.json() parses incoming request payloads formatted as JSON and populates
 * req.body with the resulting JavaScript object.
 */
app.use(express.json());

/**
 * GET /health
 * 
 * Simple health check endpoint used by uptime monitors, container orchestrators,
 * or developers to verify that the backend process is up and responding.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * REST API Route Mounting
 * 
 * Prefix each domain router with its corresponding path:
 * - /api/auth: user registration, login, session inspection
 * - /api/tasks: task CRUD operations and completion
 * - /api/focus: timer session lifecycle (start, complete, abandon, history)
 * - /api/profile: user preferences and profile attribute updates
 * - /api/dashboard: single-call aggregation for dashboard home screen
 * - /api/public/linked-content: unauthenticated dynamic resources
 */
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public/linked-content', linkedContentRoutes);

/**
 * Global 404 Not Found Handler
 * 
 * If a request does not match any registered route above, Express drops through to this middleware.
 */
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

/**
 * Server Listener
 * 
 * Binds the Express app to the specified port (default 4000) and starts listening for HTTP traffic.
 */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FocusFlow backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;


