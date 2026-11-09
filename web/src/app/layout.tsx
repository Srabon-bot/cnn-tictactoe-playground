import type { Metadata } from "next";
import { Figtree, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-instrument",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TicTacLearn",
    template: "%s | TicTacLearn",
  },
  description:
    "Three convolutional networks learn tic-tac-toe. Play the underfit, overfit and steady models, and see the measurements behind each one.",
  applicationName: "TicTacLearn",
  keywords: [
    "tic-tac-toe",
    "convolutional neural network",
    "machine learning education",
    "TensorFlow",
    "Keras",
  ],
  openGraph: {
    title: "TicTacLearn",
    description:
      "Three convolutional networks learn tic-tac-toe. Play all three and read the measurements.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${figtree.variable} ${jetbrains.variable}`}
    >
      <body>
        <div className="site-shell">
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
