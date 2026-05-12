import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
import crypto from "crypto";
import { initDb, insertUser, getUserByUsername, insertSensor, insertSensorData, getAllSensors, verifySensorAuthKey, getLatestSensorData,
  getLatestSensorDataForLatestSensors, getAverageSensorData, getTopRainfallCrops2, getCropsData, getSensorHealthStatus } from "./sqlite.js";
import { recommendCropsBasedOnSensorData } from "./cropRecommendation.js";

dotenv.config();

const app = express();
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// CORS Middleware
const corsOptions = {
  origin: "http://localhost:5173", // Frontend URL
  credentials: true, // Allow cookies & sessions
};
app.use(cors(corsOptions));
app.use(express.json());

// Initialize the database
initDb();

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production with HTTPS
  })
);

// API to get crop recommendations based on the latest sensor data (temperature and humidity)
app.get("/api/recommend-crops-by-sensor", async (req, res) => {
  const { temperature, humidity } = req.query;

  if (!temperature || !humidity) {
    return res.status(400).json({ message: "Temperature and humidity are required" });
  }

  const sensorData = {
    temperature: parseFloat(temperature),
    humidity: parseFloat(humidity)
  };

  try {
    const recommendations = await recommendCropsBasedOnSensorData(sensorData);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: "Error generating crop recommendations", error: error.message });
  }
});

// Register Route
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    await insertUser(username, password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ message: "User already exists" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  req.session.user = user;
  res.json({ isAuthenticated: true, user });
});

// Logout Route
app.get("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

// Authentication Check Route
app.get("/api/checkAuth", (req, res) => {
  if (req.session.user) {
    res.json({ isAuthenticated: true, user: req.session.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Load and process CSV data
let cropsData = [];
fs.createReadStream("Crop_recommendation.csv")
  .pipe(csvParser())
  .on("data", (row) => {
    cropsData.push({
      N: Number(row.N),
      P: Number(row.P),
      K: Number(row.K),
      temperature: Number(row.temperature),
      humidity: Number(row.humidity),
      pH: Number(row.ph),
      rainfall: Number(row.rainfall),
      label: row.label,
    });
  })
  .on("end", () => {
    console.log("CSV Data Loaded Successfully");
  });

// Data Processing
const getAverages = () => {
  let totalCrops = cropsData.length;
  let avgTemp =
    cropsData.reduce((sum, crop) => sum + crop.temperature, 0) / totalCrops;
  let avgHumidity =
    cropsData.reduce((sum, crop) => sum + crop.humidity, 0) / totalCrops;
  let avgRainfall =
    cropsData.reduce((sum, crop) => sum + crop.rainfall, 0) / totalCrops;
  let avgpH = cropsData.reduce((sum, crop) => sum + crop.pH, 0) / totalCrops;

  return { totalCrops, avgTemp, avgHumidity, avgRainfall, avgpH };
};

const getTopRainfallCrops = () => {
  return cropsData
    .sort((a, b) => b.rainfall - a.rainfall)
    .slice(0, 5)
    .map((crop) => ({ label: crop.label, rainfall: crop.rainfall }));
};

const getCategorizedCropsBypH = () => {
  return {
    acidic: cropsData.filter((c) => c.pH < 6).map((c) => c.label),
    neutral: cropsData
      .filter((c) => c.pH >= 6 && c.pH <= 7)
      .map((c) => c.label),
    alkaline: cropsData.filter((c) => c.pH > 7).map((c) => c.label),
  };
};

// API Endpoints
app.get("/api/summary", (req, res) => {
  res.json(getAverages());
});

app.get("/api/top-rainfall-crops", (req, res) => {
  res.json(getTopRainfallCrops());
});

app.get("/api/ph-categories", (req, res) => {
  res.json(getCategorizedCropsBypH());
});

app.get("/api/all-crops", (req, res) => {
  res.json(cropsData);
});

// Weather API
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

app.get('/api/weather', async (req, res) => {
  const location = req.query.location;

  if (!location) {
    return res.status(400).send('Location is required');
  }

  try {
    const latLong = location.split(',');
    if (latLong.length !== 2) {
      return res.status(400).send('Invalid location format');
    }
    const weatherResponse = await axios.get(baseUrl, {
      params: {
        lat: latLong[0],
        lon: latLong[1],
        appid: WEATHER_API_KEY,
        units: 'metric', // For Celsius
      },
    });

    res.json(weatherResponse.data);
  } catch (error) {
    res.status(500).send('Error fetching weather data');
  }
});

// Add Sensor
app.post('/api/sensor', async (req, res) => {
  const { name, type, location, auth_key } = req.body;
  
  // If no auth_key provided, generate one
  const generatedAuthKey = auth_key || crypto.randomBytes(16).toString("hex");

  if (!name || !type) {
    return res.status(400).send('Both name and type are required');
  }

  try {
    await insertSensor(name, type, location, generatedAuthKey);
    res.status(201).json({ message: 'Sensor added successfully', auth_key: generatedAuthKey });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add sensor' });
  }
});

// Get List of All Sensors
app.get('/api/sensors', async (req, res) => {
  try {
    const sensors = await getAllSensors();
    res.json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve sensors' });
  }
});

// Add Sensor Data (with auth_key verification)
app.post('/api/push-sensor-data', async (req, res) => {
  const { sensor_id, humidity, temperature, auth_key } = req.body;

  if (!sensor_id || humidity == null || temperature == null || !auth_key) {
    return res.status(400).send('sensor_id, humidity, temperature, and auth_key are required');
  }

  try {
    // Call the verifySensorAuthKey function from sqlite.js to authenticate the sensor
    const isAuthorized = await verifySensorAuthKey(sensor_id, auth_key);

    if (!isAuthorized) {
      return res.status(401).json({ message: 'Unauthorized: Invalid auth_key' });
    }

    try {
      // If the auth_key matches, insert the sensor data
      await insertSensorData(sensor_id, humidity, temperature);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to verify sensor auth_key', error: error.message });
    }
    
    res.status(201).json({ message: 'Sensor data added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add sensor data', error: error.message });
  }
});

// Dashboard

// Fetch latest 5 sensors with their data
app.get('/api/latest-sensors', async (req, res) => {
  try {
    const latestSensorsData = await getLatestSensorDataForLatestSensors();
    res.json(latestSensorsData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching latest sensors data', error: error.message });
  }
});

// Fetch average sensor data (temperature, humidity, pH)
app.get('/api/average-sensor-data', async (req, res) => {
  try {
    const avgData = await getAverageSensorData();
    res.json(avgData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching average sensor data', error: error.message });
  }
});

// Fetch top rainfall crops from the recommendation data
app.get('/api/top-rainfall-crops', async (req, res) => {
  try {
    const crops = await getTopRainfallCrops2();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top rainfall crops', error: error.message });
  }
});

// Fetch sensor health status (active/inactive)
app.get('/api/sensor-health', async (req, res) => {
  try {
    const sensorHealth = await getSensorHealthStatus();
    res.json(sensorHealth);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor health status', error: error.message });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
