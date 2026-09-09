import type { Metadata } from "next";
import { Gabarito, Inter } from "next/font/google";
import "./globals.css";

const gabarito = Gabarito({
  subsets: ["latin"],
  variable: "--font-gabarito",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "nativeship",
  description: "Something useful is almost ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${gabarito.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
