import type { Metadata } from "next";
import { Manrope, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const manrope = Manrope({
  variable: "--font-manrope",
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
      className={`${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[240px] min-h-screen relative z-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
