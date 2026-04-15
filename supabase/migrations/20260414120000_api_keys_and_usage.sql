-- API外部公開用テーブル: APIキー管理・レート制限・利用ログ

-- APIキー管理テーブル
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  key_prefix text not null,
  owner_name text not null,
  owner_email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'internal')),
  is_active boolean not null default true,
  scopes text[] not null default '{suggestions:read}',
  request_count bigint not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- レート制限マスタ
create table api_rate_limits (
  plan text primary key check (plan in ('free', 'pro', 'internal')),
  requests_per_minute int not null,
  requests_per_day int not null,
  burst_limit int not null,
  allow_gemini boolean not null default false,
  allow_tts boolean not null default false
);

-- 初期レート制限データ
insert into api_rate_limits (plan, requests_per_minute, requests_per_day, burst_limit, allow_gemini, allow_tts) values
  ('free',     10,    500, 20,  false, false),
  ('pro',      60,  5000, 100, true,  true),
  ('internal', 200, 50000, 500, true,  true);

-- 利用ログテーブル
create table api_usage_log (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid not null references api_keys(id) on delete cascade,
  endpoint text not null,
  method text not null default 'GET',
  status_code int not null,
  response_time_ms int,
  ip_address text,
  created_at timestamptz not null default now()
);

-- インデックス
create index idx_api_keys_key_hash on api_keys(key_hash);
create index idx_api_keys_plan on api_keys(plan);
create index idx_api_usage_log_key_id on api_usage_log(api_key_id);
create index idx_api_usage_log_created on api_usage_log(created_at desc);
create index idx_api_usage_log_key_time on api_usage_log(api_key_id, created_at desc);

-- RLS
alter table api_keys enable row level security;
alter table api_rate_limits enable row level security;
alter table api_usage_log enable row level security;

-- api_rate_limits: 誰でも読める（プラン情報はpublic）
create policy "rate_limits_read" on api_rate_limits
  for select using (true);

-- api_keys, api_usage_log: service_role のみ（RLS bypass）
-- アプリケーションからは service_role key 経由でアクセスする

-- updated_at 自動更新
create trigger api_keys_updated_at
  before update on api_keys
  for each row execute function update_updated_at();

-- レート制限チェック用 RPC（ログ挿入を含むアトミック操作）
create or replace function check_rate_limit(
  p_key_hash text,
  p_endpoint text default '',
  p_method text default 'GET',
  p_ip_address text default null
)
returns jsonb as $$
declare
  v_key record;
  v_limits record;
  v_minute_count int;
  v_day_count int;
begin
  -- APIキー取得（FOR UPDATEでロック）
  select * into v_key from api_keys
    where key_hash = p_key_hash and is_active = true
    and (expires_at is null or expires_at > now())
    for update;

  if v_key is null then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_key');
  end if;

  -- レート制限マスタ取得
  select * into v_limits from api_rate_limits where plan = v_key.plan;

  -- 直近1分のリクエスト数
  select count(*) into v_minute_count from api_usage_log
    where api_key_id = v_key.id
    and created_at > now() - interval '1 minute';

  -- 直近24時間のリクエスト数
  select count(*) into v_day_count from api_usage_log
    where api_key_id = v_key.id
    and created_at > now() - interval '1 day';

  -- 制限チェック
  if v_minute_count >= v_limits.requests_per_minute then
    return jsonb_build_object(
      'allowed', false, 'reason', 'rate_limit_minute',
      'limit', v_limits.requests_per_minute, 'current', v_minute_count,
      'reset', extract(epoch from date_trunc('minute', now()) + interval '1 minute')::bigint
    );
  end if;

  if v_day_count >= v_limits.requests_per_day then
    return jsonb_build_object(
      'allowed', false, 'reason', 'rate_limit_day',
      'limit', v_limits.requests_per_day, 'current', v_day_count,
      'reset', extract(epoch from date_trunc('day', now()) + interval '1 day')::bigint
    );
  end if;

  -- ログ挿入とカウント更新をアトミックに実行（レースコンディション防止）
  insert into api_usage_log (api_key_id, endpoint, method, status_code, ip_address)
    values (v_key.id, p_endpoint, p_method, 0, p_ip_address);

  update api_keys set request_count = request_count + 1 where id = v_key.id;

  return jsonb_build_object(
    'allowed', true,
    'key_id', v_key.id,
    'plan', v_key.plan,
    'scopes', v_key.scopes,
    'owner_name', v_key.owner_name,
    'allow_gemini', v_limits.allow_gemini,
    'allow_tts', v_limits.allow_tts,
    'rate_limit', jsonb_build_object(
      'limit_day', v_limits.requests_per_day,
      'remaining_day', greatest(0, v_limits.requests_per_day - v_day_count - 1),
      'reset', extract(epoch from date_trunc('day', now()) + interval '1 day')::bigint
    )
  );
end;
$$ language plpgsql security definer;

-- 古いログの自動削除（90日）
create or replace function cleanup_old_usage_logs()
returns int as $$
declare
  deleted_count int;
begin
  delete from api_usage_log where created_at < now() - interval '90 days';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- RPC関数のアクセス制限（P0-2, P0-3: anonからの実行を禁止）
revoke execute on function check_rate_limit from public, anon;
grant execute on function check_rate_limit to service_role;

revoke execute on function cleanup_old_usage_logs from public, anon;
grant execute on function cleanup_old_usage_logs to service_role;
