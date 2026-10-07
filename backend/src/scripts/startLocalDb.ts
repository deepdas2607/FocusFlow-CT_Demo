/**
 * Local PostgreSQL Server using PGlite and PGLiteSocketServer.
 *
 * This provides an embedded PostgreSQL server on localhost:5432 with standard
 * PostgreSQL wire protocol. It persists data to the `.pglite-data` directory.
 *
 * This allows FocusFlow to run immediately without requiring manual PostgreSQL
 * or Docker installation on the machine.
 *
 * For production or external PostgreSQL, simply point DATABASE_URL in .env
 * to your external PostgreSQL instance (e.g. Supabase, Neon, RDS, or local psql).
 */

import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import path from 'path';

async function main() {
  const dataDir = path.resolve(__dirname, '../../.pglite-data');
  console.log(`Starting embedded PostgreSQL server using data dir: ${dataDir}`);

  // Create PGlite instance backed by disk storage
  const db = await PGlite.create({ dataDir });

  // Start PostgreSQL wire protocol server on port 5432
  const server = new PGLiteSocketServer({
    db,
    port: 5432,
    host: '127.0.0.1',
    debug: true,
  });

  await server.start();
  console.log('PostgreSQL server is ready and listening on 127.0.0.1:5432');
}

main().catch((err) => {
  console.error('Failed to start local PostgreSQL server:', err);
  process.exit(1);
});
