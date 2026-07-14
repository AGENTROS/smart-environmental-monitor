"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  IoTPayload, 
  DeviceInfo, 
  generateNextMockData, 
  updateMockLed, 
  updateMockBuzzer,
  getMockDeviceInfo,
  fetchSensorsFromESP32,
  fetchDeviceFromESP32,
  sendLedCommandToESP32,
  sendBuzzerCommandToESP32,
  ESP32WebSocketClient
} from "@/services/esp32Service";

export interface AlertItem {
  id: string;
  timestamp: string;
  sensor: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  resolved: boolean;
}

export interface LogItem extends IoTPayload {
  id: string;
}

interface IoTContextType {
  payload: IoTPayload | null;
  deviceInfo: DeviceInfo | null;
  logs: LogItem[];
  alerts: AlertItem[];
  isMockMode: boolean;
  refreshRate: number; // in ms
  connectionType: 'ws' | 'rest';
  connectionStatus: 'Connecting' | 'Connected' | 'Disconnected';
  wsUrl: string;
  restUrl: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
  
  toggleLed: (ledId: number, state: boolean) => Promise<boolean>;
  toggleBuzzer: (state: boolean) => Promise<boolean>;
  setMockMode: (state: boolean) => void;
  setRefreshRate: (rate: number) => void;
  setConnectionType: (type: 'ws' | 'rest') => void;
  setUrls: (ws: string, rest: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  clearAlerts: () => void;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

// Utility to generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Config state
  const [isMockMode, setIsMockModeState] = useState<boolean>(true);
  const [refreshRate, setRefreshRateState] = useState<number>(2000);
  const [connectionType, setConnectionTypeState] = useState<'ws' | 'rest'>('rest');
  const [wsUrl, setWsUrlState] = useState<string>("ws://192.168.1.150/ws");
  const [restUrl, setRestUrlState] = useState<string>("http://localhost:3000"); // Point to own API by default
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Runtime state
  const [payload, setPayload] = useState<IoTPayload | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Disconnected');
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // WebSocket client ref
  const wsClientRef = useRef<ESP32WebSocketClient | null>(null);

  // Initialize config settings from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMock = localStorage.getItem("iot_mock_mode");
      if (storedMock !== null) setIsMockModeState(storedMock === "true");

      const storedRate = localStorage.getItem("iot_refresh_rate");
      if (storedRate) setRefreshRateState(parseInt(storedRate));

      const storedConnType = localStorage.getItem("iot_conn_type");
      if (storedConnType) setConnectionTypeState(storedConnType as 'ws' | 'rest');

      const storedWsUrl = localStorage.getItem("iot_ws_url");
      if (storedWsUrl) setWsUrlState(storedWsUrl);

      const storedRestUrl = localStorage.getItem("iot_rest_url");
      if (storedRestUrl) setRestUrlState(storedRestUrl);

      const storedNotifs = localStorage.getItem("iot_notifications");
      if (storedNotifs !== null) setNotificationsEnabledState(storedNotifs === "true");

      const storedTheme = localStorage.getItem("iot_theme");
      if (storedTheme) setThemeState(storedTheme as 'dark' | 'light');
    }

    // Pre-populate logs with 60 realistic historical data points (every 2s going back 2 mins)
    const initialLogs: LogItem[] = [];
    let baseTime = Date.now() - 120000;
    let currentTemp = 25.4;
    let currentHum = 60;
    let currentDist = 110;
    let currentRain = false;
    let currentIntensity = 0;
    
    for (let i = 0; i < 60; i++) {
      baseTime += 2000;
      currentTemp += (Math.random() - 0.5) * 0.3;
      currentHum += Math.round((Math.random() - 0.5) * 2);
      currentDist += Math.round((Math.random() - 0.5) * 8);

      currentTemp = Math.min(Math.max(currentTemp, 22), 34);
      currentHum = Math.min(Math.max(currentHum, 40), 80);
      currentDist = Math.min(Math.max(currentDist, 15), 200);

      if (i > 45) { // simulate some rain in recent logs
        currentRain = true;
        currentIntensity = Math.min(currentIntensity + 5, 65);
      } else {
        currentRain = false;
        currentIntensity = 0;
      }

      initialLogs.push({
        id: generateId(),
        temperature: parseFloat(currentTemp.toFixed(1)),
        humidity: currentHum,
        distance: currentDist,
        rain: currentRain,
        rainIntensity: currentIntensity,
        irDetected: i > 25 && i < 35,
        lcdMessage: currentDist < 20 ? "ALERT: Too Close!" : currentRain ? `Rain: ${currentIntensity}%` : "System Normal",
        led1: i % 4 === 0,
        led2: i % 4 === 1,
        led3: i % 4 === 2,
        led4: i % 4 === 3,
        buzzer: currentDist < 20,
        deviceStatus: 'Online',
        wifiStrength: -60 - Math.round(Math.random() * 5),
        lastUpdated: new Date(baseTime).toISOString(),
      });
    }

