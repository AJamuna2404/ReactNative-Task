-- Schemas
create schema if not exists big7;
create schema if not exists s22;

-- Profiles table in each schema
create table big7.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  user_name text,
  user_code text unique,
  email text unique,
  password text,
  avatar_url text,
  created_at timestamp default now()
);

create table s22.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  user_name text,
  user_code text unique,
  email text unique,
  password text,
  avatar_url text,
  created_at timestamp default now()
);

-- Enable RLS
alter table big7.profiles enable row level security;
alter table s22.profiles enable row level security;

-- User policies
create policy "Users can view their own profile"
on big7.profiles for select
using (auth.uid() = user_id);

create policy "Users can update their own profile"
on big7.profiles for update
using (auth.uid() = user_id);

-- Repeat same policies for s22.profiles
create policy "Users can view their own profile"
on s22.profiles for select
using (auth.uid() = user_id);

create policy "Users can update their own profile"
on s22.profiles for update
using (auth.uid() = user_id);

-- Admin policies
create policy "Admins can manage all profiles"
on big7.profiles for all
using ((auth.jwt() ->> 'role')::text = 'admin');

create policy "Admins can manage all profiles"
on s22.profiles for all
using ((auth.jwt() ->> 'role')::text = 'admin');