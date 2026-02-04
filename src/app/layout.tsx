import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotori – 핫딜 감별하는 다람쥐",
  description: "크롤러가 수집한 핫딜을 정보 밀도 높게 보여주는 읽기 전용 뷰어",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
      >
        <div className="min-h-dvh bg-background text-foreground">
          <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 [background:radial-gradient(70%_60%_at_15%_-5%,hsl(var(--brand-accent)/0.18)_0%,transparent_60%),radial-gradient(65%_50%_at_85%_0%,hsl(var(--hot-gold)/0.12)_0%,transparent_55%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
