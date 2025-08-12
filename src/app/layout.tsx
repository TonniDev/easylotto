import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@ui/providers/RootProviders";
import { Navigation } from "@ui/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EasyLotto - Smart Lottery Number Generation",
  description: "Generate intelligent Lotofácil number combinations using advanced mathematical algorithms and historical data analysis. Make informed lottery decisions with data-driven insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh`}
      >
      <RootProviders>
        <div className="dark text-foreground bg-background min-h-full">
          <Navigation />
          <main>
            {children}
          </main>
        </div>
      </RootProviders>
      </body>
    </html>
  );
}
