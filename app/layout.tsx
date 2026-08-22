import type { Metadata } from "next";
import { Cinzel, Crimson_Pro, Tajawal, Nunito } from "next/font/google";
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

// Quantum Majlis uses a friendlier, rounder face than the rest of the company:
// its audience is younger and the material is already intimidating enough.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

// AR brand font: Tajawal. Rounded and modern, so Arabic and English read as
// one voice instead of a serif sitting next to a rounded sans.
const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
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
      <body className={`${cinzel.variable} ${crimsonPro.variable} ${tajawal.variable} ${nunito.variable} antialiased`}
        style={{ fontFamily: "var(--ui)" }}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
