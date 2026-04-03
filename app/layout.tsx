import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Weather — city forecast",
  description: "Search cities with live suggestions and a seven-day forecast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-slate-950 font-sans text-white antialiased`}
      >
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
