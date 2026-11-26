"use client";
import { useEffect, useState } from "react";

/** Botões A− / A+ para aumentar ou diminuir o tamanho das letras em todo o site. */
export default function FontControl() {
  const [size, setSize] = useState(20);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("f50-fs"));
      if (saved) setSize(saved);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--fs", `${size}px`);
    try { localStorage.setItem("f50-fs", String(size)); } catch {}
  }, [size]);
  const change = (d: number) => setSize((s) => Math.max(17, Math.min(26, s + d)));
  return (
    <div className="fontctl" aria-label="Tamanho do texto">
      <button type="button" onClick={() => change(-2)} aria-label="Diminuir texto">A−</button>
      <button type="button" onClick={() => change(2)} aria-label="Aumentar texto">A+</button>
    </div>
  );
}
