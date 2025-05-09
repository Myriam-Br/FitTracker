import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "FitTracker",
  description: "fitness tracker app ( steps count, calories count and water intake)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}