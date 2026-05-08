import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalRefreshRedirect from "@/components/layout/GlobalRefreshRedirect";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

type Locale = (typeof routing.locales)[number];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if(history.scrollRestoration) history.scrollRestoration="manual";
              window.scrollTo(0,0);
              
              const p = window.location.pathname.replace(/\\/$/, "");
              if (p === "" || p === "/en" || p === "/th") {
                document.body.classList.add("hero-playing");
              }
            `,
          }}
        />
        <GlobalRefreshRedirect />
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' } }} />
        <Header />
        {children}
        <Footer />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
