// app/liff/layout.tsx
import Script from 'next/script';

export default function LiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 w-full overflow-x-hidden">
      {}
      <Script 
        src="https://static.line-scdn.net/liff/edge/2/sdk.js" 
        strategy="beforeInteractive" 
      />
      {children}
    </div>
  );
}