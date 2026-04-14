#!/usr/bin/env node
// Revoke an API key by ID or prefix
// Usage: node scripts/revoke-api-key.js --id <uuid>
//        node scripts/revoke-api-key.js --prefix "kb_live_abc1..."

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  const keyId = getArg('--id');
  const keyPrefix = getArg('--prefix');

  if (!keyId && !keyPrefix) {
    console.error('Usage: node scripts/revoke-api-key.js --id <uuid>');
    console.error('       node scripts/revoke-api-key.js --prefix "kb_live_abc1..."');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    process.exit(1);
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  // Find the key
  let query = supabase.from('api_keys').select('id, key_prefix, owner_name, plan, is_active');
  if (keyId) {
    query = query.eq('id', keyId);
  } else {
    query = query.eq('key_prefix', keyPrefix);
  }

  const { data: keys, error: findErr } = await query;

  if (findErr) {
    console.error('Error finding key:', findErr.message);
    process.exit(1);
  }

  if (!keys || keys.length === 0) {
    console.error('No API key found with the given identifier');
    process.exit(1);
  }

  const key = keys[0];

  if (!key.is_active) {
    console.log(`Key ${key.key_prefix} (${key.owner_name}) is already revoked.`);
    process.exit(0);
  }

  // Revoke
  const { error: updateErr } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', key.id);

  if (updateErr) {
    console.error('Error revoking key:', updateErr.message);
    process.exit(1);
  }

  console.log(`\n=== API Key Revoked ===`);
  console.log(`Key ID:     ${key.id}`);
  console.log(`Prefix:     ${key.key_prefix}`);
  console.log(`Owner:      ${key.owner_name}`);
  console.log(`Plan:       ${key.plan}`);
  console.log(`Status:     REVOKED`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
