"use client";

import React, { useState, useMemo } from "react";
import { useIoT } from "@/context/IoTContext";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { Calendar, Filter, RefreshCw, TrendingUp } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeFilter = 'hour' | 'today' | 'weekly' | 'monthly';

export const AnalyticsView: React.FC = () => {
  const { logs } = useIoT();
  const [filter, setFilter] = useState<TimeFilter>('hour');

  // Seeded historical averages for long-term filters
  const weeklyData = useMemo(() => {
    return {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      temp: [26.4, 27.1, 28.5, 29.2, 27.8, 26.2, 28.0],
      hum: [62, 65, 70, 72, 68, 60, 63],
      dist: [120, 115, 95, 130, 140, 110, 115],
      rain: [5, 12, 45, 80, 20, 0, 8]
    };
  }, []);

  const monthlyData = useMemo(() => {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      temp: [21.5, 22.8, 25.2, 28.4, 31.6, 33.2, 31.0, 30.5, 29.1, 26.8, 24.2, 22.0],
      hum: [45, 48, 52, 58, 62, 75, 80, 78, 72, 65, 55, 48],
      dist: [150, 142, 135, 125, 110, 95, 80, 92, 115, 130, 145, 155],
      rain: [8, 12, 18, 32, 65, 120, 185, 140, 95, 40, 22, 10]
    };
  }, []);

  // Format data based on active filter
  const chartData = useMemo(() => {
    if (filter === 'weekly') {
      return {
        labels: weeklyData.labels,
        temp: weeklyData.temp,
        hum: weeklyData.hum,
        dist: weeklyData.dist,
        rain: weeklyData.rain,
        irCount: [1, 2, 4, 8, 3, 0, 1]
      };
    }
    
    if (filter === 'monthly') {
      return {
        labels: monthlyData.labels,
        temp: monthlyData.temp,
        hum: monthlyData.hum,
        dist: monthlyData.dist,
        rain: monthlyData.rain,
        irCount: [5, 8, 12, 15, 24, 32, 45, 38, 20, 14, 8, 6]
      };
    }

    // Default: 'hour' or 'today' from real logs
    // Hour displays every 2nd log for last 30 readings
    // Today displays last 100 readings aggregated
    const displayLogs = filter === 'hour' ? logs.slice(-30) : logs.slice(-100);
    
    const labels = displayLogs.map(log => {
      const date = new Date(log.lastUpdated);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    });
    
    return {
      labels,
      temp: displayLogs.map(log => log.temperature),
      hum: displayLogs.map(log => log.humidity),
      dist: displayLogs.map(log => log.distance),
      rain: displayLogs.map(log => log.rainIntensity),
      irCount: displayLogs.map(log => log.irDetected ? 1 : 0)
    };
  }, [filter, logs, weeklyData, monthlyData]);

  // Dual temperature & humidity chart options
  const tempHumOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#00C2FF',
          font: { size: 10, weight: 'bold' as const }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: { color: '#94A3B8', font: { size: 10 } }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Humidity (%)',
          color: '#22C55E',
          font: { size: 10, weight: 'bold' as const }
        },
        grid: { drawOnChartArea: false }, // Only show grids for temp
        ticks: { color: '#94A3B8', font: { size: 10 } }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#94A3B8', 
          font: { size: 9 },
          maxTicksLimit: filter === 'hour' ? 8 : filter === 'today' ? 12 : 7
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#E2E8F0', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  const tempHumData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: chartData.temp,
        borderColor: "#00C2FF",
        backgroundColor: "rgba(0, 194, 255, 0.05)",
        yAxisID: 'y',
        tension: 0.3,
        fill: true,
        pointRadius: filter === 'hour' ? 2 : 0,
        borderWidth: 2
      },
      {
        label: "Humidity (%)",
        data: chartData.hum,
        borderColor: "#22C55E",
        backgroundColor: "rgba(34, 197, 150, 0.02)",
        yAxisID: 'y1',
        tension: 0.35,
        fill: false,
        pointRadius: filter === 'hour' ? 2 : 0,
        borderWidth: 2
      }
    ]
  };

  // Ultrasonic distance chart
  const distanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { size: 10 } },
        title: {
          display: true,
          text: 'Distance (cm)',
          color: '#3B82F6',
          font: { size: 10, weight: 'bold' as const }
        }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#94A3B8', 
          font: { size: 9 },
          maxTicksLimit: filter === 'hour' ? 8 : 12
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0F172A',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  };

  const distanceData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Distance (cm)",
        data: chartData.dist,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.07)",
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  // Event timelines (Rain and IR Trigger)
  const eventOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8', font: { size: 10 } },
        title: {
          display: true,
          text: 'Rain Intensity (%) / IR Count',
          color: '#E2E8F0',
          font: { size: 10 }
        }
      },
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#94A3B8', 
          font: { size: 9 },
          maxTicksLimit: filter === 'hour' ? 8 : 12
        }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#E2E8F0', font: { size: 11 } }
      }
    }
  };

  const eventData = {
    labels: chartData.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: "Rain Intensity (%)",
        data: chartData.rain,
        backgroundColor: "rgba(6, 182, 212, 0.6)",
        borderRadius: 4,
        barPercentage: 0.6
      },
      {
        type: 'line' as const,
        label: filter === 'weekly' || filter === 'monthly' ? "IR Barrier Events Count" : "IR Object Detected (1/0)",
        data: chartData.irCount,
        borderColor: "#EF4444",
        borderWidth: 2,
        pointRadius: filter === 'hour' ? 1 : 0,
        tension: 0.1,
        fill: false
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Environmental Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Filter telemetry logs and monitor seasonal trends</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/5 rounded-xl self-stretch sm:self-auto">
          {(['hour', 'today', 'weekly', 'monthly'] as TimeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                filter === type 
                  ? "bg-cyan-500 text-white shadow shadow-cyan-500/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type === 'hour' ? "1 Hour" : type === 'today' ? "Today" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Temp/Hum Large Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              DHT11 Temperature & Relative Humidity
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Dual-Axis Plot</span>
          </div>
          <div className="flex-1 min-h-[300px] h-[300px]">
            <Line data={tempHumData} options={tempHumOptions} />
          </div>
        </div>

        {/* Distance Area Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between min-h-[380px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Ultrasonic Ranging (HC-SR04)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Area Graph</span>
          </div>
          <div className="flex-1 min-h-[300px] h-[300px]">
            <Line data={distanceData} options={distanceOptions} />
          </div>
        </div>

        {/* Rain and IR timeline events */}
        <div className="xl:col-span-3 rounded-2xl border border-white/5 bg-[#121A2A]/40 backdrop-blur-md p-5 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              Rain Drop Sensor & IR Barrier Event Correlation
            </h3>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-slow" />
              <span className="text-[10px] text-slate-400 font-mono">Hybrid Bar/Line Plot</span>
            </div>
          </div>
          <div className="flex-1 min-h-[260px] h-[260px]">
            <Bar data={eventData as any} options={eventOptions as any} />
          </div>
        </div>

      </div>
    </div>
  );
};
