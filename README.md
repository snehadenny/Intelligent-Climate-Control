# Intelligent-Climate-Control
Developed an IoT-based smart climate monitoring system for real-time temperature and humidity analysis. The project helps predict suitable crop conditions through sensor data processing and database integration.

## Technologies
- Raspberry Pi Pico W  
- DHT22 Sensor  
- Python  
- React.js  
- JavaScript  
- IoT Sensors 
## Features
- Real-time temperature monitoring
- Humidity monitoring
- Live data visualization dashboard
- Historical trend analysis
- IoT-based environmental monitoring
- Sensor data collection and processing
- Real-time frontend updates

## The Process
The system uses a DHT22 sensor connected to a Raspberry Pi Pico W to collect temperature and humidity data in real time. The collected data is processed using Python and displayed on a React-based dashboard, where users can monitor live readings and historical trends for climate control analysis.

## Running The Project
### Step 1: Clone the Repository

Clone the project repository to your local system.

```bash
git clone <repository-link>
cd intelligent-climate-control
```

### Step 2: Install Frontend Dependencies

Install all required Node.js packages for the React frontend.

```bash
npm install
```

---

### Step 3: Install Python Dependencies

Install the required Python libraries for sensor data handling.

```bash
pip install -r requirements.txt
```

---

### Step 4: Connect the Hardware

- Connect the DHT22 sensor to the Raspberry Pi Pico W
- Ensure all wiring connections are correct
- Power on the Raspberry Pi Pico W

---

### Step 5: Run the Python Backend

Start the Python script to collect temperature and humidity data from the sensor.

```bash
python main.py
```

---

### Step 6: Start the React Frontend

Run the React application to open the monitoring dashboard.

```bash
npm start
```

---

### Step 7: Open the Application

Open your browser and visit:

```bash
http://localhost:3000
```

The dashboard will display real-time temperature and humidity data along with historical trends.


## Project Outputs
### This shows the temperature and humidity of the crop cultivated along with the location

![image alt](https://github.com/snehadenny/Intelligent-Climate-Control/blob/88825fb57af6f65d1e257cf0a6644f2713bc1739/output%201.jpeg)

### Crop prediction -
Display the suitable crops for that particular temperature range along with their rain and pH level requirements by the crop.
Display the suitable crops for that particular temperature range along with their rain and pH level requirements by the crop.

![image alt](https://github.com/snehadenny/Intelligent-Climate-Control/blob/a337df6b49043798807e2459e78bcc34224f3aed/output%202.jpeg)

### Sensor Analytics-
Active sensors and their data

![image alt](https://github.com/snehadenny/Intelligent-Climate-Control/blob/68d2d00a18b293f060cfe1048925450e5eac9316/output%203.jpeg)

### Recommendation engine analytics-
Shows crop nutrient distribution levels containing potassium (K), phosphorus (P), and Nitrogen (N)
![image alt](https://github.com/snehadenny/Intelligent-Climate-Control/blob/5f8da2a0e2b3fccce00fe5c21be57ccc58b0a26f/output%204.jpeg)
