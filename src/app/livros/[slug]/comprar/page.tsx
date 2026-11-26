import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import { getBookBySlug, getSettings } from "@/lib/data";
import CheckoutForm from "./CheckoutForm";

export const metadata = { title: "Comprar livro" };

export default async function Comprar({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ formato?: string }> }) {
  const { slug } = await params;
  const { formato } = await searchParams;
  const [book, settings] = await Promise.all([getBookBySlug(slug), getSettings()]);
  if (!book) notFound();
  const initial = formato === "digital" && book.has_digital ? "digital" : book.has_physical ? "physical" : "digital";

  return (
    <section className="checkout">
      <div className="wrap">
        <div style={{ display: "flex", gap: "1.2rem", alignItems: "center", marginBottom: "1.6rem" }}>
          <div className="book" style={{ width: 110, padding: ".4rem", flex: "none" }}><BookCover book={book} /></div>
          <div><span className="tag">Finalizar compra</span><h2 style={{ marginTop: ".5rem" }}>{book.title}</h2>{book.subtitle && <p style={{ color: "var(--muted)" }}>{book.subtitle}</p>}</div>
        </div>
        <CheckoutForm
          slug={book.slug}
          title={book.title}
          hasPhysical={book.has_physical}
          hasDigital={book.has_digital}
          pricePhysical={Number(book.price_physical ?? 0)}
          priceDigital={Number(book.price_digital ?? 0)}
          shipping={Number(settings.shipping_flat)}
          initialFormat={initial}
        />
      </div>
    </section>
  );
}
