// lib/lineMessaging.ts

export const pushFlexToAdmin = async (
  targetUserId: string, 
  userQuery: string, 
  distKm: string, 
  status: string,
  userLat: number,
  userLng: number
) => {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  // Check for missing configurations
  if (!token) {
    console.error("❌ LINE_CHANNEL_ACCESS_TOKEN is missing in .env");
    return;
  }
  if (!targetUserId) {
    console.error("❌ targetUserId is missing");
    return;
  }

  // Construct Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${userLat},${userLng}`;

  const flexContents = {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        { 
          type: "text", 
          text: "🚨 รายงานพบเหตุช้างป่า", 
          weight: "bold", 
          color: "#ffffff", 
          size: "md" 
        }
      ],
      backgroundColor: "#FF4B2B" 
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                { type: "text", text: "ระยะห่าง", color: "#aaaaaa", size: "sm", flex: 2 },
                { 
                  type: "text", 
                  text: `${distKm} กม.`, 
                  wrap: true, 
                  color: "#333333", 
                  size: "sm", 
                  flex: 4, 
                  weight: "bold" 
                }
              ]
            },
            {
              type: "box",
              layout: "baseline",
              spacing: "sm",
              contents: [
                { type: "text", text: "สถานะช้าง", color: "#aaaaaa", size: "sm", flex: 2 },
                { 
                  type: "text", 
                  text: status || "ไม่ระบุสถานะ", 
                  wrap: true, 
                  color: "#333333", 
                  size: "sm", 
                  flex: 4 
                }
              ]
            }
          ]
        },
        { type: "separator", margin: "xl" },
        {
          type: "box",
          layout: "vertical",
          margin: "xl",
          contents: [
            { 
              type: "text", 
              text: "สิ่งที่ผู้ใช้สอบถาม/สถานการณ์:", 
              size: "xs", 
              color: "#8c8c8c", 
              weight: "bold" 
            },
            { 
              type: "text", 
              text: userQuery || "ไม่มีข้อมูลสอบถาม", 
              size: "sm", 
              color: "#555555", 
              wrap: true, 
              margin: "sm"
            }
          ]
        }
      ]
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "เปิดแผนที่นำทาง",
            uri: googleMapsUrl
          },
          style: "primary",
          color: "#1B4D3E"
        }
      ]
    }
  };

  try {
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        to: targetUserId,
        messages: [
          { 
            type: "flex", 
            altText: "🚨 แจ้งเตือนพบช้างป่าใกล้ตำแหน่งคุณ!", 
            contents: flexContents 
          }
        ]
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ LINE API Error Response:", JSON.stringify(result, null, 2));
    } else {
      console.log("✅ LINE Notification sent successfully!");
    }
  } catch (error) {
    console.error("❌ Messaging API Error:", error);
  }
};