-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Words Table (Publicly readable)
create table public.words (
  id uuid primary key default uuid_generate_v4(),
  dutch text not null,
  spanish text not null,
  frequency_rank int,
  level text, -- e.g., 'A1', 'A2', 'B1'
  example_sentence_dutch text,
  example_sentence_spanish text,
  category text,
  pixel_art_image_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Words
alter table public.words enable row level security;

-- Policy: Words are publicly readable
create policy "Words are publicly readable."
  on public.words for select
  using ( true );

-- Policy: Only authenticated users (admins realistically, but keeping it simple for now as requested) can insert/update/delete.
-- Ideally, you'd have an admin role check here.
create policy "Authenticated users can create words"
  on public.words for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update words"
  on public.words for update
  to authenticated
  using (true);

create policy "Authenticated users can delete words"
  on public.words for delete
  to authenticated
  using (true);

-- 2. User Profiles Table (Private to user)
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int default 0 not null,
  longest_streak int default 0 not null,
  last_activity_date date,
  total_words_mastered int default 0 not null,
  current_level text default 'A1' not null,
  native_language text default 'es' not null,
  target_language text default 'nl' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for User Profiles
alter table public.user_profiles enable row level security;

-- Policy: Users can only select their own profile
create policy "Users can view their own profile."
  on public.user_profiles for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own profile (typically done via trigger on auth.users creation, but good to have)
create policy "Users can insert their own profile."
  on public.user_profiles for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own profile
create policy "Users can update their own profile."
  on public.user_profiles for update
  using ( auth.uid() = user_id );

-- Trigger to automatically wrap updated_at (optional but good practice)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- 3. User Word States Table (Spaced Repetition Data - Private to user)
create table public.user_word_states (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word_id uuid references public.words(id) on delete cascade not null,
  interval int default 0 not null,
  ease_factor float default 2.5 not null,
  repetitions int default 0 not null,
  next_review_date timestamp with time zone default now() not null,
  last_reviewed_at timestamp with time zone,
  is_unlocked boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, word_id) -- A user has only one state per word
);

-- Enable RLS for User Word States
alter table public.user_word_states enable row level security;

-- Policy: Users can only view their own states
create policy "Users can view their own word states."
  on public.user_word_states for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own states
create policy "Users can insert their own word states."
  on public.user_word_states for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own states
create policy "Users can update their own word states."
  on public.user_word_states for update
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own states
create policy "Users can delete their own word states."
  on public.user_word_states for delete
  using ( auth.uid() = user_id );

-- 4. Exercise Logs Table (History of interactions - Private to user)
create table public.exercise_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word_id uuid references public.words(id) on delete cascade not null,
  exercise_type text not null, -- e.g., 'multiple_choice', 'typing', 'flashcard'
  was_correct boolean not null,
  reviewed_at timestamp with time zone default now() not null
);

-- Enable RLS for Exercise Logs
alter table public.exercise_logs enable row level security;

-- Policy: Users can only view their own logs
create policy "Users can view their own exercise logs."
  on public.exercise_logs for select
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own logs
create policy "Users can insert their own exercise logs."
  on public.exercise_logs for insert
  with check ( auth.uid() = user_id );

-- Note: Typically logs are immutable, so we might intentionally omit UPDATE/DELETE policies.
