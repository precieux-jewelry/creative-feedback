import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Creative Feedback — AI Video Review for Creators",
  description:
    "Upload your short-form video and get AI-powered feedback to improve hooks, retention, and performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
