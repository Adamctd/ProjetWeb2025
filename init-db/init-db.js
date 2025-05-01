import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = open({
  filename: "database.sqlite",
  driver: sqlite3.Database,
}).then(async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS randonnees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      website TEXT,
      photo TEXT,
      average_rating REAL DEFAULT 0
    );
  `);
  console.log("Tables créées avec succès !");
  return db;
});

export default dbPromise;
