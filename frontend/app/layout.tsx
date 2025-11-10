import "./globals.css";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Stellex — Trailing/Trigger Orders (Testnet)",
  description: "Create and manage Soroban orders with Soroswap + Reflector on Stellar Testnet."
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Navbar />
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  );
}


