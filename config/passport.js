import pg from "pg";

/**
 * setup data base with database
 */
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, //disables certificate validation
      },
}) 

await db.connect();

export default db;