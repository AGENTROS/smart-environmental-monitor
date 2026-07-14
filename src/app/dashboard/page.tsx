"use client";

import React, { useState } from "react";
import { IoTProvider } from "@/context/IoTContext";
import { Navigation } from "@/components/Navigation";
import { LiveDashboardView } from "@/components/views/LiveDashboardView";
import { AnalyticsView } from "@/components/views/AnalyticsView";
import { SensorLogsView } from "@/components/views/SensorLogsView";
import { AlertCenterView } from "@/components/views/AlertCenterView";
import { DeviceStatusView } from "@/components/views/DeviceStatusView";
import { SettingsView } from "@/components/views/SettingsView";
import { AboutView } from "@/components/views/AboutView";
import { AnimatePresence, motion } from "framer-motion";

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<string>("live");

  const renderView = () => {
    switch (activeTab) {
      case "live":
        return <LiveDashboardView key="live" />;
      case "analytics":
        return <AnalyticsView key="analytics" />;
      case "logs":
        return <SensorLogsView key="logs" />;
      case "alerts":
        return <AlertCenterView key="alerts" />;
      case "device":
        return <DeviceStatusView key="device" />;
      case "settings":
        return <SettingsView key="settings" />;
      case "about":
        return <AboutView key="about" />;
      default:
        return <LiveDashboardView key="live" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col">
      {/* Header and navigation panels */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main content frame */}
      <div className="flex-1 md:pl-64 pt-2 flex flex-col">
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <IoTProvider>
      <DashboardContent />
    </IoTProvider>
  );
}
