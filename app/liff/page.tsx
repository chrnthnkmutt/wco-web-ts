"use client";

import { useEffect, useState } from "react";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function LiffPage() {
  const [isLiffReady, setIsLiffReady] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      // wait for LIFF SDK to load
      const checkLiff = setInterval(async () => {
        const winWithLiff = window as unknown as { liff?: unknown };
        if (winWithLiff.liff) {
          clearInterval(checkLiff);
          try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
            if (!liffId) return;
            
            const winLiff = window as unknown as { liff: { init: (config: { liffId: string }) => Promise<void>; isLoggedIn: () => boolean; login: () => void } };
            await winLiff.liff.init({ liffId });
            if (!winLiff.liff.isLoggedIn()) {
              winLiff.liff.login();
            } else {
              setIsLiffReady(true);
            }
          } catch (err) { console.error("LIFF Init Error:", err); }
        }
      }, 100);
    };
    initLiff();
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen flex flex-col items-center justify-center p-6 overflow-hidden" 
         style={{ backgroundColor: '#1a1c1a', backgroundImage: 'radial-gradient(circle at 50% -20%, #2d5a27 0%, #1a1c1a 80%)', fontFamily: "'Kanit', sans-serif" }}>
      
      <div className="w-full max-w-[400px] h-[600px] flex flex-col items-center justify-center"
           style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '40px', padding: '40px 20px' }}>
        
        {isLiffReady ? <VoiceAssistant /> : <div className="text-white animate-pulse">ปลุกน้องชบา...🌿</div>}
      </div>
    </div>
  );
}