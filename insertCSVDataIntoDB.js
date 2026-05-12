import { open } from "sqlite";
import sqlite3 from "sqlite3";
import csvParser from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";

// Open the SQLite database (or create it if it doesn't exist)
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database
});

const db = await dbPromise;
await db.exec(`
    CREATE TABLE IF NOT EXISTS crop_recommendation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      N DECIMAL(5, 2),
      P DECIMAL(5, 2),
      K DECIMAL(5, 2),
      temperature DECIMAL(5, 2),
      humidity DECIMAL(5, 2),
      pH DECIMAL(5, 2),
      rainfall DECIMAL(5, 2),
      label TEXT
    );
`);

// Insert crop recommendation data into the database
const insertCropRecommendation = async (N, P, K, temperature, humidity, pH, rainfall, label) => {
  const db = await dbPromise;
  await db.run('INSERT INTO crop_recommendation (N, P, K, temperature, humidity, pH, rainfall, label) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [N, P, K, temperature, humidity, pH, rainfall, label]);
};

// Load and process CSV data
let cropsData = [];
fs.createReadStream("Crop_recommendation.csv")
  .pipe(csvParser())
  .on("data", async (row) => {
    const crop = {
      N: Number(row.N),
      P: Number(row.P),
      K: Number(row.K),
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
      pH: Number(row.ph),
      rainfall: Number(row.rainfall),
      label: row.label,
    };
    
    // Insert each crop data into the database
    await insertCropRecommendation(crop.N, crop.P, crop.K, crop.temperature, crop.humidity, crop.pH, crop.rainfall, crop.label);
  })
  .on("end", () => {
    console.log("CSV Data Loaded and Inserted Successfully");
  });
