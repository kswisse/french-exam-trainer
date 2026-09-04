import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Exam Trainer",
  description: "Practice French exams with AI-powered analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
