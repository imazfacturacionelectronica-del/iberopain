# Supabase Setup

## Apply migrations (production)
1. Go to Supabase Dashboard → SQL Editor
2. Run `migrations/001_protocols_schema.sql`

## Apply seed (production)
1. Go to Supabase Dashboard → SQL Editor  
2. Run `seed/001_aps_protocol.sql`

## Local development
If using Supabase CLI locally:
```bash
npx supabase start
npx supabase db push
```
