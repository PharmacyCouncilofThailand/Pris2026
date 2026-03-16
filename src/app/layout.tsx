import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; // เปลี่ยนฟอนต์ให้ดู Premium สำหรับงาน Conference
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalRefreshRedirect from "@/components/layout/GlobalRefreshRedirect";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Conference 2026 | Pris Web",
  description: "Official Conference Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          {/* Force scroll to top and handle hard-refresh redirects for Hero logic */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if(history.scrollRestoration) history.scrollRestoration="manual";
                window.scrollTo(0,0);
                
                // Only run this redirect logic on actual PAGE LOAD (not SPA navigation)
                if (window.location.pathname !== "/" && !window.name.includes("navigated")) {
                  window.location.href = "/";
                }
                
                if (window.location.pathname === "/") {
                  document.body.classList.add("hero-playing");
                }
              `,
            }}
          />
          <GlobalRefreshRedirect />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
