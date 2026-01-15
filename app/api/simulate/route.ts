// app/api/simulate/route.ts
import { NextResponse } from 'next/server';
import { globalElephantState } from '@/lib/elephantState';
import { pushFlexToAdmin } from '@/lib/lineMessaging';
import { getDistance } from 'geolib';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { lat, lng, status, threatLevel, userLat, userLng } = data;

    globalElephantState.elephantPos = [lat, lng];
    globalElephantState.status = status;
    globalElephantState.threatLevel = threatLevel;

    let distKm = "0.00";
    if (userLat && userLng) {
      const distanceMeters = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: lat, longitude: lng }
      );
      distKm = (distanceMeters / 1000).toFixed(2);
    }

    const adminId = process.env.MY_LINE_USER_ID;
    if (adminId && threatLevel !== "LOW") {
      await pushFlexToAdmin(
        adminId, 
        "ระบบจำลองสถานการณ์ (Real-time Distance)", 
        distKm,
        status, 
        userLat || 0, 
        userLng || 0
      );
    }
    
    return NextResponse.json({ success: true, distance: distKm });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}