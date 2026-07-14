import { NextResponse } from "next/server";
import { apiDeviceInfo } from "../mockDataStore";

export async function GET() {
  // Update uptime in real-time
  const uptime = apiDeviceInfo.uptimeSeconds + Math.round(performance.now() / 1000);
  return NextResponse.json({
    ...apiDeviceInfo,
    uptimeSeconds: uptime,
  });
}
