import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSprint | The Adaptive Coding Arena",
  description: "Enter the SkillSprint Arena — an AI-powered adaptive coding platform. Battle challenges, level up your skills, and dominate the leaderboard.",
  keywords: "coding arena, AI coding, adaptive learning, programming challenges, gamified coding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex pb-16 md:pb-0 noise-overlay">
        {/* Ambient background orbs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #4F9CF9 0%, transparent 70%)' }}
          />
          <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }}
          />
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-[0.025]"
            style={{ background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)' }}
          />
          {/* Subtle grid overlay */}
          <div className="absolute inset-0 cyber-grid" />
        </div>

        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[240px] min-h-screen relative z-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
