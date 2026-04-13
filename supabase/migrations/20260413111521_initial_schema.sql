-- 気晴らしマスタ: AI生成 or 手動登録された再利用可能な気晴らし候補
create table suggestions_master (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  duration int not null check (duration in (5, 15, 30)),
  category text not null check (category in ('認知的', '行動的')),
  situation text[] not null default '{}',
  age_groups text[] not null default '{}',
  tags text[] not null default '{}',
  steps text[] not null default '{}',
  guide text,
  source text not null default 'manual' check (source in ('manual', 'ai', 'community')),
  is_public boolean not null default true,
  quality_score float default 0,
  use_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 気晴らしバリアント: 同じ気晴らしの言い換え・短縮版・音声版
create table suggestion_variants (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references suggestions_master(id) on delete cascade,
  variant_type text not null check (variant_type in ('rewrite', 'short', 'voice_guide')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ユーザー保存済み気晴らし: お気に入り・実施記録・評価
create table user_saved_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  master_id uuid references suggestions_master(id) on delete set null,
  title text not null,
  description text not null,
  duration int not null,
  category text not null,
  steps text[] not null default '{}',
  is_favorite boolean not null default false,
  rating int check (rating between 1 and 5),
  memo text,
  use_count int not null default 0,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

-- AI生成キャッシュ: AI提案の再利用・採用判定用
create table suggestion_generation_cache (
  id uuid primary key default gen_random_uuid(),
  input_situation text not null,
  input_duration int not null,
  input_age_group text,
  input_weather_condition text,
  suggestions jsonb not null,
  ai_provider text not null,
  ai_model text,
  response_time_ms int,
  promoted boolean not null default false,
  created_at timestamptz not null default now()
);

-- インデックス
create index idx_suggestions_master_situation on suggestions_master using gin(situation);
create index idx_suggestions_master_duration on suggestions_master(duration);
create index idx_suggestions_master_category on suggestions_master(category);
create index idx_suggestions_master_quality on suggestions_master(quality_score desc);
create index idx_user_saved_user on user_saved_suggestions(user_id);
create index idx_user_saved_favorite on user_saved_suggestions(user_id, is_favorite) where is_favorite = true;
create index idx_cache_lookup on suggestion_generation_cache(input_situation, input_duration, input_age_group);
create index idx_cache_promoted on suggestion_generation_cache(promoted) where promoted = false;

-- RLS
alter table suggestions_master enable row level security;
alter table suggestion_variants enable row level security;
alter table user_saved_suggestions enable row level security;
alter table suggestion_generation_cache enable row level security;

create policy "suggestions_master_read" on suggestions_master
  for select using (is_public = true);

create policy "suggestion_variants_read" on suggestion_variants
  for select using (
    exists (select 1 from suggestions_master where id = master_id and is_public = true)
  );

create policy "user_saved_own" on user_saved_suggestions
  for all using (true);

create policy "cache_read" on suggestion_generation_cache
  for select using (true);

-- updated_at 自動更新
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger suggestions_master_updated_at
  before update on suggestions_master
  for each row execute function update_updated_at();
