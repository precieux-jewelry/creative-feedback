-- ============================================================
-- creative-feedback — Supabase schema
-- Run this in your Supabase SQL editor to set up all tables
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── profiles ───────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── videos ─────────────────────────────────────────────────
create table if not exists public.videos (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  video_url     text not null,
  video_name    text not null,
  file_size     bigint,
  duration      numeric,
  upload_date   timestamptz default now() not null,
  status        text not null default 'uploading'
                  check (status in ('uploading','processing','complete','error')),
  thumbnail_url text
);

alter table public.videos enable row level security;

create policy "Users can view own videos"
  on public.videos for select
  using (auth.uid() = user_id);

create policy "Users can insert own videos"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own videos"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "Users can delete own videos"
  on public.videos for delete
  using (auth.uid() = user_id);

-- ─── video_reviews ──────────────────────────────────────────
create table if not exists public.video_reviews (
  id                    uuid primary key default uuid_generate_v4(),
  video_id              uuid not null references public.videos(id) on delete cascade,
  user_id               uuid not null references public.profiles(id) on delete cascade,
  created_at            timestamptz default now() not null,

  -- Overview
  overall_score         numeric,
  summary               text,

  -- Creative feedback
  hook_analysis         text,
  storytelling          text,
  emotional_pull        text,
  shareability          text,
  viral_potential       text,

  -- Analytics feedback
  thumb_stop_score      numeric,
  watch_through_score   numeric,
  pacing_analysis       text,
  drop_off_risks        text,
  retention_curve       text,

  -- Recommendations
  what_works            text,
  what_to_cut           text,
  what_to_improve       text,
  suggested_hook        text,
  suggested_caption     text,
  suggested_title       text,

  -- Raw Gemini JSON
  raw_analysis          jsonb
);

alter table public.video_reviews enable row level security;

create policy "Users can view own reviews"
  on public.video_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.video_reviews for insert
  with check (auth.uid() = user_id);

-- ─── persona_messages ───────────────────────────────────────
create table if not exists public.persona_messages (
  id         uuid primary key default uuid_generate_v4(),
  video_id   uuid not null references public.videos(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','persona')),
  content    text not null,
  created_at timestamptz default now() not null
);

alter table public.persona_messages enable row level security;

create policy "Users can view own persona messages"
  on public.persona_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own persona messages"
  on public.persona_messages for insert
  with check (auth.uid() = user_id);

-- ─── advisor_messages ───────────────────────────────────────
create table if not exists public.advisor_messages (
  id            uuid primary key default uuid_generate_v4(),
  video_id      uuid not null references public.videos(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  advisor_type  text not null check (advisor_type in ('creative','performance','general')),
  role          text not null check (role in ('user','advisor')),
  content       text not null,
  created_at    timestamptz default now() not null
);

alter table public.advisor_messages enable row level security;

create policy "Users can view own advisor messages"
  on public.advisor_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own advisor messages"
  on public.advisor_messages for insert
  with check (auth.uid() = user_id);

-- ─── Storage bucket ─────────────────────────────────────────
-- Run this separately or via the Supabase dashboard:
-- insert into storage.buckets (id, name, public) values ('videos', 'videos', false);
--
-- Then add these policies in Storage > videos bucket > Policies:
--
-- Allow authenticated users to upload:
-- (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- Allow authenticated users to read their own files:
-- (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
