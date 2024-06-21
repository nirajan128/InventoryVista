import pg from "pg";
import dotenv from "dotenv"

dotenv.config();



/**
 * setup data base with database
 */
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Temporary fix for self-signed certificates, should be handled properly in production
    },
}) 


await db.connect();

export default db;