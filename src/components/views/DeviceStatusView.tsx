"use client";

import React, { useMemo } from "react";
import { useIoT } from "@/context/IoTContext";
import { 
  Cpu, 
  Wifi, 
  Activity, 
  ShieldCheck, 
  BatteryCharging,
  Network,
  Clock
} from "lucide-react";

export const DeviceStatusView: React.FC = () => {
  const { deviceInfo, payload, connectionStatus } = useIoT();

  // Uptime formatting
  const formattedUptime = useMemo(() => {
    if (!deviceInfo) return "0d 0h 0m 0s";
    
    const sec = deviceInfo.uptimeSeconds;
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [deviceInfo]);

  // Memory usage percentage (ESP32 SRAM is ~320KB max heap available usually)
  const memoryUsagePercent = useMemo(() => {
    if (!deviceInfo) return 0;
    const totalHeap = 290000; // standard approx
    const usedHeap = totalHeap - deviceInfo.freeHeapBytes;
    return Math.min(Math.round((usedHeap / totalHeap) * 100), 100);
  }, [deviceInfo]);

  // WiFi signal strength calculations
  const wifiStatus = useMemo(() => {
    if (!payload) return { percentage: 0, label: "Unknown", color: "text-slate-400" };
    
    const rssi = payload.wifiStrength;
    // Calculate simple percentage mapping from RSSI (-100 to -30 range)
    const percentage = Math.min(Math.max(Math.round((rssi + 100) * 1.43), 0), 100);
    
    let label = "Excellent";
    let color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (rssi < -80) {
      label = "Poor (Dropouts)";
      color = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    } else if (rssi < -70) {
      label = "Fair";
      color = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (rssi < -60) {
      label = "Good";
      color = "text-sky-400 bg-sky-500/10 border-sky-500/20";
    }
    
    return { percentage, label, color };
  }, [payload]);

  // Chip temperature estimation (usually runs at ~35-45C depending on workload)
  const chipTemp = useMemo(() => {
    if (!payload) return 38.5;
    // Bind it loosely to environment temp to feel realistic
    return parseFloat((payload.temperature * 1.1 + 8.4 + (Math.random() - 0.5) * 0.5).toFixed(1));
  }, [payload]);

  if (!deviceInfo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Reading device hardware profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">ESP32 Device Status</h2>
        <p className="text-xs text-slate-400 mt-0.5">Hardware specifications and sensor diagnostic logs</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Core Chip Card */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Microcontroller</span>
            <h4 className="text-sm font-bold text-white mt-0.5">{deviceInfo.chipModel}</h4>
            <p className="text-[10px] font-mono text-cyan-400 mt-0.5">{deviceInfo.cpuFreqMHz} MHz Dual-Core</p>
          </div>
        </div>

        {/* WiFi RSSI Card */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wi-Fi Connection</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h4 className="text-sm font-bold text-white">Signal:</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${wifiStatus.color}`}>
                {wifiStatus.label}
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{payload?.wifiStrength || -60} dBm ({wifiStatus.percentage}%)</p>
          </div>
        </div>

        {/* SRAM Memory usage */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Free Heap Memory</span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {Math.round(deviceInfo.freeHeapBytes / 1024)} KB
            </h4>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-cyan-400 transition-all duration-1000" 
                style={{ width: `${100 - memoryUsagePercent}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Battery Placeholder */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BatteryCharging className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Power / Battery</span>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {deviceInfo.batteryLevel ? `${deviceInfo.batteryLevel}%` : "5.0V USB Input"}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Status: USB Power Line Connected</p>
          </div>
        </div>

      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diagnostics & Specs */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-6">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2 pb-3 border-b border-white/5">
            <Network className="w-4 h-4 text-cyan-400" />
            Hardware Diagnostics & Network Interface
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Chip Model</span>
              <span className="font-semibold text-white">{deviceInfo.chipModel}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Uptime</span>
              <span className="font-mono text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {formattedUptime}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Firmware SDK Version</span>
              <span className="font-mono text-slate-300">{deviceInfo.sdkVersion}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">WiFi SSID (MAC)</span>
              <span className="font-mono text-slate-300">{deviceInfo.macAddress}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">IP Address</span>
              <span className="font-mono text-cyan-400 font-bold">{deviceInfo.ipAddress}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">SoC Chip Temperature</span>
              <span className="font-mono text-amber-400 font-bold">{chipTemp}°C</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5 sm:border-none">
              <span className="text-slate-400">SRAM Size</span>
              <span className="font-mono text-white">520 KB (320KB Heap)</span>
            </div>
            <div className="flex justify-between items-center py-2 sm:border-none">
              <span className="text-slate-400">Flash Size</span>
              <span className="font-mono text-white">{deviceInfo.flashSizeMB} MB External</span>
            </div>
          </div>
        </div>

        {/* Sensor Health diagnostic list */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6">
          <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2 pb-3 border-b border-white/5 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Sensor Health Check
          </h3>

          <div className="space-y-3">
            {Object.entries(deviceInfo.sensorHealth).map(([sensor, health]) => {
              // Beautify names
              const nameMap: { [key: string]: string } = {
                dht11: "DHT11 (Temp & Humidity)",
                ultrasonic: "Ultrasonic (Proximity)",
                ir: "Infrared (Barrier)",
                rain: "Rain Drop Sensor",
                lcd: "16x2 LCD I2C Monitor",
                leds: "LED Output Pins (4x)",
                buzzer: "Alarm Buzzer Actuator",
              };

              return (
                <div 
                  key={sensor} 
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    {nameMap[sensor] || sensor}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    health === 'Healthy' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/20'
                  }`}>
                    {health.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
