import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("users.db");

// Initialize users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export async function createUser(name: string, email: string, password: string): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(name, email, hashedPassword);
  
  return {
    id: result.lastInsertRowid as number,
    name,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const user = stmt.get(email) as User | undefined;
  
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = stmt.get(id) as User | undefined;
  
  return user || null;
}

export async function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;
  
  const stmt = db.prepare(`
    UPDATE users 
    SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  stmt.run(updates.name || user.name, updates.email || user.email, id);
  
  return await getUserById(id);
} 