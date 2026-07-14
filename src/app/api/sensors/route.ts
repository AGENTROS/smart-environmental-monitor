import { NextResponse } from "next/server";
import { apiIoTState, updateServerState } from "../mockDataStore";

export async function GET() {
  // Update state to simulate live updates on every request
  updateServerState();
  
  return NextResponse.json(apiIoTState);
}
