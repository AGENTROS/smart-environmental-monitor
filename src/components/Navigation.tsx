"use client";

import React, { useState } from "react";
import { useIoT } from "@/context/IoTContext";
import { 
  Activity, 
  LineChart, 
  Database, 
  Bell, 
  Cpu, 
  Settings, 
  Info,
  Menu,
  X,
  Radio,
  Wifi,
  Sparkles,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const tabs = [
  { id: "live", label: "Live Dashboard", icon: Activity },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "logs", label: "Sensor Logs", icon: Database },
  { id: "alerts", label: "Alert Center", icon: Bell, badge: true },
  { id: "device", label: "Device Status", icon: Cpu },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "about", label: "About Project", icon: Info },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { connectionStatus, payload, isMockMode, alerts, connectionType } = useIoT();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Unresolved alerts count
  const alertCount = alerts.filter(a => !a.resolved).length;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return 'bg-emerald-500 shadow-emerald-500/50';
      case 'Connecting': return 'bg-amber-500 shadow-amber-500/50 animate-pulse';
      case 'Disconnected': return 'bg-rose-500 shadow-rose-500/50';
    }
  };

  const getWifiIcon = (rssi: number) => {
    if (rssi >= -50) return <Wifi className="w-4 h-4 text-emerald-400" />;
    if (rssi >= -70) return <Wifi className="w-4 h-4 text-sky-400" />;
    return <Wifi className="w-4 h-4 text-amber-400" />;
  };

  return (
    <>
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 md:hidden text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
              <Cpu className="w-4 h-4 text-white" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-sm md:text-base leading-none">
                SmartEnv <span className="text-cyan-400">IoT</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Smart Monitoring & Safety</p>
            </div>
          </Link>
        </div>

        {/* Right Header Panel */}
        <div className="flex items-center gap-3">
          {/* Mock Badge */}
          {isMockMode && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold tracking-wider uppercase">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              Simulation Mode
            </span>
          )}

          {/* Wi-Fi Indicator */}
          {payload && connectionStatus === 'Connected' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-slate-300">
              {getWifiIcon(payload.wifiStrength)}
              <span className="font-mono text-[11px]">{payload.wifiStrength} dBm</span>
            </div>
          )}

          {/* Connection Status Beacon */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <span className={`w-2 h-2 rounded-full shadow-lg ${getStatusColor()}`} />
            <span className="text-xs text-slate-200 font-medium hidden xs:inline">
              ESP32: {connectionStatus}
            </span>
          </div>

          <Link 
            href="/"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
          >
            Exit
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-[73px] bottom-0 z-30 w-64 hidden md:flex flex-col border-r border-white/5 bg-[#0B1220] p-4 justify-between">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive 
                    ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 shadow-inner" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && alertCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {alertCount}
                  </span>
                )}
                {/* Micro-glow indicator behind active tab */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r-md" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Uptime:</span>
            <span className="font-mono text-slate-200">
              {payload ? "Active" : "Offline"}
            </span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" 
              style={{ width: connectionStatus === 'Connected' ? '100%' : connectionStatus === 'Connecting' ? '50%' : '0%' }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          
          {/* Drawer Menu */}
          <nav className="fixed left-0 top-[73px] bottom-0 z-50 w-72 md:hidden bg-[#0C1425] border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</span>
                {isMockMode && (
                  <span className="px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold">
                    SIMULATION
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isActive 
                          ? "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && alertCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                          {alertCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Connection Mode:</span>
                <span className="font-mono text-cyan-400 capitalize">{isMockMode ? "Mock" : connectionType}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ping Status:</span>
                <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  connectionStatus === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {connectionStatus === 'Connected' ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  );
};
