-- Facilita 50+: cursos com aulas e progresso de cada aluno (área de membros estilo streaming)

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,                 -- frase curta exibida no cartão
  description text,
  cover_url text,                -- imagem horizontal (16:9) do curso
  category text not null default 'Cursos',  -- fileira: "Celular", "Segurança", "Entrevistas"...
  level text default 'Iniciante',
  featured boolean not null default false,  -- aparece no destaque do topo
  published boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,                -- YouTube (não listado) ou link de vídeo
  file_path text,                -- material de apoio no bucket "conteudos"
  duration_minutes int,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.lessons(course_id, position);

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index on public.lesson_progress(user_id, updated_at desc);

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

create policy "membros veem cursos" on public.courses for select using (published and public.is_member() or public.is_admin());
create policy "admin gerencia cursos" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "membros veem aulas" on public.lessons for select using (public.is_member());
create policy "admin gerencia aulas" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "progresso próprio" on public.lesson_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member());

-- A entrevista vira um "curso" de uma aula na fileira Entrevistas.
with c as (
  insert into public.courses (title, subtitle, description, cover_url, category, featured, position)
  values ('Entrevista com J. Ricardo Temóteo', 'Educação, tecnologia e longevidade',
          'Uma conversa sobre por que nunca é tarde para aprender e como nasceu a Comunidade Facilita 50+.', '/img/capa-entrevista.jpg',
          'Entrevistas', true, 0)
  returning id
)
insert into public.lessons (course_id, title, video_url, position)
select id, 'Entrevista completa', 'https://youtu.be/Ox0Km9RrKto', 0 from c;

delete from public.contents where kind = 'entrevista' and video_url = 'https://youtu.be/Ox0Km9RrKto';
