import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/deviceData", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const deviceSchema = new mongoose.Schema({
  name: String,
  location: String,
  temperature: Number,
  humidity: Number,
  pH: Number,
  rainfall: Number,
  cropDetails: String,
  lastUpdated: { type: Date, default: Date.now },
});

const Device = mongoose.model("Device", deviceSchema);

// Routes
app.get("/devices", async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
});

app.post("/devices", async (req, res) => {
  const newDevice = new Device(req.body);
  await newDevice.save();
  res.status(201).json(newDevice);
});

app.listen(5000, () => console.log("Server running on port 5000"));
