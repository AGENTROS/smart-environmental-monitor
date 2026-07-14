"use client";

import React, { useState } from "react";
import { useIoT } from "@/context/IoTContext";
import { 
  Settings, 
  Wifi, 
  Sparkles, 
  Bell, 
  Sun, 
  Moon, 
  Save, 
  Info,
  Link2
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const {
    isMockMode,
    refreshRate,
    connectionType,
    wsUrl,
    restUrl,
    notificationsEnabled,
    theme,
    setMockMode,
    setRefreshRate,
    setConnectionType,
    setUrls,
    setNotificationsEnabled,
    setTheme
  } = useIoT();

  // Local state for URLs to avoid updating context on every keystroke
  const [localWsUrl, setLocalWsUrl] = useState(wsUrl);
  const [localRestUrl, setLocalRestUrl] = useState(restUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveUrls = (e: React.FormEvent) => {
    e.preventDefault();
    setUrls(localWsUrl, localRestUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">Configure network endpoints, alert levels, and dashboard preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core settings form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulation vs Hardware selection */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
              Environment Simulation
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Enable Virtual Mock Data</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generates fluctuating sensor metrics offline. Toggle off to connect to a physical ESP32 board.
                </p>
              </div>
              <button
                onClick={() => setMockMode(!isMockMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isMockMode ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isMockMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Network configuration */}
          {!isMockMode && (
            <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-6 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                <Wifi className="w-4.5 h-4.5 text-cyan-400" />
                ESP32 WiFi Integration Parameters
              </h3>

              <div className="space-y-4">
                {/* Select REST vs WS */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Telemetry Stream Protocol</label>
                  <div className="grid grid-cols-2 gap-3 p-1 bg-white/5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setConnectionType('rest')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        connectionType === 'rest' 
                          ? 'bg-cyan-500 text-white shadow shadow-cyan-500/10' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      HTTP REST Poll
                    </button>
                    <button
                      type="button"
                      onClick={() => setConnectionType('ws')}
                      className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        connectionType === 'ws' 
                          ? 'bg-cyan-500 text-white shadow shadow-cyan-500/10' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Websocket Push (Real-time)
                    </button>
                  </div>
                </div>

                {/* Input URLs */}
                <form onSubmit={handleSaveUrls} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">HTTP Base Endpoint (REST)</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={localRestUrl}
                        onChange={(e) => setLocalRestUrl(e.target.value)}
                        placeholder="http://192.168.1.150"
                        className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Websocket Endpoint URL (WS)</label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={localWsUrl}
                        onChange={(e) => setLocalWsUrl(e.target.value)}
                        placeholder="ws://192.168.1.150/ws"
                        className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition shadow-lg shadow-cyan-500/10 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    Save Network Configuration
                  </button>

                  {saveSuccess && (
                    <p className="text-xs text-emerald-400 text-center font-semibold animate-pulse">
                      Network settings updated in local state storage!
                    </p>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* Telemetry settings */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings className="w-4.5 h-4.5 text-cyan-400" />
              Telemetry Feed Preferences
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Sensor Poll Interval</span>
                <span className="font-mono text-cyan-400 font-bold">{refreshRate / 1000} seconds</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={refreshRate}
                onChange={(e) => setRefreshRate(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>1 SEC (AGGRESSIVE)</span>
                <span>15 SEC (STABLE)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar settings */}
        <div className="space-y-6">
          
          {/* Notifications Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className="w-4.5 h-4.5 text-rose-400" />
              Notifications
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Alert Browser Push</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Sends standard desktop notifications when values breach critical bounds.
                </p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  notificationsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <Sun className="w-4.5 h-4.5 text-amber-400" />
              Dashboard Theme
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  theme === 'dark' 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Dark Mode</span>
              </button>
              
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                  theme === 'light' 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Light Mode</span>
              </button>
            </div>
          </div>

          {/* Integration info */}
          <div className="rounded-2xl border border-white/5 bg-[#121A2A]/20 p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              ESP32 Integration Guide
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              To wire a physical ESP32 to this application, upload an ESP32 sketch setting up a web server.
              Ensure CORS headers are enabled on the ESP32 server to allow fetch calls from localhost. 
              The ESP32 payload must match the format outline in the <strong>About page</strong>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
