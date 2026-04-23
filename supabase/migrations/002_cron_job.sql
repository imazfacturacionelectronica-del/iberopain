-- supabase/migrations/002_cron_job.sql

-- Habilitar extensión pg_cron (ya viene en Supabase)
create extension if not exists pg_cron;

-- Job: ejecutar actualización automática cada 1 de enero y 1 de julio a las 02:00 UTC
select cron.schedule(
  'protocol-auto-update',
  '0 2 1 1,7 *',
  $$
  select net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/protocol-update-job',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
