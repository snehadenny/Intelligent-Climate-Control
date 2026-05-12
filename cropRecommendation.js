import { open } from "sqlite";
import sqlite3 from "sqlite3";

// Open the SQLite database (or create it if it doesn't exist)
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database
});

// Function to calculate Euclidean distance between two points (crop conditions vs sensor data)
const calculateEuclideanDistance = (sensorData, cropData) => {
  const tempDiff = sensorData.temperature - cropData.temperature;
  const humidityDiff = sensorData.humidity - cropData.humidity;
  
  return Math.sqrt(tempDiff * tempDiff + humidityDiff * humidityDiff);
};

// Function to recommend crops based on the given sensor data (temperature and humidity)
export const recommendCropsBasedOnSensorData = async (sensorData) => {
  if (!sensorData || sensorData.temperature == null || sensorData.humidity == null) {
    throw new Error("Invalid sensor data");
  }

  // Step 1: Get all crops from the crop recommendation table
  const db = await dbPromise;
  const crops = await db.all("SELECT * FROM crop_recommendation");

  // Step 2: Calculate the similarity (Euclidean distance) for each crop
  const cropSimilarities = crops.map(crop => {
    const distance = calculateEuclideanDistance(sensorData, crop);
    return { crop, distance };
  });

  // Step 3: Sort crops by distance (smallest distance is the best match)
  cropSimilarities.sort((a, b) => a.distance - b.distance);

  // Step 4: Ensure we get at least 3 distinct crops
  const distinctCrops = [];
  const cropLabels = new Set(); // To ensure crops are distinct

  // Iterate through the sorted crops and select distinct crops
  for (const item of cropSimilarities) {
    if (!cropLabels.has(item.crop.label)) {
      distinctCrops.push(item.crop);
      cropLabels.add(item.crop.label);
    }
    // Stop once we have at least 3 distinct crops
    if (distinctCrops.length >= 3) {
      break;
    }
  }

  // If there are fewer than 3 distinct crops, return as many as available
  if (distinctCrops.length < 3) {
    distinctCrops.push(...cropSimilarities.slice(0, 3 - distinctCrops.length).map(item => item.crop));
  }

  return distinctCrops;
};
