"use client";

import React, { useState, useMemo } from "react";
import { useIoT, AlertItem } from "@/context/IoTContext";
import { 
  Bell, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Check, 
  Trash2,
  BellOff
} from "lucide-react";

export const AlertCenterView: React.FC = () => {
  const { alerts, clearAlerts } = useIoT();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  
  // Local state to track which alerts have been marked resolved in the UI
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const handleResolveAlert = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical': return <AlertOctagon className="w-5 h-5 text-rose-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'info': return <Info className="w-5 h-5 text-cyan-400" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getAlertClasses = (type: AlertItem['type'], isResolved: boolean) => {
    if (isResolved) {
      return "border-white/5 bg-white/[0.01] opacity-50";
    }
    
    switch (type) {
      case 'critical': 
        return "border-rose-500/30 bg-rose-500/[0.02] shadow-[0_0_15px_rgba(239,68,68,0.02)]";
      case 'warning': 
        return "border-amber-500/20 bg-amber-500/[0.01] shadow-[0_0_15px_rgba(245,158,11,0.01)]";
      case 'info': 
        return "border-cyan-500/20 bg-cyan-500/[0.01]";
      case 'success': 
        return "border-emerald-500/20 bg-emerald-500/[0.01]";
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filter === 'all') return true;
      return alert.type === filter;
    });
  }, [alerts, filter]);

  const activeAlertCount = alerts.filter(a => !resolvedIds.has(a.id)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-rose-500 animate-swing" />
            Safety Alert Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Active safety monitoring logs. {activeAlertCount} unresolved alert{activeAlertCount === 1 ? '' : 's'}.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            className="flex items-center gap-2 border border-white/10 hover:border-rose-500/40 bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all self-stretch sm:self-auto justify-center active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Clear Alarm History
          </button>
        )}
      </div>

      {/* Filter Options */}
      <div className="flex items-center justify-between p-2 bg-[#121A2A]/40 border border-white/5 rounded-2xl">
        <div className="flex items-center gap-1">
          {(['all', 'critical', 'warning', 'info'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filter === type 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type === 'all' ? "All Alerts" : type}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase hidden xs:inline pr-2">
          Real-time Engine Active
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3.5">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isResolved = resolvedIds.has(alert.id);
            return (
              <div
                key={alert.id}
                className={`border rounded-2xl p-4.5 flex gap-4 transition-all duration-300 ${getAlertClasses(alert.type, isResolved)}`}
              >
                {/* Visual Icon Marker */}
                <div className="mt-0.5 shrink-0">
                  {getAlertIcon(alert.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {alert.sensor}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleDateString()} {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={`text-sm ${isResolved ? 'text-slate-500 line-through' : 'text-slate-100 font-medium'}`}>
                    {alert.message}
                  </p>
                </div>

                {/* Resolve Action */}
                <div className="shrink-0 flex items-center justify-center pl-2">
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all ${
                      isResolved 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/10'
                    }`}
                    title={isResolved ? "Mark unresolved" : "Mark resolved"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-5 h-5 text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300">No Alerts Triggered</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All sensors report values inside normal safety thresholds. Alarm sirens are silent.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 1.5s infinite ease-in-out;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};
