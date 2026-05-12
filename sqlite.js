import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open the SQLite database (or create it if it doesn't exist)
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database
});

// Initialize the database schema
const initDb = async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
    CREATE TABLE IF NOT EXISTS sensor_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT,
        auth_key TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        humidity DECIMAL(5, 2) NOT NULL,
        temperature DECIMAL(5, 2) NOT NULL,
        sensor_id INTEGER,
        date_time TEXT DEFAULT CURRENT_TIMESTAMP,  -- Adding date_time column with default value as current timestamp
        FOREIGN KEY (sensor_id) REFERENCES sensor_info(id)
    );
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
  console.log("Database initialized successfully");
};

// Function to insert a user
const insertUser = async (username, password) => {
  const db = await dbPromise;
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
  } catch (error) {
    throw new Error("User already exists");
  }
};

// Function to get a user by username
const getUserByUsername = async (username) => {
  const db = await dbPromise;
  const row = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  return row;
};

// Function to insert a sensor
const insertSensor = async (name, type, location, auth_key) => {
  const db = await dbPromise;
  await db.run('INSERT INTO sensor_info (name, type, location, auth_key) VALUES (?, ?, ?, ?)', [name, type, location, auth_key]);
};

// Function to insert sensor data
const insertSensorData = async (sensor_id, humidity, temperature) => {
  const db = await dbPromise;
  await db.run('INSERT INTO sensor_data (sensor_id, humidity, temperature) VALUES (?, ?, ?)', [sensor_id, humidity, temperature]);
};

// Function to get all sensors
const getAllSensors = async () => {
  const db = await dbPromise;
  const sensors = await db.all(`SELECT 
    s.id, 
    s.name, 
    s.type, 
    COALESCE(sd.date_time, '-') AS date_time,
    COALESCE(sd.humidity, '') AS humidity, 
    COALESCE(sd.temperature, '') AS temperature,
    s.location,
    s.auth_key
FROM 
    sensor_info s
LEFT JOIN 
    sensor_data sd ON s.id = sd.sensor_id
WHERE 
    sd.date_time = (SELECT MAX(date_time) FROM sensor_data WHERE sensor_id = s.id) OR sd.date_time IS NULL
`);
  return sensors;
};

// Function to verify sensor auth_key
const verifySensorAuthKey = async (sensor_id, auth_key) => {
  const db = await dbPromise;
  const sensor = await db.get('SELECT * FROM sensor_info WHERE id = ?', [sensor_id]);

  // Return the sensor if auth_key matches
  if (sensor && sensor.auth_key === auth_key) {
    return true; // Authenticated
  }
  
  return false; // Unauthorized
};


// Function to get the latest sensor data (temperature and humidity)
const getLatestSensorData = async () => {
  const db = await dbPromise;
  const latestSensorData = await db.get(`
    SELECT temperature, humidity
    FROM sensor_data
    WHERE date_time = (SELECT MAX(date_time) FROM sensor_data)
  `);
  return latestSensorData;
};

// Function to get the latest data for each of the 5 most recently updated sensors
const getLatestSensorDataForLatestSensors = async () => {
  const db = await dbPromise;
  const result = await db.all(`
    SELECT s.id, s.name, sd.temperature, sd.humidity, sd.date_time
    FROM sensor_info s
    LEFT JOIN sensor_data sd ON s.id = sd.sensor_id
    WHERE sd.date_time = (
      SELECT MAX(date_time) 
      FROM sensor_data 
      WHERE sensor_id = s.id
    )
    ORDER BY s.id DESC
    LIMIT 5
  `);
  return result;
};

// Function to get the average sensor data (temperature, humidity, pH)
const getAverageSensorData = async () => {
  const db = await dbPromise;
  const result = await db.get(`
    SELECT
      AVG(temperature) AS avg_temp,
      AVG(humidity) AS avg_humidity,
      AVG(pH) AS avg_ph
    FROM sensor_data
  `);
  return result;
};

// Function to get top crops based on rainfall (Recommendation CSV data)
const getTopRainfallCrops2 = async () => {
  const db = await dbPromise;
  const crops = await db.all(`
    SELECT label, rainfall FROM crop_recommendation
    ORDER BY rainfall DESC
    LIMIT 5
  `);
  return crops;
};

// Function to fetch all crop recommendation data (from CSV)
const getCropsData = async () => {
  const db = await dbPromise;
  const crops = await db.all(`
    SELECT N, P, K, temperature, humidity, pH, rainfall, label
    FROM crop_recommendation
  `);
  return crops;
};

// Function to get the sensor status (active/inactive)
const getSensorHealthStatus = async () => {
  const db = await dbPromise;
  const result = await db.all(`
    SELECT s.id, s.name, 
    CASE 
        WHEN MAX(sd.date_time) IS NULL THEN 'Inactive'
        WHEN MAX(sd.date_time) < DATETIME('now', '-24 hours') THEN 'Inactive'
        ELSE 'Active'
    END AS status
FROM sensor_info s
LEFT JOIN sensor_data sd ON s.id = sd.sensor_id
GROUP BY s.id;
  `);
  return result;
};

export { initDb, insertUser, getUserByUsername, insertSensor, insertSensorData, getAllSensors, verifySensorAuthKey, getLatestSensorData,
  getLatestSensorDataForLatestSensors, getAverageSensorData, getTopRainfallCrops2, getCropsData, getSensorHealthStatus
};
