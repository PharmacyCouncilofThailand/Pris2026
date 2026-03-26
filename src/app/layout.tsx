import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  adjustFontFallback: false,
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "PRIS 2026 | Pharmacy Research and Innovation Symposium",
  description: "Official PRIS 2026 Conference Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}