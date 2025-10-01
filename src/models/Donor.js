const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Conectar a la base de datos
const db = new sqlite3.Database('./donors.db');

// Crear tabla de donantes
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    blood_type TEXT,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabla de usuarios para autenticación
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insertar usuario admin por defecto (contraseña: admin123)
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (username, password, role) 
          VALUES (?, ?, ?)`, ['admin', hashedPassword, 'admin']);
});

class Donor {
  static getAll(callback) {
    db.all("SELECT * FROM donors", callback);
  }

  static create(donor, callback) {
    const { name, email, blood_type, phone } = donor;
    db.run(
      "INSERT INTO donors (name, email, blood_type, phone) VALUES (?, ?, ?, ?)",
      [name, email, blood_type, phone],
      callback
    );
  }

  static findByEmail(email, callback) {
    db.get("SELECT * FROM donors WHERE email = ?", [email], callback);
  }

  static findUserByUsername(username, callback) {
    db.get("SELECT * FROM users WHERE username = ?", [username], callback);
  }
}

module.exports = Donor;