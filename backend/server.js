// ============================================================================
// FILE: backend/server.js
// PURPOSE: Main entry point for the FocusFlow Express + SQLite backend server.
// ============================================================================

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/apiRoutes');
const { DB_FILE_PATH } = require('./src/database/sqliteDatabase');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable Cross-Origin Resource Sharing so the frontend on port 3000 can call this API
app.use(cors());

// Parse incoming JSON request bodies automatically
app.use(express.json());

// Health-check endpoint to verify the server and SQLite database are running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'SQLite (node:sqlite)',
    databaseFile: DB_FILE_PATH,
    service: 'FocusFlow Backend API'
  });
});

// Mount all FocusFlow API routes under /api (and also at / as a fallback)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Return JSON (instead of HTML) if an unknown route is requested
app.use((req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Start listening for HTTP requests on port 4000
app.listen(PORT, () => {
  console.log(`FocusFlow Backend running at http://localhost:${PORT} (SQLite DB: ${DB_FILE_PATH})`);
});
