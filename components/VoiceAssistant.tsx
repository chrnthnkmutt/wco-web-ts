"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("แตะเพื่อเริ่มสนทนา");
  const [displayText, setDisplayText] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      
      // ล้าง Markdown เหมือนเดิม
      const cleanText = text.replace(/[*#`_]/g, "");
      const msg = new SpeechSynthesisUtterance(cleanText);

      const voices = window.speechSynthesis.getVoices();
      
      const thaiVoice = voices.find(v => 
        v.lang === 'th-TH' || 
        v.lang === 'th_TH' || 
        v.name.toLowerCase().includes('thai')
      );

      if (thaiVoice) {
        msg.voice = thaiVoice;
      } else {
        msg.lang = "th-TH";
      }

      msg.rate = 1.1;
      msg.pitch = 1.1;

      window.speechSynthesis.speak(msg);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        audioChunks.current = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          stream.getTracks().forEach(track => track.stop());
          await sendToAI(audioBlob);
        };
        recorder.start();
        setIsRecording(true);
        setStatus("กำลังฟังอยู่จ้า...");
      } catch {
        setStatus("❌ เข้าถึงไมค์ไม่ได้");
      }
    } else {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatus("น้องชบากำลังคิด...");
    }
  };

  const sendSummaryToLine = async (userQuery: string, aiReply: string) => {
    const winWithLiff = window as unknown as { liff?: { isInClient?: () => boolean; sendMessages?: (messages: unknown[]) => Promise<void> } };
    
    if (winWithLiff.liff?.isInClient?.() && winWithLiff.liff?.sendMessages) {
      try {
        // clean and default texts
        const safeQuery = (userQuery || "สอบถามด้วยเสียง").trim();
        const safeReply = (aiReply || "ขออภัยจ้า น้องชบาประมวลผลไม่สำเร็จ").trim();

        await winWithLiff.liff.sendMessages([
          {
            type: "flex",
            altText: "น้องชบา สรุปการสนทนาให้แล้วจ้า",
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "สรุปการสนทนา 🌿",
                    weight: "bold",
                    color: "#ffffff",
                    size: "sm"
                  }
                ],
                backgroundColor: "#2d5a27"
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: "หัวข้อที่คุย",
                        size: "xs",
                        color: "#8c8c8c",
                        weight: "bold"
                      },
                      {
                        type: "text",
                        text: safeQuery,
                        size: "sm",
                        color: "#333333",
                        wrap: true,
                        margin: "sm"
                      }
                    ]
                  },
                  {
                    type: "separator",
                    margin: "xl"
                  },
                  {
                    type: "box",
                    layout: "vertical",
                    margin: "xl",
                    contents: [
                      {
                        type: "text",
                        text: "คำตอบจากน้องชบา",
                        size: "xs",
                        color: "#8c8c8c",
                        weight: "bold"
                      },
                      {
                        type: "text",
                        text: safeReply,
                        size: "sm",
                        color: "#333333",
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
                    type: "text",
                    text: "กรมอุทยานแห่งชาติ สัตว์ป่า และพันธุ์พืช",
                    size: "xxs",
                    color: "#bcbcbc",
                    align: "center"
                  }
                ]
              }
            }
          }
        ]);
        console.log("Flex Message sent successfully");
      } catch (err) {
        console.error("LINE Messaging Error:", err);
      }
    }
  };

  const sendToAI = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    // Add user location
    formData.append("lat", location.lat.toString());
    formData.append("lng", location.lng.toString());

    try {
      const response = await fetch("/api/chat-voice", { method: "POST", body: formData });
      const data = await response.json();

      if (data.reply_text) {
        setDisplayText(data.reply_text);
        speak(data.reply_text);
        
        // Send summary to LINE chat
        await sendSummaryToLine(data.user_text, data.reply_text);
        
        setStatus("น้องส่งสรุปเข้าแชทให้แล้วนะคะ");
      }
    } catch {
      setStatus("❌ ลองใหม่อีกทีนะ");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700">
      <h2 className="text-2xl font-extralight tracking-widest mb-2 text-white">เจ้าหน้าที่ชบา</h2>
      <p className="font-extralight text-sm mb-12 tracking-wide text-white/70">{status}</p>

      <div className="relative w-32 h-32 mb-10">
        {isRecording && <div className="absolute inset-0 rounded-full bg-[#4CAF50] animate-[ping_1.5s_infinite] opacity-40 scale-[1.8]"></div>}
        <button
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`relative z-10 w-full h-full rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isRecording ? "bg-[#ff4b2b] text-white scale-90" : "bg-white text-[#1a1c1a]"
          } ${isProcessing ? "opacity-30" : ""}`}
        >
          {isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> : isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic size={45} />}
        </button>
      </div>

      {displayText && (
        <div className="w-full mt-4 p-5 bg-white/10 rounded-[25px] border-l-2 border-[#4CAF50] backdrop-blur-md text-white animate-in slide-in-from-top-2">
          <p className="text-[15px] leading-relaxed font-light">{displayText}</p>
        </div>
      )}
    </div>
  );
}

