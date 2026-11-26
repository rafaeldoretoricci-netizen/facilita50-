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
    <html lang="pt-BR" suppressHydrationWarning className={`${body.variable} ${display.variable} ${book.variable}`}>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("f50-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);var f=Number(localStorage.getItem("f50-fs"));if(f)document.documentElement.style.setProperty("--fs",f+"px")}catch(e){}`,
          }}
        />
        <Header />
        <main>{children}</main>
        <footer className="foot">
          <div className="wrap">
            <span>Facilita 50+ · Educação tecnológica acessível e segura para todas as idades</span>
            <span>Compra segura com Mercado Pago</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
