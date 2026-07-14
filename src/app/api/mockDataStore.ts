import { IoTPayload, DeviceInfo } from "@/services/esp32Service";

// Server-side in-memory store for mock operations
export let apiIoTState: IoTPayload = {
  temperature: 28.2,
  humidity: 65,
  distance: 120,
  rain: false,
  rainIntensity: 0,
  irDetected: false,
  lcdMessage: "ESP32 Server OK",
  led1: false,
  led2: false,
  led3: false,
  led4: false,
  buzzer: false,
  deviceStatus: 'Online',
  wifiStrength: -58,
  lastUpdated: new Date().toISOString(),
};

export const apiDeviceInfo: DeviceInfo = {
  chipModel: "ESP32-WROOM-32E (Wi-Fi/BT)",
  flashSizeMB: 4,
  freeHeapBytes: 195240,
  cpuFreqMHz: 240,
  sdkVersion: "v4.4.4-official",
  macAddress: "30:AE:A4:07:0D:64",
  ipAddress: "192.168.1.188",
  uptimeSeconds: 523,
  batteryLevel: 100,
  sensorHealth: {
    dht11: 'Healthy',
    ultrasonic: 'Healthy',
    ir: 'Healthy',
    rain: 'Healthy',
    lcd: 'Healthy',
    leds: 'Healthy',
    buzzer: 'Healthy',
  }
};

export function updateServerState() {
  const tempDiff = (Math.random() - 0.5) * 0.5;
  const humDiff = Math.round((Math.random() - 0.5) * 3);
  const distDiff = Math.round((Math.random() - 0.5) * 12);
  
  const currentTemp = Math.min(Math.max(apiIoTState.temperature + tempDiff, 20.0), 40.0);
  const currentHum = Math.min(Math.max(apiIoTState.humidity + humDiff, 25), 98);
  let currentDist = Math.min(Math.max(apiIoTState.distance + distDiff, 4), 300);

  let irDetected = apiIoTState.irDetected;
  if (Math.random() < 0.1) {
    irDetected = !irDetected;
  }
  if (irDetected && Math.random() < 0.3) {
    currentDist = Math.min(currentDist, 15);
  }

  let rain = apiIoTState.rain;
  let rainIntensity = apiIoTState.rainIntensity;
  if (Math.random() < 0.05) {
    rain = !rain;
  }
  if (rain) {
    rainIntensity = Math.min(Math.max(rainIntensity + Math.round((Math.random() - 0.5) * 12), 15), 100);
  } else {
    rainIntensity = 0;
  }

  // Automated Actuators logic
  // High Temperature Alert: turn ON red LED (led4) if temp > 30°C
  const led4 = currentTemp > 30;

  // IR Object Detection: turn ON the white LED (mapped to led2 - Yellow/Obstacle in UI) if IR sensor detects an object
  const led2 = irDetected;

  // Keep existing states for normal/manually triggered LEDs
  const led1 = apiIoTState.led1;
  const led3 = apiIoTState.led3;

  // Buzzer automatic trigger if any of these conditions are true:
  // 1. Rain Alert: rain probability (rainIntensity) > 30%
  // 2. IR Object Detection: irDetected is true
  // 3. High Temperature Alert: temperature > 30°C
  // 4. Critical Proximity: existing feature (distance < 20cm)
  const buzzer = (rainIntensity > 30) || irDetected || (currentTemp > 30) || (currentDist < 20);

  // LCD Monitor Display Priority System (highest to lowest):
  // 1. High Temperature Alert
  // 2. IR Object Detection
  // 3. Critical Distance Proximity
  // 4. Rain Expected Alert
  // 5. Default/Normal Status
  let lcdMessage = "System Normal";
  if (currentTemp > 30) {
    if (currentTemp > 35) {
      lcdMessage = "TEMP TOO HIGH!";
    } else {
      lcdMessage = "High Temperature";
    }
  } else if (irDetected) {
    lcdMessage = "Object Detected";
  } else if (currentDist < 20) {
    lcdMessage = "CRITICAL CLOSE!";
  } else if (rainIntensity > 30) {
    lcdMessage = "Rain Expected";
  } else if (rain) {
    lcdMessage = `Rain: ${rainIntensity}%`;
  } else if (led1 || led2 || led3 || led4) {
    const activeLeds = [];
    if (led1) activeLeds.push("L1");
    if (led2) activeLeds.push("L2");
    if (led3) activeLeds.push("L3");
    if (led4) activeLeds.push("L4");
    lcdMessage = `LEDs: ${activeLeds.join(",")}`;
  }

  const wifiStrength = Math.min(Math.max(apiIoTState.wifiStrength + Math.round((Math.random() - 0.5) * 3), -80), -40);

  apiIoTState = {
    ...apiIoTState,
    temperature: parseFloat(currentTemp.toFixed(1)),
    humidity: currentHum,
    distance: currentDist,
    rain,
    rainIntensity,
    irDetected,
    lcdMessage,
    led1,
    led2,
    led3,
    led4,
    buzzer,
    wifiStrength,
    lastUpdated: new Date().toISOString(),
  };
}
