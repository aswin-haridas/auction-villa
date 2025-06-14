import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import React from "react";

// export const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AuctionVilla",
  description: "Auktion is good",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
