-- Add phone support to public profiles and include it in the new user trigger

alter table if exists public.profiles
  add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, bio, country, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'bio',
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'phone_number'
  );

  return new;
end;
$$;
