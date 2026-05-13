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

![image alt](https://github.com/snehadenny/Intelligent-Climate-Control/blob/88825fb57af6f65d1e257cf0a6644f2713bc1739/output%201.jpeg)
