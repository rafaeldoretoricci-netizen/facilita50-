-- Facilita 50+: estrutura inicial do banco
-- Rode este arquivo no Supabase (SQL Editor) ou com `supabase db push`.

create extension if not exists "pgcrypto";

-- ============ Perfis ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  whatsapp text,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, whatsapp)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'whatsapp')
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Livros e vitrine ============
create table public.books (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  author text not null default 'J. Ricardo Temóteo',
  synopsis text,
  cover_url text,
  has_physical boolean not null default true,
  has_digital boolean not null default true,
  price_physical numeric(10,2),
  price_digital numeric(10,2),
  ebook_path text,               -- caminho do PDF/EPUB no bucket privado "ebooks"
  show_in_showcase boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  launch_book_id uuid references public.books(id) on delete set null,
  only_launch boolean not null default false,  -- página inicial mostra só o lançamento
  community_price numeric(10,2) not null default 39.90,
  shipping_flat numeric(10,2) not null default 18.50,
  updated_at timestamptz not null default now()
);

-- ============ Conteúdos da área de membros ============
create table public.contents (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('video','entrevista','livro','artigo')),
  rail text not null,            -- nome da fileira, ex.: "Cursos em vídeo"
  title text not null,
  description text,
  thumbnail_url text,
  video_url text,                -- link do YouTube (não listado) ou de outro player
  body text,                     -- texto do artigo
  file_path text,                -- arquivo no bucket privado "conteudos"
  book_id uuid references public.books(id) on delete set null,
  duration_minutes int,
  featured boolean not null default false,
  published boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ Vendas, assinaturas e pagamentos ============
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references public.books(id) on delete set null,
  book_title text not null,
  format text not null check (format in ('physical','digital')),
  customer_name text not null,
  email text not null,
  whatsapp text,
  address jsonb,
  amount numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  shipped_at timestamptz,
  mp_preference_id text,
  mp_payment_id text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','past_due','paused','cancelled')),
  amount numeric(10,2) not null,
  mp_preapproval_id text unique,
  next_payment_date timestamptz,
  last_payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.subscriptions(user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  mp_payment_id text not null unique,
  kind text not null check (kind in ('book','subscription')),
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  payer_name text,
  payer_email text,
  description text,
  amount numeric(10,2) not null,
  method text,
  status text not null,
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);
create index on public.payments(created_at desc);

-- ============ Funções de acesso ============
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from subscriptions where user_id = auth.uid() and status in ('active','past_due')
  );
$$;

-- ============ Segurança (RLS) ============
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.site_settings enable row level security;
alter table public.contents enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

create policy "perfil próprio" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admin gerencia perfis" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "livros são públicos" on public.books for select using (true);
create policy "admin gerencia livros" on public.books for all using (public.is_admin()) with check (public.is_admin());

create policy "config pública" on public.site_settings for select using (true);
create policy "admin gerencia config" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "membros veem conteúdos" on public.contents for select using (published and public.is_member() or public.is_admin());
create policy "admin gerencia conteúdos" on public.contents for all using (public.is_admin()) with check (public.is_admin());

create policy "pedidos próprios" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "admin gerencia pedidos" on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy "assinatura própria" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "admin gerencia assinaturas" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

create policy "pagamentos próprios" on public.payments for select using (user_id = auth.uid() or public.is_admin());

-- ============ Arquivos (Storage) ============
insert into storage.buckets (id, name, public) values
  ('capas', 'capas', true),
  ('ebooks', 'ebooks', false),
  ('conteudos', 'conteudos', false)
on conflict (id) do nothing;

create policy "capas públicas" on storage.objects for select using (bucket_id = 'capas');
create policy "membros leem conteúdos" on storage.objects for select using (bucket_id in ('conteudos','ebooks') and public.is_member());
create policy "admin envia arquivos" on storage.objects for insert with check (bucket_id in ('capas','ebooks','conteudos') and public.is_admin());
create policy "admin altera arquivos" on storage.objects for update using (bucket_id in ('capas','ebooks','conteudos') and public.is_admin());
create policy "admin apaga arquivos" on storage.objects for delete using (bucket_id in ('capas','ebooks','conteudos') and public.is_admin());

-- ============ Dados iniciais ============
insert into public.books (slug, title, subtitle, synopsis, cover_url, price_physical, price_digital, position) values
  ('o-amor-e-o-caminho', 'O Amor é o Caminho', 'Lançamento 2026',
   'Reflexões sobre a existência, as relações humanas e a espiritualidade, escritas com a sensibilidade de um poeta e a sinceridade de um aprendiz. Entre pedras e estrelas, J. Ricardo Temóteo convida você a olhar para a própria caminhada com mais calma e a descobrir, página a página, que o amor é o caminho.',
   '/img/o-amor-e-o-caminho.jpg', 59.90, 29.90, 0),
  ('informatica-para-a-vida-1', 'Informática para a Vida', 'Volume 1', null, null, 49.90, 24.90, 1),
  ('informatica-para-a-vida-2', 'Informática para a Vida', 'Volume 2', null, null, 49.90, 24.90, 2),
  ('smartphone-celular-inteligente-1', 'Smartphone (Celular Inteligente)', 'Volume 1', null, null, 44.90, 22.90, 3),
  ('celular-na-pratica-1', 'Celular na Prática', 'Volume 1', null, null, 39.90, 19.90, 4),
  ('celular-na-pratica-2', 'Celular na Prática', 'Volume 2', null, null, 39.90, 19.90, 5),
  ('celular-na-pratica-3', 'Celular na Prática', 'Volume 3', null, null, 39.90, 19.90, 6);

insert into public.site_settings (id, launch_book_id)
  select 1, id from public.books where slug = 'o-amor-e-o-caminho';

insert into public.contents (kind, rail, title, description, video_url, featured, position) values
  ('entrevista', 'Entrevistas', 'Entrevista com J. Ricardo Temóteo',
   'Uma conversa sobre educação, tecnologia e longevidade: por que nunca é tarde para aprender e como nasceu a Comunidade Facilita 50+.',
   'https://youtu.be/Ox0Km9RrKto', true, 0);
