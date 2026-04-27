import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '../data');
let db;
export function initDb() {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(path.join(dataDir, 'flighthub.db'));
    db.pragma('journal_mode = WAL');
    db.exec(`
    CREATE TABLE IF NOT EXISTS tracked_flights (
      id TEXT PRIMARY KEY,
      flight_iata TEXT NOT NULL UNIQUE,
      airline_name TEXT,
      origin TEXT,
      destination TEXT,
      aircraft TEXT,
      scheduled_departure TEXT,
      scheduled_arrival TEXT,
      actual_departure TEXT,
      actual_arrival TEXT,
      delay_minutes INTEGER DEFAULT 0,
      status TEXT DEFAULT 'on-time',
      next_day_arrival INTEGER DEFAULT 0,
      added_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      flight_iata TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
    console.log('DB ready:', path.join(dataDir, 'flighthub.db'));
}
export function getDb() {
    if (!db)
        throw new Error('DB not initialised — call initDb() first');
    return db;
}