    setLogs(initialLogs);
    // Set initial active payload
    setPayload(initialLogs[initialLogs.length - 1]);
    setDeviceInfo(getMockDeviceInfo());
    setConnectionStatus('Connected');
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Handle data updates: Append logs and scan for alert triggers
  const processNewData = (data: IoTPayload) => {
    setPayload(data);
    
    // Add to logs rolling array (max 100 items)
    setLogs(prev => {
      const updated = [...prev, { ...data, id: generateId() }];
      if (updated.length > 500) updated.shift();
      return updated;
    });

    // Check alert thresholds
    const newAlerts: Omit<AlertItem, 'id' | 'timestamp' | 'resolved'>[] = [];

    if (data.temperature > 30) {
      newAlerts.push({
        sensor: "DHT11 (Temperature)",
        type: data.temperature > 35 ? 'critical' : 'warning',
        message: `High Temperature Alert: ${data.temperature}°C exceeded limit of 30°C.`
      });
    }
    if (data.humidity > 85) {
      newAlerts.push({
        sensor: "DHT11 (Humidity)",
        type: 'warning',
        message: `High Humidity Alert: ${data.humidity}% is high. Comfort range exceeded.`
      });
    } else if (data.humidity < 30) {
      newAlerts.push({
        sensor: "DHT11 (Humidity)",
        type: 'warning',
        message: `Low Humidity Alert: ${data.humidity}% is too dry.`
      });
    }
    
    if (data.distance < 20) {
      newAlerts.push({
        sensor: "Ultrasonic Sensor",
        type: 'critical',
        message: `Obstacle Critical Alert: Distance is ${data.distance} cm! Immediate collision hazard.`
      });
    } else if (data.distance < 50) {
      newAlerts.push({
        sensor: "Ultrasonic Sensor",
        type: 'warning',
        message: `Obstacle Warning: Distance detected at ${data.distance} cm.`
      });
    }

    if (data.rainIntensity > 30) {
      newAlerts.push({
        sensor: "Rain Sensor",
        type: data.rainIntensity > 50 ? 'critical' : 'warning',
        message: data.rainIntensity > 50 
          ? `Heavy Rain Detected: Intensity is at ${data.rainIntensity}%.` 
          : `Rain Expected: Probability is ${data.rainIntensity}%.`
      });
    } else if (data.rain) {
      newAlerts.push({
        sensor: "Rain Sensor",
        type: 'info',
        message: `Light Rain Detected: Intensity is ${data.rainIntensity}%.`
      });
    }

    if (data.irDetected) {
      newAlerts.push({
        sensor: "IR Barrier Sensor",
        type: 'warning',
        message: "Security Alert: Object Detected near sensor perimeter."
      });
    }

    // Trigger local push notifications if active
    if (newAlerts.length > 0 && notificationsEnabled) {
      // Avoid duplicate alert logs if they occurred within the last 15 seconds for the same sensor
      setAlerts(prevAlerts => {
        let updatedAlerts = [...prevAlerts];
        
        newAlerts.forEach(na => {
          const isDuplicate = prevAlerts.some(pa => 
            pa.sensor === na.sensor && 
            pa.type === na.type && 
            (Date.now() - new Date(pa.timestamp).getTime()) < 15000
          );
          
          if (!isDuplicate) {
            const alertObj: AlertItem = {
              id: generateId(),
              timestamp: new Date().toISOString(),
              resolved: false,
              ...na
            };
            updatedAlerts = [alertObj, ...updatedAlerts];
            
            // Show browser notification if permissions granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(`IoT System Alert: ${na.sensor}`, {
                body: na.message,
                icon: "/favicon.ico"
              });
            }
          }
        });

        if (updatedAlerts.length > 100) updatedAlerts.pop();
        return updatedAlerts;
      });
    }
  };

  // Main Loop Manager: triggers Mocking, REST fetching or WS connectivity
  useEffect(() => {
    if (isMockMode) {
      // Mock mode loop
      setConnectionStatus('Connected');
      setDeviceInfo(getMockDeviceInfo());
      
      const interval = setInterval(() => {
        const mockData = generateNextMockData();
        processNewData(mockData);
        setDeviceInfo(getMockDeviceInfo());
      }, refreshRate);

      return () => clearInterval(interval);
    } else {
      // Live ESP32 Mode
      if (connectionType === 'rest') {
        // Polling REST Endpoints
        setConnectionStatus('Connecting');
        
        const fetchOnce = async () => {
          try {
            const sensorData = await fetchSensorsFromESP32(restUrl);
            processNewData(sensorData);
            setConnectionStatus('Connected');
            
            // Device info is heavier, fetch every 5 loops
            const devInfo = await fetchDeviceFromESP32(restUrl);
            setDeviceInfo(devInfo);
          } catch (e) {
            console.error("REST connection error", e);
            setConnectionStatus('Disconnected');
          }
        };

        fetchOnce(); // First trigger
        const interval = setInterval(fetchOnce, refreshRate);
        
        return () => clearInterval(interval);
      } else {
        // WebSocket live mode
        setConnectionStatus('Connecting');
        
        wsClientRef.current = new ESP32WebSocketClient(
          wsUrl,
          (sensorData) => {
            processNewData(sensorData);
          },
          (status) => {
            setConnectionStatus(status);
            if (status === 'Connected') {
              // Get device info via REST since WS is for fast telemetry
              fetchDeviceFromESP32(restUrl)
                .then(info => setDeviceInfo(info))
                .catch(() => {});
            }
          }
        );
        
        wsClientRef.current.connect();
        
        return () => {
          if (wsClientRef.current) {
            wsClientRef.current.close();
            wsClientRef.current = null;
          }
        };
      }
    }
  }, [isMockMode, refreshRate, connectionType, wsUrl, restUrl]);

  // Request browser notification permissions
  useEffect(() => {
    if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  // Actions
  const toggleLed = async (ledId: number, state: boolean): Promise<boolean> => {
    if (isMockMode) {
      const updated = updateMockLed(ledId, state);
      setPayload({ ...updated });
      return true;
    } else {
      try {
        if (connectionType === 'ws' && wsClientRef.current) {
          // Send via WS
          const success = wsClientRef.current.send({ action: "led", id: ledId, status: state });
          if (success) {
            setPayload(prev => prev ? { ...prev, [`led${ledId}`]: state } : null);
            return true;
          }
        }
        
        // Fallback to REST POST
        const success = await sendLedCommandToESP32(restUrl, ledId, state);
        if (success) {
          setPayload(prev => prev ? { ...prev, [`led${ledId}`]: state } : null);
          return true;
        }
      } catch (e) {
        console.error("Failed to toggle LED", e);
      }
      return false;
    }
  };

  const toggleBuzzer = async (state: boolean): Promise<boolean> => {
    if (isMockMode) {
      const updated = updateMockBuzzer(state);
      setPayload({ ...updated });
      
      // Log manual buzzer trigger
      if (state) {
        setAlerts(prev => [
          {
            id: generateId(),
            timestamp: new Date().toISOString(),
            sensor: "Buzzer Control",
            type: 'info',
            message: "Buzzer manually activated from dashboard.",
            resolved: false
          },
          ...prev
        ]);
      }
      return true;
    } else {
      try {
        if (connectionType === 'ws' && wsClientRef.current) {
          const success = wsClientRef.current.send({ action: "buzzer", status: state });
          if (success) {
            setPayload(prev => prev ? { ...prev, buzzer: state } : null);
            return true;
          }
        }
        
        const success = await sendBuzzerCommandToESP32(restUrl, state);
        if (success) {
          setPayload(prev => prev ? { ...prev, buzzer: state } : null);
          return true;
        }
      } catch (e) {
        console.error("Failed to toggle Buzzer", e);
      }
      return false;
    }
  };

  const setMockMode = (state: boolean) => {
    setIsMockModeState(state);
    localStorage.setItem("iot_mock_mode", String(state));
    // Clear connection state
    if (state) setConnectionStatus('Connected');
  };

  const setRefreshRate = (rate: number) => {
    setRefreshRateState(rate);
    localStorage.setItem("iot_refresh_rate", String(rate));
  };

  const setConnectionType = (type: 'ws' | 'rest') => {
    setConnectionTypeState(type);
    localStorage.setItem("iot_conn_type", type);
  };

  const setUrls = (ws: string, rest: string) => {
    setWsUrlState(ws);
    setRestUrlState(rest);
    localStorage.setItem("iot_ws_url", ws);
    localStorage.setItem("iot_rest_url", rest);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem("iot_notifications", String(enabled));
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
    localStorage.setItem("iot_theme", t);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <IoTContext.Provider value={{
      payload,
      deviceInfo,
      logs,
      alerts,
      isMockMode,
      refreshRate,
      connectionType,
      connectionStatus,
      wsUrl,
      restUrl,
      notificationsEnabled,
      theme,
      toggleLed,
      toggleBuzzer,
      setMockMode,
      setRefreshRate,
      setConnectionType,
      setUrls,
      setNotificationsEnabled,
      setTheme,
      clearAlerts
    }}>
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (context === undefined) {
    throw new Error("useIoT must be used within an IoTProvider");
  }
  return context;
};
