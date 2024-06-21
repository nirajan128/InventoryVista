import pg from "pg";
import dotenv from "dotenv"

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

/**
 * setup data base with database
 */
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
}) 

await db.connect();

export default db;