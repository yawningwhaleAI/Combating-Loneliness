import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { DemoGuide } from "@/components/demo/demo-guide";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: "After Hours",
  description: "A social marketplace built around your free time. Discover experiences and compatible company when you're actually free.",
};

export const viewport: Viewport = { themeColor: "#141a33" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${manrope.variable} ${jetbrains.variable} antialiased`}>
        {children}
        <DemoGuide />
        <Toaster position="top-center" richColors closeButton toastOptions={{ style: { fontFamily: "var(--font-manrope)" } }} />
      </body>
    </html>
  );
}
