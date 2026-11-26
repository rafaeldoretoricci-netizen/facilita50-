import type { Book } from "@/lib/types";

const palette = ["#1f5f8b", "#23708f", "#2e6b4f", "#b0612a", "#9a4f22", "#5a2a44", "#3a2a4f"];

/** Capa do livro: usa a imagem enviada ou desenha uma capa simples com o título. */
export default function BookCover({ book, className = "c" }: { book: Book; className?: string }) {
  if (book.cover_url) {
    return (
      <div className={className} style={{ padding: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.cover_url} alt={`Capa do livro ${book.title}`} style={{ width: "100%", height: "100%", objectFit: "cover", margin: 0 }} />
      </div>
    );
  }
  const bg = palette[Math.abs(book.position) % palette.length];
  return (
    <div className={className} style={{ background: `linear-gradient(160deg, ${bg}, #1a1f33)` }}>
      <small>{book.author}</small>
      <b>{book.title}</b>
      <small>{book.subtitle}</small>
    </div>
  );
}
