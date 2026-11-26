import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fraunces, Montserrat } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-body" });
const display = Montserrat({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const book = Fraunces({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-book" });

export const metadata: Metadata = {
  title: { default: "Facilita 50+", template: "%s · Facilita 50+" },
  description: "Livros, cursos e uma comunidade acolhedora para quem tem 50 anos ou mais aprender tecnologia com segurança.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${display.variable} ${book.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <footer className="foot">
          <div className="wrap">
            <span>Facilita 50+ · Educação, tecnologia acessível e segura</span>
            <span>Compra segura com Mercado Pago</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
