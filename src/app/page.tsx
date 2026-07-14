"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Cpu, 
  Activity, 
  Bell, 
  Wifi, 
  Cloud, 
  Smartphone, 
  Thermometer, 
  Compass, 
  CloudRain, 
  Eye, 
  Tv, 
  ShieldAlert
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      title: "Real-Time Telemetry",
      description: "Continuous milliseconds-level sensor polling with auto-reconnecting WebSocket channels.",
      icon: Activity,
      color: "text-cyan-400 border-cyan-500/10 bg-cyan-500/5 hover:border-cyan-500/30"
    },
    {
      title: "Smart Safety Alerts",
      description: "Immediate browser-push notification dispatches when environmental safety thresholds breach.",
      icon: Bell,
      color: "text-rose-400 border-rose-500/10 bg-rose-500/5 hover:border-rose-500/30"
    },
    {
      title: "IoT Architecture",
      description: "Engineered specifically for low-overhead microcontrollers like the ESP32 chip.",
      icon: Cpu,
      color: "text-blue-400 border-blue-500/10 bg-blue-500/5 hover:border-blue-500/30"
    },
    {
      title: "ESP32 Wi-Fi Ready",
      description: "Supports direct client WebSocket connections or backend HTTP REST proxy channels.",
      icon: Wifi,
      color: "text-emerald-400 border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/30"
    },
    {
      title: "Cloud Proxy Integrations",
      description: "Open API endpoint maps ready to sync telemetry with AWS IoT, Firebase or ThingSpeak.",
      icon: Cloud,
      color: "text-indigo-400 border-indigo-500/10 bg-indigo-500/5 hover:border-indigo-500/30"
    },
    {
      title: "Premium Responsive UI",
      description: "Tailored Vercel-style aesthetics looking premium on desktop, tablet, and mobile layouts.",
      icon: Smartphone,
      color: "text-amber-400 border-amber-500/10 bg-amber-500/5 hover:border-amber-500/30"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0B1220] overflow-hidden flex flex-col justify-between selection:bg-cyan-500/35 selection:text-white">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header logo */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-wide text-sm md:text-base leading-none">
            SmartEnv <span className="text-cyan-400">IoT</span>
          </span>
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-cyan-500/5 px-4 py-2 rounded-xl transition duration-300 shadow-md"
        >
          Console
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Hero & Illustration Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 flex-1">
        
        {/* Left: Text Hero details */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-semibold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            ESP32 Microcontroller Project
          </div>
          
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-white tracking-tight leading-tight">
            Smart Environmental <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Monitoring & Safety
            </span>
          </h1>

          <p className="text-base text-slate-400 font-medium max-w-xl leading-relaxed">
            Real-Time Environmental Intelligence Powered by ESP32. Stream humidity levels, raindrop intensity, barrier logs, and distance echoes instantly via WebSockets.
          </p>

          {/* Bullet metrics features */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Temperature Feed
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Humidity Levels
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Rain Detection
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Distance Sonar
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Object Barrier alert
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              GPIO Actuator Control
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <Link 
              href="/dashboard"
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-sm uppercase tracking-wider px-8 py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-95 transition duration-300"
            >
              Open Live Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              
              {/* Pulsing halo background */}
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link
              href="#learn-more"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs md:text-sm font-semibold text-slate-400 hover:text-white px-5 py-3.5 text-center transition"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Right: Breathtaking ESP32 animated board illustration */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          
          {/* Main Glow backdrop */}
          <div className="absolute w-72 h-72 rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none" />

          {/* SVG ESP32 PCB blueprint */}
          <div className="relative w-full max-w-[450px] aspect-[4/3] rounded-3xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 shadow-2xl flex items-center justify-center hover:border-cyan-400/20 transition-all duration-500 group select-none">
            
            {/* Blinking LEDs on board */}
            <div className="absolute top-8 left-[170px] w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#EF4444] animate-ping" />
            <div className="absolute top-8 left-[185px] w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />

            {/* Glowing tracks lanes (SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50 150 L 150 150 M 50 200 L 120 200 L 120 180 M 350 100 L 250 100 L 250 120 M 350 230 L 260 230" fill="none" stroke="#00C2FF" strokeWidth="1.5" strokeDasharray="5, 5" className="animate-[dash_10s_linear_infinite]" />
              <path d="M 220 180 L 220 280 L 120 280" fill="none" stroke="#22C55E" strokeWidth="1" strokeDasharray="3, 3" className="animate-[dash_8s_linear_infinite_reverse]" />
            </svg>

            {/* Simulated ESP32 Silicon Chip */}
            <div className="relative w-40 h-52 bg-[#1E293B] border-2 border-slate-700 rounded-xl p-4 flex flex-col justify-between items-center shadow-lg group-hover:scale-102 transition-transform duration-500">
              {/* Metallic Pins grid */}
              <div className="absolute -left-1.5 top-6 bottom-6 flex flex-col justify-between py-1.5 h-[80%]">
                {[...Array(15)].map((_, i) => <div key={i} className="w-1.5 h-1 bg-slate-400 rounded-r" />)}
              </div>
              <div className="absolute -right-1.5 top-6 bottom-6 flex flex-col justify-between py-1.5 h-[80%]">
                {[...Array(15)].map((_, i) => <div key={i} className="w-1.5 h-1 bg-slate-400 rounded-l" />)}
              </div>

              {/* Metal Shield Shielding */}
              <div className="w-full h-[60%] bg-[#334155] border border-slate-500 rounded-lg p-2.5 flex flex-col justify-between relative shadow-inner">
                {/* WiFi antenna outline */}
                <div className="w-full h-6 border-b-2 border-slate-600 border-dashed mb-1" />
                <div className="text-center text-[10px] font-bold text-white tracking-widest leading-none">ESP32</div>
                <div className="text-center text-[7px] font-mono text-slate-400">DEV MODULE</div>
                <div className="absolute bottom-2 right-2">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="w-full flex items-center justify-between px-1 text-[8px] font-mono text-slate-500 tracking-wider">
                <span>EN</span>
                <span>BOOT</span>
              </div>
            </div>

            {/* Floating Sensor Nodes */}
            {/* Node 1: Temperature */}
            <div className="absolute top-[30px] left-[40px] flex items-center gap-1.5 p-1.5 rounded-xl border border-blue-500/10 bg-blue-900/10 text-blue-400 animate-[bounce_4s_infinite_ease-in-out_delay-1]" style={{ animationDelay: '0.2s' }}>
              <Thermometer className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">DHT11</span>
            </div>

            {/* Node 2: Sonar */}
            <div className="absolute bottom-[30px] left-[50px] flex items-center gap-1.5 p-1.5 rounded-xl border border-sky-500/10 bg-sky-900/10 text-sky-400 animate-[bounce_5s_infinite_ease-in-out_delay-2]" style={{ animationDelay: '0.9s' }}>
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">HC-SR04</span>
            </div>

            {/* Node 3: Rain */}
            <div className="absolute top-[40px] right-[40px] flex items-center gap-1.5 p-1.5 rounded-xl border border-cyan-500/10 bg-cyan-900/10 text-cyan-400 animate-[bounce_4.5s_infinite_ease-in-out_delay-3]" style={{ animationDelay: '0.6s' }}>
              <CloudRain className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">Rain Drop</span>
            </div>

            {/* Node 4: IR Barrier */}
            <div className="absolute bottom-[40px] right-[40px] flex items-center gap-1.5 p-1.5 rounded-xl border border-rose-500/10 bg-rose-900/10 text-rose-400 animate-[bounce_3.8s_infinite_ease-in-out_delay-4]" style={{ animationDelay: '0.1s' }}>
              <Eye className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">IR Barrier</span>
            </div>

            {/* Node 5: 16x2 LCD */}
            <div className="absolute top-[135px] right-[15px] flex items-center gap-1.5 p-1.5 rounded-xl border border-amber-500/10 bg-amber-900/10 text-amber-400 animate-[bounce_4.2s_infinite_ease-in-out_delay-5]" style={{ animationDelay: '0.4s' }}>
              <Tv className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold">LCD I2C</span>
            </div>

          </div>

        </div>

      </main>

      {/* Feature Section */}
      <section id="learn-more" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-white/5 bg-[#0B1220] z-10">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Engineered to Commercial Standards</h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Fully optimized for integration with real environmental sensors over local networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between group text-left ${feat.color}`}
              >
                <div className="space-y-3">
                  <div className="p-2.5 rounded-xl border border-white/5 bg-white/5 w-fit group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#080E1B] py-6 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <div>Built with React • Next.js • TailwindCSS • Chart.js • ESP32</div>
          <div>Smart Environmental System © {new Date().getFullYear()}</div>
        </div>
      </footer>

      {/* Embedded CSS custom Keyframe animations */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

    </div>
  );
}
