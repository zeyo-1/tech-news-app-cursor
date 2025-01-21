-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  email text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = user_id );

-- Create indexes
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_email_idx on public.profiles(email);

-- Set up Realtime
alter publication supabase_realtime add table public.profiles;
