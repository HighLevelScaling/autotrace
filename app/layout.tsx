import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FluidIslandNav } from "@/components/fluid-island-nav";
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
  title: "AutoTrace — Vehicle History Report",
  description: "Uncover your vehicle's complete story. Instant VIN, license plate, and driver's license lookup with comprehensive DMV, registration, ticket, accident, and service history.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-[100dvh] bg-[#050505] text-white antialiased overflow-x-hidden">
        <div className="noise-overlay" aria-hidden="true" />
        <FluidIslandNav />
        {children}
      </body>
    </html>
  );
}
