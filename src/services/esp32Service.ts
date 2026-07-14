export interface IoTPayload {
  temperature: number;
  humidity: number;
  distance: number;
  rain: boolean;
  rainIntensity: number;
  irDetected: boolean;
  lcdMessage: string;
  led1: boolean;
  led2: boolean;
  led3: boolean;
  led4: boolean;
  buzzer: boolean;
  deviceStatus: 'Online' | 'Offline';
  wifiStrength: number;
  lastUpdated: string;
}

export interface DeviceInfo {
  chipModel: string;
  flashSizeMB: number;
  freeHeapBytes: number;
  cpuFreqMHz: number;
  sdkVersion: string;
  macAddress: string;
  ipAddress: string;
  uptimeSeconds: number;
  batteryLevel?: number; // Placeholder for battery
  sensorHealth: {
    dht11: 'Healthy' | 'Error';
    ultrasonic: 'Healthy' | 'Error';
    ir: 'Healthy' | 'Error';
    rain: 'Healthy' | 'Error';
    lcd: 'Healthy' | 'Error';
    leds: 'Healthy' | 'Error';
    buzzer: 'Healthy' | 'Error';
  };
}

// Global variable in memory to hold simulated/active states for mock or REST API
let currentIoTState: IoTPayload = {
  temperature: 26.5,
  humidity: 62,
  distance: 85,
  rain: false,
  rainIntensity: 0,
  irDetected: false,
  lcdMessage: "System Ready",
  led1: false,
  led2: false,
  led3: false,
  led4: false,
  buzzer: false,
  deviceStatus: 'Online',
  wifiStrength: -65,
  lastUpdated: new Date().toISOString(),
};

