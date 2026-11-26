"use client";
import { useRef } from "react";

/** Fileira horizontal com setas grandes para rolar (estilo streaming). */
export default function Rail({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <section className="mv-rail">
      <div className="mv-rail-head">
        <h2>{title}</h2>
        <div className="mv-arrows">
          <button type="button" onClick={() => go(-1)} aria-label={`Voltar na fileira ${title}`}>‹</button>
          <button type="button" onClick={() => go(1)} aria-label={`Avançar na fileira ${title}`}>›</button>
        </div>
      </div>
      <div className="mv-row" ref={ref}>{children}</div>
    </section>
  );
}
