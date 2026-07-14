import { NextRequest, NextResponse } from "next/server";
import { apiIoTState } from "../mockDataStore";

export async function POST(req: NextRequest) {
  try {
    const { led, status } = await req.json();
    if (typeof led === 'number' && led >= 1 && led <= 4 && typeof status === 'boolean') {
      const ledKey = `led${led}` as keyof typeof apiIoTState;
      (apiIoTState as any)[ledKey] = status;
      apiIoTState.lastUpdated = new Date().toISOString();
      return NextResponse.json({ success: true, state: apiIoTState });
    }
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
