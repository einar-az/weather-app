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
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-sky-500/25 blur-[120px]" />
          <div className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-indigo-600/20 blur-[110px]" />
          <div className="absolute bottom-0 left-1/3 h-[280px] w-[480px] rounded-full bg-cyan-500/15 blur-[100px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
