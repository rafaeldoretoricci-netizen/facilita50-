export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author: string;
  synopsis: string | null;
  cover_url: string | null;
  has_physical: boolean;
  has_digital: boolean;
  price_physical: number | null;
  price_digital: number | null;
  ebook_path: string | null;
  show_in_showcase: boolean;
  position: number;
};

export type Settings = {
  launch_book_id: string | null;
  only_launch: boolean;
  community_price: number;
  shipping_flat: number;
};

export type Content = {
  id: string;
  kind: "video" | "entrevista" | "livro" | "artigo";
  rail: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  body: string | null;
  file_path: string | null;
  book_id: string | null;
  duration_minutes: number | null;
  featured: boolean;
  published: boolean;
  position: number;
};

export type Course = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_url: string | null;
  category: string;
  level: string | null;
  featured: boolean;
  published: boolean;
  position: number;
  created_at: string;
};

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  file_path: string | null;
  duration_minutes: number | null;
  position: number;
};
