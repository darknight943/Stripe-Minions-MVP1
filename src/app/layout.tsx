import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stripe Minions MVP1",
  description: "Stripe Minions MVP1 application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="flex justify-end p-4">
          <FeedbackButton />
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
