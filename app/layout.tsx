import type { Metadata } from "next";
import { Cinzel, Crimson_Pro, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/NavBar";
import ClientLayout from "@/components/ClientLayout";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

// EN brand fonts: Cinzel (headings) + Crimson Pro (body)
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
});

// AR brand font: Noto Naskh Arabic, classical style, pairs with Cinzel
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CyberMajlis",
  description: "Interactive cybersecurity lessons and simulations.",
  icons: {
    icon: "/logo.png",
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${cinzel.variable} ${crimsonPro.variable} ${notoNaskhArabic.variable} antialiased`}
        style={{ fontFamily: locale === 'ar' ? "var(--font-arabic), serif" : "var(--font-crimson-pro), Georgia, serif" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
