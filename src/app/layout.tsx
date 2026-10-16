import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astra Quant Trader — AI Copilot para Day Trade",
  description: "Sistema institucional de análise quantitativa e gerenciamento de risco de alta frequência powered by GPT-6 Astra.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}