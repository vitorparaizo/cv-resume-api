const { pool } = require('../config/database');
require('dotenv').config();

const DROP_SQL = `
  DROP TABLE IF EXISTS project_technologies     CASCADE;
  DROP TABLE IF EXISTS projects                 CASCADE;
  DROP TABLE IF EXISTS experience_highlights    CASCADE;
  DROP TABLE IF EXISTS experiences              CASCADE;
  DROP TABLE IF EXISTS skills                   CASCADE;
  DROP TABLE IF EXISTS skill_categories         CASCADE;
  DROP TABLE IF EXISTS education                CASCADE;
  DROP TABLE IF EXISTS certifications           CASCADE;
  DROP TABLE IF EXISTS languages                CASCADE;
  DROP TABLE IF EXISTS contacts                 CASCADE;
  DROP TABLE IF EXISTS profiles                 CASCADE;
  DROP FUNCTION IF EXISTS update_updated_at()   CASCADE;
`;

async function rollback() {
  const client = await pool.connect();
  try {
    console.log('⏪ Rolling back all tables...');
    await client.query(DROP_SQL);
    console.log('✅ Rollback completed.');
  } catch (err) {
    console.error('❌ Rollback failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

rollback();
