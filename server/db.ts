import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Configure connection pool settings for better stability
neonConfig.poolQueryViaFetch = true;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool with proper configuration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  maxUses: 7500,              // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle({ client: pool, schema });

// Graceful shutdown function
export const closeDatabase = async () => {
  try {
    await pool.end();
    console.log('Database pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);