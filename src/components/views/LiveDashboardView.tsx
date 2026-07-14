"use client";

import React, { useState } from "react";
import { useIoT } from "@/context/IoTContext";
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Compass, 
  Eye, 
  Tv, 
  Cpu, 
  Radio, 
  Power,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export const LiveDashboardView: React.FC = () => {
  const { 
    payload, 
    toggleLed, 
    toggleBuzzer, 
    connectionStatus, 
    isMockMode, 
    logs 
  } = useIoT();
  
  const [ledLoading, setLedLoading] = useState<{ [key: number]: boolean }>({});
  const [buzzerLoading, setBuzzerLoading] = useState(false);

  if (!payload) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Waiting for sensor data stream...</p>
      </div>
    );
  }

  // Get status functions
  const getTempStatus = (t: number) => {
    if (t > 35) return { label: "CRITICAL", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (t > 30) return { label: "WARM", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (t < 18) return { label: "COLD", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
    return { label: "OPTIMAL", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getHumStatus = (h: number) => {
    if (h > 80) return { label: "HIGH HUMIDITY", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
    if (h < 35) return { label: "DRY AIR", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "COMFORTABLE", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  const getDistStatus = (d: number) => {
    if (d < 20) return { label: "CRITICAL PROXIMITY", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (d < 50) return { label: "WARNING", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { label: "SAFE DISTANCE", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
  };

  // Sparkline data generator for sensors (extract last 12 points)
  const getSparklineData = (sensorKey: 'temperature' | 'humidity' | 'distance' | 'rainIntensity') => {
    const dataPoints = logs.slice(-15).map(log => log[sensorKey]);
    if (dataPoints.length === 0) return "";
    
    const min = Math.min(...dataPoints);
    const max = Math.max(...dataPoints);
    const range = max - min || 1;
    
    const width = 120;
    const height = 30;
    const points = dataPoints.map((val, index) => {
      const x = (index / (dataPoints.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");
    
    return points;
  };

  const handleLedToggle = async (ledId: number, currentState: boolean) => {
    setLedLoading(prev => ({ ...prev, [ledId]: true }));
    await toggleLed(ledId, !currentState);
    setLedLoading(prev => ({ ...prev, [ledId]: false }));
  };

  const handleBuzzerToggle = async (currentState: boolean) => {
    setBuzzerLoading(true);
    await toggleBuzzer(!currentState);
    setBuzzerLoading(false);
  };

  // Radial calculation for temperature circular gauge (r = 40, circumference = 251.2)
  const tempPercentage = Math.min(Math.max((payload.temperature / 50) * 100, 0), 100);
  const tempStrokeDashoffset = 251.2 - (251.2 * tempPercentage) / 100;

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">System Telemetry</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time sensor feeds updating every {logs.length > 1 ? "1s" : "few seconds"}</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-medium text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Last Feed:</span>
          <span className="font-mono text-slate-200">
            {new Date(payload.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        
        {/* TEMPERATURE CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform duration-300">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Temperature</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block ${getTempStatus(payload.temperature).color}`}>
                  {getTempStatus(payload.temperature).label}
                </span>
              </div>
            </div>
            
            {/* Sparkline Spark graph */}
            <div className="h-[30px] w-[120px]">
              <svg className="overflow-visible" width="120" height="30">
                <polyline
                  fill="none"
                  stroke="#00C2FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSparklineData('temperature')}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="space-y-0.5">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter font-mono">
                {payload.temperature}
                <span className="text-xl md:text-2xl text-cyan-400 ml-0.5">°C</span>
              </span>
              <p className="text-[11px] text-slate-400">DHT11 Precision Sensor</p>
            </div>
            
            {/* Circular Gauge */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-white/5" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  className="stroke-cyan-400 transition-all duration-500" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="175.8" 
                  strokeDashoffset={175.8 - (175.8 * (Math.min(payload.temperature, 50) / 50))} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-slate-300">
                  {Math.round((payload.temperature / 50) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HUMIDITY CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Humidity</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block ${getHumStatus(payload.humidity).color}`}>
                  {getHumStatus(payload.humidity).label}
                </span>
              </div>
            </div>
            
            <div className="h-[30px] w-[120px]">
              <svg className="overflow-visible" width="120" height="30">
                <polyline
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSparklineData('humidity')}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="space-y-0.5">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter font-mono">
                {payload.humidity}
                <span className="text-xl md:text-2xl text-emerald-400 ml-0.5">%</span>
              </span>
              <p className="text-[11px] text-slate-400">DHT11 Relative Humidity</p>
            </div>

            {/* Liquid Wave Animation container */}
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center bg-emerald-950/20">
              {/* Liquid Level */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500/60 to-emerald-400/40 transition-all duration-1000 ease-in-out"
                style={{ height: `${payload.humidity}%` }}
              >
                {/* Wave Overlay */}
                <div className="absolute -top-3 left-0 right-0 h-3 overflow-hidden">
                  <svg className="absolute w-[200%] h-full animate-[wave_4s_infinite_linear] fill-emerald-400/40" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 10 C 25 20, 75 0, 100 10 L 100 20 L 0 20 Z" />
                  </svg>
                </div>
              </div>
              <span className="z-10 text-xs font-mono font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {payload.humidity}%
              </span>
            </div>
          </div>
        </div>

        {/* ULTRASONIC SENSOR CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Proximity (HC-SR04)</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block ${getDistStatus(payload.distance).color}`}>
                  {getDistStatus(payload.distance).label}
                </span>
              </div>
            </div>

            <div className="h-[30px] w-[120px]">
              <svg className="overflow-visible" width="120" height="30">
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSparklineData('distance')}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="space-y-0.5">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter font-mono">
                {payload.distance}
                <span className="text-xl md:text-2xl text-blue-400 ml-0.5">cm</span>
              </span>
              <p className="text-[11px] text-slate-400">Ultrasonic Echo Range</p>
            </div>

            {/* Radar Animation */}
            <div className="relative w-16 h-16 rounded-full border border-blue-500/20 flex items-center justify-center overflow-hidden bg-blue-950/10">
              {/* Radar Grid circles */}
              <div className="absolute inset-2 rounded-full border border-blue-500/10" />
              <div className="absolute inset-4 rounded-full border border-blue-500/5" />
              
              {/* Radar Scan Line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-500/30 origin-center animate-[spin_3s_linear_infinite]" />
              
              {/* Radar Blip */}
              {payload.distance < 50 && (
                <div className={`absolute w-2.5 h-2.5 rounded-full ${
                  payload.distance < 20 ? 'bg-red-500 animate-ping' : 'bg-amber-500 animate-pulse'
                }`} />
              )}
              
              <span className="z-10 text-[9px] font-bold text-slate-300 bg-[#0c1424]/60 px-1 py-0.5 rounded font-mono">
                {payload.distance}cm
              </span>
            </div>
          </div>
        </div>

        {/* RAIN DROP CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-cyan-500/20 transition-all duration-300 group">
          {/* Falling raindrops overlay when raining */}
          {payload.rain && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute w-[1px] h-4 bg-cyan-400 left-10 animate-[rainFall_0.8s_infinite_linear_delay-1]" style={{ animationDelay: '0.1s' }} />
              <div className="absolute w-[1px] h-4 bg-cyan-400 left-28 animate-[rainFall_1.1s_infinite_linear_delay-2]" style={{ animationDelay: '0.5s' }} />
              <div className="absolute w-[1px] h-4 bg-cyan-400 left-52 animate-[rainFall_0.9s_infinite_linear_delay-3]" style={{ animationDelay: '0.3s' }} />
              <div className="absolute w-[1px] h-4 bg-cyan-400 left-72 animate-[rainFall_1.2s_infinite_linear_delay-4]" style={{ animationDelay: '0.7s' }} />
              <div className="absolute w-[1px] h-4 bg-cyan-400 left-90 animate-[rainFall_0.7s_infinite_linear_delay-5]" style={{ animationDelay: '0.2s' }} />
            </div>
          )}

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 ${
                payload.rain 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}>
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Rain Sensor</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block ${
                  payload.rain 
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 animate-pulse' 
                    : 'text-slate-400 bg-white/5 border-white/5'
                }`}>
                  {payload.rain ? "RAIN DETECTED" : "NO RAIN"}
                </span>
              </div>
            </div>

            <div className="h-[30px] w-[120px]">
              <svg className="overflow-visible" width="120" height="30">
                <polyline
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getSparklineData('rainIntensity')}
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="space-y-0.5">
              <span className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter font-mono">
                {payload.rainIntensity}
                <span className="text-xl md:text-2xl text-cyan-400 ml-0.5">%</span>
              </span>
              <p className="text-[11px] text-slate-400">Precipitation / Rain Intensity</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 block mb-1">State:</span>
              <span className={`px-2.5 py-1.5 rounded-xl font-mono font-bold text-xs uppercase ${
                payload.rain ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-500'
              }`}>
                {payload.rainIntensity > 70 ? "Heavy" : payload.rainIntensity > 30 ? "Medium" : payload.rain ? "Light Drizzle" : "Dry"}
              </span>
            </div>
          </div>
        </div>

        {/* IR BARRIER SENSOR CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-rose-500/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 ${
                payload.irDetected 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-white/5 text-slate-400 border border-white/5'
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Infrared Sensor</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block ${
                  payload.irDetected 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' 
                    : 'text-slate-400 bg-white/5 border-white/5'
                }`}>
                  {payload.irDetected ? "BARRIER DETECTED" : "CLEAR"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="space-y-0.5">
              <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-none block">
                {payload.irDetected ? "OBJECT" : "NO OBJECT"}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Obstacle Detection Trigger</p>
            </div>

            {/* Ripple Pulse Animation */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              {payload.irDetected ? (
                <>
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-[ping_1.5s_infinite]" />
                  <div className="absolute inset-2 rounded-full bg-rose-500/30 animate-[ping_2s_infinite]" />
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 16x2 LCD CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform duration-300">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">16x2 LCD Monitor</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/10 font-bold mt-1 inline-block">
                  I2C CONNECTED
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            {/* Retro LCD Display Screen */}
            <div className="bg-[#1D2B1E] border-2 border-slate-700/80 rounded-xl p-3 shadow-inner relative overflow-hidden font-mono text-emerald-400 tracking-widest text-sm flex flex-col justify-center min-h-[56px]">
              {/* LCD Backlight Glow */}
              <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
              
              <div className="leading-tight select-none">
                <div className="uppercase font-semibold drop-shadow-[0_0_2px_#34D399]">
                  {payload.lcdMessage}
                </div>
                <div className="text-[11px] text-emerald-500/50 mt-0.5">
                  IP: 192.168.1.188
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-right">Physical Liquid Crystal Display</p>
          </div>
        </div>

      </div>

      {/* Control Board Section (LEDs & Buzzer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* LED Control Panel */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              GPIO Actuator Controls
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Toggle digital output pins (5V) on the ESP32 chip</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* LED 1 */}
            <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              payload.led1 
                ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                : 'bg-white/5 border-white/5'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${payload.led1 ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-slate-600'}`} />
                  <h4 className="text-sm font-semibold text-slate-200">LED 1 (Green)</h4>
                </div>
                <p className="text-[11px] text-slate-400">Normal System Status Indicator</p>
              </div>
              <button
                disabled={ledLoading[1]}
                onClick={() => handleLedToggle(1, payload.led1)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  payload.led1 
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/10' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {ledLoading[1] ? "..." : payload.led1 ? "ON" : "OFF"}
              </button>
            </div>

            {/* LED 2 */}
            <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              payload.led2 
                ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                : 'bg-white/5 border-white/5'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${payload.led2 ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#F59E0B]' : 'bg-slate-600'}`} />
                  <h4 className="text-sm font-semibold text-slate-200">LED 2 (Yellow)</h4>
                </div>
                <p className="text-[11px] text-slate-400">Obstacle Proximity Warning</p>
              </div>
              <button
                disabled={ledLoading[2]}
                onClick={() => handleLedToggle(2, payload.led2)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  payload.led2 
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/10' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {ledLoading[2] ? "..." : payload.led2 ? "ON" : "OFF"}
              </button>
            </div>

            {/* LED 3 */}
            <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              payload.led3 
                ? 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_rgba(0,194,255,0.05)]' 
                : 'bg-white/5 border-white/5'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${payload.led3 ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_#00C2FF]' : 'bg-slate-600'}`} />
                  <h4 className="text-sm font-semibold text-slate-200">LED 3 (Blue)</h4>
                </div>
                <p className="text-[11px] text-slate-400">Rain Droplets Detection Alert</p>
              </div>
              <button
                disabled={ledLoading[3]}
                onClick={() => handleLedToggle(3, payload.led3)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  payload.led3 
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/10' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {ledLoading[3] ? "..." : payload.led3 ? "ON" : "OFF"}
              </button>
            </div>

            {/* LED 4 */}
            <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
              payload.led4 
                ? 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                : 'bg-white/5 border-white/5'
            }`}>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${payload.led4 ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_#EF4444]' : 'bg-slate-600'}`} />
                  <h4 className="text-sm font-semibold text-slate-200">LED 4 (Red)</h4>
                </div>
                <p className="text-[11px] text-slate-400">System High Temp / Fire Alert</p>
              </div>
              <button
                disabled={ledLoading[4]}
                onClick={() => handleLedToggle(4, payload.led4)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  payload.led4 
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/10' 
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                {ledLoading[4] ? "..." : payload.led4 ? "ON" : "OFF"}
              </button>
            </div>

          </div>
        </div>

        {/* BUZZER CARD */}
        <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 ${
          payload.buzzer 
            ? 'bg-rose-950/10 border-rose-500/30 shadow-[0_0_20px_rgba(239,68,68,0.06)]' 
            : 'bg-[#121A2A]/40 border-white/5'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {payload.buzzer ? <Volume2 className="w-5 h-5 text-rose-500 animate-bounce" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                Active Alarm Buzzer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-frequency acoustic audio warning</p>
            </div>
            
            <button
              disabled={buzzerLoading}
              onClick={() => handleBuzzerToggle(payload.buzzer)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-300 ${
                payload.buzzer 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {buzzerLoading ? "..." : payload.buzzer ? "FORCE SILENT" : "TEST SIREN"}
            </button>
          </div>

          <div className="my-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className={`text-2xl font-black font-mono tracking-wide ${payload.buzzer ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>
                {payload.buzzer ? "SIREN ACTIVE" : "SILENT"}
              </span>
              <div className="flex flex-col text-[10px] text-slate-400 space-y-0.5">
                <span>Trigger Reason: {payload.distance < 20 ? "Critical proximity (<20cm)" : payload.temperature > 35 ? "High heat alarm" : "System Manual Check"}</span>
                <span>Last Event: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Soundwave animation */}
            <div className="flex items-center gap-0.5 h-8">
              <div className={`w-0.5 bg-rose-500 rounded-full transition-all ${payload.buzzer ? 'animate-[waveBar_0.5s_infinite_ease-in-out_delay-1] h-6' : 'h-1.5'}`} style={{ animationDelay: '0.1s' }} />
              <div className={`w-0.5 bg-rose-500 rounded-full transition-all ${payload.buzzer ? 'animate-[waveBar_0.7s_infinite_ease-in-out_delay-2] h-8' : 'h-2'}`} style={{ animationDelay: '0.3s' }} />
              <div className={`w-0.5 bg-rose-500 rounded-full transition-all ${payload.buzzer ? 'animate-[waveBar_0.6s_infinite_ease-in-out_delay-3] h-4' : 'h-1'}`} style={{ animationDelay: '0.2s' }} />
              <div className={`w-0.5 bg-rose-500 rounded-full transition-all ${payload.buzzer ? 'animate-[waveBar_0.8s_infinite_ease-in-out_delay-4] h-7' : 'h-2.5'}`} style={{ animationDelay: '0.5s' }} />
              <div className={`w-0.5 bg-rose-500 rounded-full transition-all ${payload.buzzer ? 'animate-[waveBar_0.5s_infinite_ease-in-out_delay-5] h-5' : 'h-1.5'}`} style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-white/5 border border-white/5 p-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Automatic safety shutdown triggers if distance &lt; 20cm or temperature &gt; 35°C.</span>
          </div>
        </div>

      </div>

      {/* Global CSS custom keyframes for waves, raindrops and soundwave bar animations */}
      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          25% { opacity: 0.8; }
          75% { opacity: 0.8; }
          100% { transform: translateY(120px); opacity: 0; }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};
