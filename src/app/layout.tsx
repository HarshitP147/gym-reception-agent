import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import { cn } from "@/lib/utils";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IronPulse Fitness — Dublin's most results-driven gym",
  description:
    "IronPulse Fitness in Ranelagh, Dublin. Expert coaches, 40+ weekly classes, premium equipment and a community that pushes you. Start your free 7-day trial today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(dmSerif.variable, outfit.variable)}>
      <body className="min-h-screen antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
