"use client";

import React, { useState, useMemo } from "react";
import { useIoT, LogItem } from "@/context/IoTContext";
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  SlidersHorizontal,
  AlertOctagon,
  Eye,
  CloudRain
} from "lucide-react";

export const SensorLogsView: React.FC = () => {
  const { logs } = useIoT();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAlerts, setFilterAlerts] = useState<"all" | "alert" | "no-alert">("all");
  const [filterRain, setFilterRain] = useState<"all" | "rain" | "dry">("all");
  const [filterIR, setFilterIR] = useState<"all" | "detected" | "clear">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Helper to determine if a log has an alert condition
  const logHasAlert = (log: LogItem) => {
    return (
      log.temperature > 35 ||
      log.humidity > 85 ||
      log.humidity < 30 ||
      log.distance < 50 ||
      log.irDetected
    );
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    // Reverse logs to show newest first
    const reversed = [...logs].reverse();

    return reversed.filter(log => {
      // Search term (searches timestamp, LCD message, temp/hum/dist values)
      const matchesSearch = 
        log.lcdMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(log.lastUpdated).toLocaleDateString().includes(searchTerm) ||
        new Date(log.lastUpdated).toLocaleTimeString().includes(searchTerm) ||
        String(log.temperature).includes(searchTerm) ||
        String(log.humidity).includes(searchTerm) ||
        String(log.distance).includes(searchTerm);

      // Alerts filter
      const hasAlert = logHasAlert(log);
      const matchesAlerts = 
        filterAlerts === "all" ||
        (filterAlerts === "alert" && hasAlert) ||
        (filterAlerts === "no-alert" && !hasAlert);

      // Rain filter
      const matchesRain = 
        filterRain === "all" ||
        (filterRain === "rain" && log.rain) ||
        (filterRain === "dry" && !log.rain);

      // IR filter
      const matchesIR = 
        filterIR === "all" ||
        (filterIR === "detected" && log.irDetected) ||
        (filterIR === "clear" && !log.irDetected);

      return matchesSearch && matchesAlerts && matchesRain && matchesIR;
    });
  }, [logs, searchTerm, filterAlerts, filterRain, filterIR]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  // Adjust page index if out of range after filtering
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Export CSV function
  const exportToCSV = () => {
    const headers = [
      "Timestamp", 
      "Temperature (C)", 
      "Humidity (%)", 
      "Distance (cm)", 
      "Rain Detected", 
      "Rain Intensity (%)", 
      "IR Object Detected", 
      "LCD Message",
      "LED1", "LED2", "LED3", "LED4",
      "Buzzer",
      "WiFi Strength (dBm)",
      "Alert State"
    ];

    const rows = filteredLogs.map(log => [
      new Date(log.lastUpdated).toISOString(),
      log.temperature,
      log.humidity,
      log.distance,
      log.rain ? "Yes" : "No",
      log.rainIntensity,
      log.irDetected ? "Detected" : "Clear",
      `"${log.lcdMessage.replace(/"/g, '""')}"`,
      log.led1 ? "ON" : "OFF",
      log.led2 ? "ON" : "OFF",
      log.led3 ? "ON" : "OFF",
      log.led4 ? "ON" : "OFF",
      log.buzzer ? "ON" : "OFF",
      log.wifiStrength,
      logHasAlert(log) ? "Triggered" : "Normal"
    ]);

    const csvContent = 
      "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `esp32_sensor_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Telemetry Sensor Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">Browse, search, and export logs ingested from your ESP32 board</p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-[#121A2A]/40 border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by value, timestamp or active LCD text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-sm focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Toggle filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
              showFilters 
                ? "bg-white/10 text-white border-cyan-400" 
                : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/5 animate-in fade-in duration-200">
            {/* Alerts filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                Alert Status
              </label>
              <select
                value={filterAlerts}
                onChange={(e) => setFilterAlerts(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Records</option>
                <option value="alert">Alerts Triggered</option>
                <option value="no-alert">Normal State</option>
              </select>
            </div>

            {/* Rain filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                Rain sensor
              </label>
              <select
                value={filterRain}
                onChange={(e) => setFilterRain(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Records</option>
                <option value="rain">Raining</option>
                <option value="dry">Dry</option>
              </select>
            </div>

            {/* IR sensor filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                IR Obstacle Sensor
              </label>
              <select
                value={filterIR}
                onChange={(e) => setFilterIR(e.target.value as any)}
                className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Records</option>
                <option value="detected">Barrier Detected</option>
                <option value="clear">No Barriers</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table Card */}
      <div className="bg-[#121A2A]/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4">Temp (°C)</th>
                <th className="px-5 py-4">Humidity (%)</th>
                <th className="px-5 py-4">Distance (cm)</th>
                <th className="px-5 py-4">Rain Status</th>
                <th className="px-5 py-4">IR Status</th>
                <th className="px-5 py-4">LCD Display Text</th>
                <th className="px-5 py-4 text-center">Alert State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const hasAlert = logHasAlert(log);
                  return (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors font-medium">
                      {/* Timestamp */}
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                        {new Date(log.lastUpdated).toLocaleDateString()} &nbsp;
                        <span className="text-slate-300">{new Date(log.lastUpdated).toLocaleTimeString()}</span>
                      </td>

                      {/* Temp */}
                      <td className="px-5 py-3.5 font-mono text-white">
                        {log.temperature.toFixed(1)}°C
                      </td>

                      {/* Hum */}
                      <td className="px-5 py-3.5 font-mono">
                        {log.humidity}%
                      </td>

                      {/* Distance */}
                      <td className="px-5 py-3.5 font-mono">
                        {log.distance} cm
                      </td>

                      {/* Rain */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.rain ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                          <span className="font-mono">{log.rain ? `${log.rainIntensity}%` : 'Dry'}</span>
                        </div>
                      </td>

                      {/* IR Status */}
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.irDetected ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-slate-400 border border-white/5'
                        }`}>
                          {log.irDetected ? "DETECTED" : "CLEAR"}
                        </span>
                      </td>

                      {/* LCD Text */}
                      <td className="px-5 py-3.5 text-slate-400 italic">
                        &quot;{log.lcdMessage}&quot;
                      </td>

                      {/* Alert State */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                          hasAlert 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {hasAlert ? "Triggered" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                    No sensor records match the active filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-white/5 bg-white/[0.01]">
          <div className="text-[11px] text-slate-400 font-medium">
            Showing <span className="text-slate-200">{filteredLogs.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to{" "}
            <span className="text-slate-200">
              {Math.min(currentPage * rowsPerPage, filteredLogs.length)}
            </span>{" "}
            of <span className="text-slate-200">{filteredLogs.length}</span> sensor feeds
          </div>

          <div className="flex items-center gap-3">
            {/* Rows selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 px-2">
                Page {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
