import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sansFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skindrug Gist | Skincare, Without the Guesswork",
  description: "Honest, personal skincare guidance. Book a free consultation and get a routine that makes sense for your skin.",
  openGraph: {
    title: "Skindrug Gist | Skincare, Without the Guesswork",
    description: "Honest, personal skincare guidance, skin assessments, and a curated skincare marketplace.",
    siteName: "Skindrug Gist",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Skindrug Gist | Skincare, Without the Guesswork",
    description: "Honest, personal skincare guidance and skin assessments.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
