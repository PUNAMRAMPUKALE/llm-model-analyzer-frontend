import "./globals.css";
import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider"; // <-- make sure this path is correct

export const metadata: Metadata = {
  title: "LLM Model Analyzer",
  description: "Analyze LLM runs & response quality",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
