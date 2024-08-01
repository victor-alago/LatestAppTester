import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Setup the database connection using test configuration
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export async function createTestUser() {
    const client = await pool.connect();
    try {
        await client.query(`
        INSERT INTO users (email, username, password, creation_date)
      VALUES
        ('testemail@test.com', 'Tester', crypt('password123', gen_salt('bf')), CURRENT_TIMESTAMP);
        INSERT INTO addresses (email, country, city, street)
      VALUES
        ('testemail@test.com', 'USA', 'New York', '123 Main St');`);
    } catch (error) {
        console.error('Error creating tables or inserting data:', error.stack);
    } finally {
      client.release();
    }
  }

// Clean and reset the database for each test
export const setupDatabase = async () => {
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
};

export const teardownDatabase = async () => {
  await pool.end();  // Close the database connection after all tests are done
};