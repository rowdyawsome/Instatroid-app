import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Instatroid",
  description: "Instatroid — Instagram Tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-neutral-900 min-h-screen font-medium text-neutral-200 antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
