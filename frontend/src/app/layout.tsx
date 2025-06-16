import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/Providers";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { ChatWidget } from "../components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InterviewPro | Recruitment Interview Platform",
  description: "A comprehensive platform for managing technical recruitment interviews, coding assessments, and candidate evaluations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          {/* <ChatWidget position="bottom-right" /> */}
        </Providers>
      </body>
    </html>
  );
}
