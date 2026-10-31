import "./globals.css";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLocale } from "@/lib/locale";

export const metadata = {
  title: "Kheti Sahay \u2014 Schemes for women farmers",
  description:
    "Government schemes for women farmers across North-East India, organised by state and explained in plain language.",
};

export default function RootLayout({ children }) {
  // The admin panel always stays in English for the admin, regardless of
  // the public language cookie; middleware.js sets this header for every
  // /admin page so this isn't affected by whatever a visitor last chose.
  const forcedToEnglish = headers().get("x-force-locale") === "en";
  const locale = forcedToEnglish ? "en" : getLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body min-h-screen flex flex-col">
        <Header locale={locale} hideLanguageSwitcher={forcedToEnglish} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
