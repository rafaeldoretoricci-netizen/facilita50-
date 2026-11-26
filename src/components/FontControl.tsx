"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** Botões de acessibilidade: tamanho da letra (A− / A+) e tela clara ou escura. */
export default function FontControl() {
  const [size, setSize] = useState(20);
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("f50-fs"));
      if (saved) setSize(saved);
      const t = localStorage.getItem("f50-theme");
      setTheme(t === "dark" || t === "light" ? t : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch {
      setTheme("light");
    }
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--fs", `${size}px`);
    try { localStorage.setItem("f50-fs", String(size)); } catch {}
  }, [size]);

  function chooseTheme(t: Theme) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("f50-theme", t); } catch {}
  }
  const change = (d: number) => setSize((s) => Math.max(17, Math.min(26, s + d)));

  return (
    <div className="a11y" role="group" aria-label="Ajustes de leitura">
      <div className="a11y-group" aria-label="Tamanho da letra">
        <button type="button" onClick={() => change(-2)} aria-label="Diminuir a letra">A−</button>
        <button type="button" onClick={() => change(2)} aria-label="Aumentar a letra">A+</button>
      </div>
      <div className="a11y-group" aria-label="Cor da tela">
        <button type="button" onClick={() => chooseTheme("light")} aria-pressed={theme === "light"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
          Clara
        </button>
        <button type="button" onClick={() => chooseTheme("dark")} aria-pressed={theme === "dark"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></svg>
          Escura
        </button>
      </div>
    </div>
  );
}
