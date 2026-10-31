import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLocale } from "@/lib/locale";

export const metadata = {
  title: "Kheti Sahay \u2014 Schemes for women farmers",
  description:
    "Government schemes for women farmers across North-East India, organised by state and explained in plain language.",
};

export default function RootLayout({ children }) {
  const locale = getLocale();

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
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
