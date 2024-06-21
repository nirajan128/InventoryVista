import pg from "pg";
import dotenv from "dotenv"

dotenv.config();



/**
 * setup data base with database
 */
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
}) 


// Connect to the database
db.connect()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

export default db;