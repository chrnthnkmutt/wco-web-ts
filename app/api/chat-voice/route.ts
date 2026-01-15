import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getDistance } from 'geolib';
import { globalElephantState } from '@/lib/elephantState';


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;
    const userLat = parseFloat(formData.get('lat') as string) || 0;
    const userLng = parseFloat(formData.get('lng') as string) || 0;

    if (!audioBlob) return NextResponse.json({ error: "No audio provided" }, { status: 400 });

    // 1. Get current elephant state
    const { elephantPos } = globalElephantState;
    const [eLat, eLng] = elephantPos;

    // 2. Calculate distance between user and elephant
    const distanceMeters = getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: eLat, longitude: eLng }
    );
    const distKm = (distanceMeters / 1000).toFixed(2);

    // 3. Convert audio Blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const model = 'gemini-2.5-flash';
    
    // Configure the AI request
    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    };

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `คุณคือ 'น้องชบา' AI สาวผู้เชี่ยวชาญจากสำนักอนุรักษ์สัตว์ป่า
                ตำแหน่งช้าง: Lat ${eLat}, Lng ${eLng}
                ตำแหน่งผู้ใช้: Lat ${userLat}, Lng ${userLng}
                ระยะห่าง: ${distKm} กม.
                กฎการตอบ:
                    1. ตอบเฉพาะเรื่องงานอุทยานและสัตว์ป่า
                    2. บอกระยะห่าง ${distKm} กม. เฉพาะเมื่อถามถึงความปลอดภัยหรือพิกัดช้าง และอาจะประเมินความอันตรายจากระยะห่างนี้
                    3. ห้ามใช้ตัวหนาหรือ Markdown
                    4. ตอบกลับด้วยรูปแบบนี้เสมอ:
                       [REPLY]: (คำตอบของคุณ)
                       [QUERY]: (สรุปสั้นๆ ว่าผู้ใช้ถามอะไรจากเสียงที่ได้รับ)
                `
          },
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          }
        ],
      },
    ];

    // 4. Call the AI model to generate content
    const responseStream = await (ai as unknown as { models: { generateContentStream: (config: unknown) => AsyncIterable<{ text?: string }> } }).models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullText = "";

    // 5. Read the streaming response
    for await (const chunk of responseStream) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    // 6. Parsing [REPLY] and [QUERY]
    let aiReply = fullText;
    let userQuery = "Voice Inquiry";

    if (fullText.includes("[REPLY]:")) {
      const parts = fullText.split("[REPLY]:")[1].split("[QUERY]:");
      aiReply = parts[0].trim();
      userQuery = parts[1]?.trim() || "Voice Inquiry";
    }

    return NextResponse.json({ 
      reply_text: aiReply, 
      user_text: userQuery 
    });

  } catch (error: unknown) {
    console.error("AI Assistant Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}