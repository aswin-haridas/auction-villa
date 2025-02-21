import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/header";

export const inter = Inter({ subsets: ["latin"] });

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
      <body
        className={` ${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