const mockDeviceInfo: DeviceInfo = {
  chipModel: "ESP32-WROOM-32D",
  flashSizeMB: 4,
  freeHeapBytes: 184520,
  cpuFreqMHz: 240,
  sdkVersion: "v4.4.2",
  macAddress: "24:6F:28:AE:C3:0C",
  ipAddress: "192.168.1.150",
  uptimeSeconds: 1240,
  batteryLevel: 98,
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

// Generates slightly fluctuating values to make the mock dashboard look alive and premium
export function generateNextMockData(): IoTPayload {
  const tempDiff = (Math.random() - 0.5) * 0.4;
  const humDiff = Math.round((Math.random() - 0.5) * 2);
  const distDiff = Math.round((Math.random() - 0.5) * 10);
  
  const currentTemp = Math.min(Math.max(currentIoTState.temperature + tempDiff, 22.0), 38.0);
  const currentHum = Math.min(Math.max(currentIoTState.humidity + humDiff, 30), 95);
  let currentDist = Math.min(Math.max(currentIoTState.distance + distDiff, 5), 250);

  // Occasional random events for IR sensor
  let irDetected = currentIoTState.irDetected;
  if (Math.random() < 0.15) {
    irDetected = !irDetected;
  }

  // If object is very close, force IR detection sometimes, or distance critical
  if (irDetected && Math.random() < 0.3) {
    currentDist = Math.min(currentDist, 18); // closer than 20cm
  }

  // Rain dynamics
  let rain = currentIoTState.rain;
  let rainIntensity = currentIoTState.rainIntensity;
  if (Math.random() < 0.08) {
    rain = !rain;
  }
  if (rain) {
    rainIntensity = Math.min(Math.max(rainIntensity + Math.round((Math.random() - 0.5) * 15), 20), 100);
  } else {
    rainIntensity = 0;
  }

  // Automated Actuators logic
  const tempAlert = currentTemp > 30;
  const irAlert = irDetected;
  const rainAlert = rainIntensity > 30;
  const proximityAlert = currentDist < 20;

  // LED States (Concurrently evaluated)
  const led4 = tempAlert;                 // Red LED for High Temp
  const led3 = irAlert;                   // Blue LED for IR Object Detection
  const led2 = proximityAlert;            // Yellow LED for Proximity Warning
  const led1 = (!tempAlert && !irAlert && !rainAlert && !proximityAlert); // Green LED for Normal

  // Buzzer automatic trigger if any alert is active
  const buzzer = tempAlert || irAlert || rainAlert || proximityAlert;

  // LCD Monitor Display Priority System (highest to lowest):
  // 1. High Temperature Alert
  // 2. IR Object Detection
  // 3. Rain Expected Alert
  // 4. Critical Distance Proximity
  // 5. Default/Normal Status
  let lcdMessage = "System Normal";
  if (tempAlert) {
    lcdMessage = "High Temperature";
  } else if (irAlert) {
    lcdMessage = "Object Detected";
  } else if (rainAlert) {
    lcdMessage = "Rain Expected";
  } else if (proximityAlert) {
    lcdMessage = "ALERT: Too Close!";
  } else if (led1 || led2 || led3 || led4) {
    const activeLeds = [];
    if (led1) activeLeds.push("L1");
    if (led2) activeLeds.push("L2");
    if (led3) activeLeds.push("L3");
    if (led4) activeLeds.push("L4");
    lcdMessage = `LEDs: ${activeLeds.join(",")}`;
  }

  // Signal strength fluctuation
  const wifiStrength = Math.min(Math.max(currentIoTState.wifiStrength + Math.round((Math.random() - 0.5) * 4), -85), -35);

  currentIoTState = {
    ...currentIoTState,
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
    lastUpdated: new Date().toISOString()
  };

  return currentIoTState;
}

export function updateMockLed(ledId: number, state: boolean): IoTPayload {
  const ledKey = `led${ledId}` as keyof IoTPayload;
  (currentIoTState as any)[ledKey] = state;
  currentIoTState.lastUpdated = new Date().toISOString();
  return currentIoTState;
}

export function updateMockBuzzer(state: boolean): IoTPayload {
  currentIoTState.buzzer = state;
  currentIoTState.lastUpdated = new Date().toISOString();
  return currentIoTState;
}

export function getMockDeviceInfo(): DeviceInfo {
  return {
    ...mockDeviceInfo,
    uptimeSeconds: mockDeviceInfo.uptimeSeconds + Math.round(performance.now() / 1000)
  };
}

// REST Service Calls
export async function fetchSensorsFromESP32(baseUrl: string): Promise<IoTPayload> {
  const response = await fetch(`${baseUrl}/api/sensors`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch sensor data from ESP32');
  }
  return response.json();
}

export async function fetchDeviceFromESP32(baseUrl: string): Promise<DeviceInfo> {
  const response = await fetch(`${baseUrl}/api/device`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch device info from ESP32');
  }
  return response.json();
}

export async function sendLedCommandToESP32(baseUrl: string, ledId: number, state: boolean): Promise<boolean> {
  const response = await fetch(`${baseUrl}/api/led`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ led: ledId, status: state }),
  });
  return response.ok;
}

export async function sendBuzzerCommandToESP32(baseUrl: string, state: boolean): Promise<boolean> {
  const response = await fetch(`${baseUrl}/api/buzzer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ buzzer: state }),
  });
  return response.ok;
}

// WebSocket client wrapper
export class ESP32WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onMessageCallback: (data: IoTPayload) => void;
  private onStatusChangeCallback: (status: 'Connecting' | 'Connected' | 'Disconnected') => void;
  private shouldReconnect: boolean = true;
  private reconnectInterval: number = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(
    url: string,
    onMessage: (data: IoTPayload) => void,
    onStatusChange: (status: 'Connecting' | 'Connected' | 'Disconnected') => void
  ) {
    this.url = url;
    this.onMessageCallback = onMessage;
    this.onStatusChangeCallback = onStatusChange;
  }

  connect() {
    if (this.ws) {
      this.close();
    }
    
    this.shouldReconnect = true;
    this.onStatusChangeCallback('Connecting');
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.onStatusChangeCallback('Connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload: IoTPayload = JSON.parse(event.data);
          this.onMessageCallback(payload);
        } catch (e) {
          console.error("Failed to parse WS data", e);
        }
      };

      this.ws.onclose = () => {
        this.onStatusChangeCallback('Disconnected');
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WS error", error);
        this.ws?.close();
      };
    } catch (e) {
      console.error("WS connection attempt failed", e);
      this.onStatusChangeCallback('Disconnected');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.shouldReconnect) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  close() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChangeCallback('Disconnected');
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
}
