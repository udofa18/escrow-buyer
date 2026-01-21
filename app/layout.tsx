import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalErrorHandler } from "@/lib/error-handler";

const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.ttf",
  variable: "--font-satoshi",
  weight: "100 900",
  display: "swap",
});

const clash = localFont({
  src: "../fonts/clashfont/Fonts/TTF/ClashDisplay-Variable.ttf",
  variable: "--font-clash",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noir Essentials - Product Store",
  description: "Premium products store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="px-[16px] py-[56px]   overflow-scroll">
      <body className={` ${satoshi.variable} ${clash.variable} `}>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  );
}
