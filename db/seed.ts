import { pool } from "../src/config/db.js";
import { hashPassword } from "../src/Security/password.js";

const seed = async (): Promise<void> => {
  const email = "admin@examhub.local";
  const plainPassword = "Admin123!";
  const passwordHash = await hashPassword(plainPassword);

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
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
