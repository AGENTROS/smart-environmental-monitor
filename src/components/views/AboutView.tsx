"use client";

import React from "react";
import { 
  Cpu, 
  Thermometer, 
  Compass, 
  CloudRain, 
  Eye, 
  Tv, 
  Lightbulb, 
  Volume2, 
  ChevronRight,
  Code2
} from "lucide-react";

export const AboutView: React.FC = () => {
  const hardwareList = [
    {
      name: "ESP32 DevKit V1",
      icon: Cpu,
      pin: "SRAM: 520KB / CPU: 240MHz",
      desc: "The central core microcontroller processing sensor inputs, driving displays, toggling actuators, and hosting the WebSocket server over local Wi-Fi.",
      color: "from-cyan-400 to-blue-500",
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      name: "DHT11 Sensor",
      icon: Thermometer,
      pin: "GPIO 23 (Digital In)",
      desc: "Measures ambient air temperature and humidity via a capacitive humidity sensor and thermistor, sending values as digital signals.",
      color: "from-blue-400 to-indigo-500",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      name: "Ultrasonic HC-SR04",
      icon: Compass,
      pin: "Trig: GPIO 18 | Echo: GPIO 19",
      desc: "Measures distance by transmitting high-frequency ultrasonic sonar waves (40kHz) and measuring the time duration of their reflected echoes.",
      color: "from-sky-400 to-indigo-600",
      accent: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      name: "Rain Drop Sensor",
      icon: CloudRain,
      pin: "Analog: GPIO 34 (ADC In)",
      desc: "Detects water droplets on its nickel-coated sensing pad. Output represents the moisture coverage and precipitation intensity.",
      color: "from-cyan-500 to-teal-400",
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
    },
    {
      name: "IR Barrier Sensor",
      icon: Eye,
      pin: "GPIO 4 (Digital In)",
      desc: "Detects objects within line-of-sight using an infrared transmitter LED and receiver diode, sending a logical HIGH/LOW barrier signal.",
      color: "from-rose-400 to-orange-500",
      accent: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    },
    {
      name: "16x2 LCD Screen",
      icon: Tv,
      pin: "SDA: GPIO 21 | SCL: GPIO 22",
      desc: "Renders alphanumeric system logs locally. Powered by I2C communication interface (PCFs8574 expansion chip) to save microcontroller pins.",
      color: "from-amber-400 to-yellow-600",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      name: "Output LEDs (x4)",
      icon: Lightbulb,
      pin: "GPIO 12, 13, 14, 27",
      desc: "Visual beacon indicators mapping system health thresholds: Green (Normal), Yellow (Obstacle close), Blue (Raining), Red (Temperature warning).",
      color: "from-emerald-400 to-teal-500",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      name: "Piezo Buzzer",
      icon: Volume2,
      pin: "GPIO 25 (PWM Out)",
      desc: "High-pitch acoustic siren. Emits warning frequencies when critical events occur, controlled via PWM duty cycles or digital signals.",
      color: "from-rose-500 to-red-600",
      accent: "text-rose-400 bg-rose-500/10 border-rose-500/20"
    }
  ];

  const payloadSnippet = `{
  "temperature": 29.4,
  "humidity": 67,
  "distance": 38,
  "rain": true,
  "rainIntensity": 72,
  "irDetected": false,
  "lcdMessage": "System Normal",
  "led1": true,
  "led2": false,
  "led3": true,
  "led4": false,
  "buzzer": false,
  "deviceStatus": "Online",
  "wifiStrength": -51,
  "lastUpdated": "2026-07-11T10:30:25Z"
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">About Smart IoT Project</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Under the hood of the Smart Environmental Monitoring & Safety System</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Hardware components grid */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1 mb-2">Hardware Architecture</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardwareList.map((hw, idx) => {
              const Icon = hw.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between group hover:border-white/10 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle color glow backdrops on cards */}
                  <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-gradient-to-br ${hw.color} opacity-[0.03] blur-2xl group-hover:scale-125 transition-transform duration-500`} />

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${hw.color} text-white shadow-lg`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <h4 className="text-sm font-bold text-white">{hw.name}</h4>
                      </div>
                      
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${hw.accent}`}>
                        {hw.pin}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {hw.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 group-hover:text-cyan-400 transition-colors mt-4">
                    <span>Diagnostic Verified</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Integration Payload specifications */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest pl-1 mb-2">API Documentation</h3>

          {/* JSON Payload Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              JSON Data Exchange Format
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The ESP32 pushes updates to the dashboard client formatted as a flat JSON schema. 
              The WebSocket client binds to this telemetry structure for real-time views:
            </p>

            <pre className="p-3.5 bg-slate-950/80 rounded-xl text-[10px] font-mono text-cyan-300 border border-white/5 overflow-x-auto leading-relaxed shadow-inner">
              {payloadSnippet}
            </pre>

            <div className="p-3 bg-white/5 rounded-xl text-[10px] text-slate-400 leading-relaxed border border-white/5">
              💡 <strong>Integrators Note:</strong> Set headers to <code>Content-Type: application/json</code> and ensure standard cross-origin resource sharing (CORS) limits allow requests originating from this host address.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
