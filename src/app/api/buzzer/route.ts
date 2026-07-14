import { NextRequest, NextResponse } from "next/server";
import { apiIoTState } from "../mockDataStore";

export async function POST(req: NextRequest) {
  try {
    const { buzzer } = await req.json();
    if (typeof buzzer === 'boolean') {
      apiIoTState.buzzer = buzzer;
      apiIoTState.lastUpdated = new Date().toISOString();
      return NextResponse.json({ success: true, state: apiIoTState });
    }
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
