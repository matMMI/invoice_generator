import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Devis Generator",
  description: "Professional quote and invoice generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={jetbrainsMono.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
