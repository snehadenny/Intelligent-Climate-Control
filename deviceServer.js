import express from "express";
import cors from "cors";
import qrcode from "qrcode";

const app = express();
app.use(cors());
app.use(express.json());

let deviceStatus = {
  connected: false,
  ssid: "",
  ip: "",
};

// Generate QR Code with Wi-Fi credentials
app.post("/api/generate-qr", async (req, res) => {
  const { ssid, password } = req.body;
  if (!ssid || !password) {
    return res.status(400).json({ error: "SSID and Password required" });
  }

  const wifiConfig = `WIFI:S:${ssid};T:WPA;P:${password};;`; // Wi-Fi QR format
  try {
    const qrImage = await qrcode.toDataURL(wifiConfig);
    res.json({ qrImage });
  } catch (error) {
    res.status(500).json({ error: "QR Code Generation Failed" });
  }
});

// Update Device Connection Status
app.post("/api/device-status", (req, res) => {
  const { connected, ssid, ip } = req.body;
  deviceStatus = { connected, ssid, ip };
  res.json({ message: "Device status updated" });
});

// Get Current Device Status
app.get("/api/device-status", (req, res) => {
  res.json(deviceStatus);
});

// Start Server
const PORT = 5001; // Separate from main backend
app.listen(PORT, () => console.log(`Device Server running on port ${PORT}`));
