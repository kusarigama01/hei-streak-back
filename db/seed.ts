import { Pool } from "pg";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// TODO: replace this local hashing call with the shared hashPassword()
// function from src/Security/password.ts once it lands, to avoid
// having two different bcrypt implementations in the project.
async function seed() {
  const email = "admin@examhub.local";
  const plainPassword = "Admin123!";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    console.log("Admin account already exists, nothing to do.");
    await pool.end();
    return;
  }

  await pool.query(
    `INSERT INTO users (email, password_hash, role, name, is_active)
     VALUES ($1, $2, 'admin', $3, TRUE)`,
    [email, passwordHash, "Administrator"]
  );

  console.log("Admin account created:");
  console.log(`  email    : ${email}`);
  console.log(`  password : ${plainPassword}`);

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});