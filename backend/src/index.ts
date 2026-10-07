// Load environment variables from .env file before anything else
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import all route modules
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import focusRoutes from './routes/focusRoutes';
import profileRoutes from './routes/profileRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import linkedContentRoutes from './routes/linkedContentRoutes';

const app = express();

// Allow cross-origin requests from the frontend (Next.js runs on a different port)
// In production, replace '*' with your actual frontend domain
const allowedOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// Health check endpoint - useful for checking if the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route modules under their respective paths
// Every route inside authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public/linked-content', linkedContentRoutes);

// Global 404 handler - runs if no route matched
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FocusFlow backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

