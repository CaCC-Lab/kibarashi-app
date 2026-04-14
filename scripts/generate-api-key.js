#!/usr/bin/env node
// Generate a new API key and store its hash in Supabase
// Usage: node scripts/generate-api-key.js --name "Company" --email "dev@example.com" --plan free

const crypto = require('crypto');

async function main() {
  // Parse args
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };

  const ownerName = getArg('--name');
  const ownerEmail = getArg('--email');
  const plan = getArg('--plan') || 'free';
  const expiresInDays = getArg('--expires') ? parseInt(getArg('--expires')) : null;

  if (!ownerName || !ownerEmail) {
    console.error('Usage: node scripts/generate-api-key.js --name "Owner" --email "email@example.com" [--plan free|pro|internal] [--expires 365]');
    process.exit(1);
  }

  if (!['free', 'pro', 'internal'].includes(plan)) {
    console.error('Error: plan must be one of: free, pro, internal');
    process.exit(1);
  }

  // Check env
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
    console.error('Set them or create a .env file');
    process.exit(1);
  }

  // Generate key
  const randomPart = crypto.randomBytes(16).toString('hex');
  const apiKey = `kb_live_${randomPart}`;
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyPrefix = `kb_live_${randomPart.slice(0, 4)}...`;

  // Calculate expiration
  let expiresAt = null;
  if (expiresInDays) {
    expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }

  // Insert into Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase.from('api_keys').insert({
    key_hash: keyHash,
    key_prefix: keyPrefix,
    owner_name: ownerName,
    owner_email: ownerEmail,
    plan,
    scopes: plan === 'free' ? ['suggestions:read'] : ['suggestions:read', 'tts:use', 'usage:read'],
    expires_at: expiresAt
  }).select('id, key_prefix, plan, scopes, created_at, expires_at').single();

  if (error) {
    console.error('Error inserting API key:', error.message);
    process.exit(1);
  }

  console.log('\n=== API Key Generated ===');
  console.log(`Key ID:     ${data.id}`);
  console.log(`API Key:    ${apiKey}`);
  console.log(`Prefix:     ${data.key_prefix}`);
  console.log(`Plan:       ${data.plan}`);
  console.log(`Scopes:     ${data.scopes.join(', ')}`);
  console.log(`Created:    ${data.created_at}`);
  console.log(`Expires:    ${data.expires_at || 'Never'}`);
  console.log('\n⚠️  IMPORTANT: Save this API key now. It cannot be retrieved later.');
  console.log(`\nTest with:\n  curl -H "Authorization: Bearer ${apiKey}" https://your-domain.vercel.app/api/v2/suggestions\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
