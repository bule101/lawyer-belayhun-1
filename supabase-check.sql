-- Setup checker. Run in Supabase > SQL Editor AFTER the other SQL files.
-- Part 1 lists what is installed and what is missing. Part 2 (second query) tests the booking logic.
-- Nothing here changes your data.

-- ===== PART 1: structure and security =====
with checks(area, item, ok) as (
  select 'tables', t, to_regclass('public.' || t) is not null
  from unnest(array['services','bookings','admins','availability_rules','blocked','settings','articles','staff','staff_invites','reviews','documents']) t
  union all
  select 'row security', t, coalesce((select c.relrowsecurity from pg_class c where c.oid = to_regclass('public.' || t)), false)
  from unnest(array['services','bookings','availability_rules','blocked','settings','articles','staff','staff_invites','reviews','documents']) t
  union all
  select 'functions', f, exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = f)
  from unnest(array['get_day_slots','get_open_days','get_hours','get_settings','get_lawyers','create_booking','lookup_booking','cancel_booking',
                    'staff_role','claim_staff','submit_review','upload_document','list_my_documents','delete_my_document']) f
  union all
  select 'columns', c, exists (select 1 from information_schema.columns where table_schema = 'public' and (table_name || '.' || column_name) = c)
  from unnest(array['bookings.lawyer_id','bookings.source','availability_rules.lawyer_id','blocked.lawyer_id','staff.title','staff.bio']) c
  union all
  -- visitors must never be able to read private tables directly
  select 'privacy', 'no public policy on ' || t,
         not exists (select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = t and (p.roles @> array['public']::name[] or p.roles @> array['anon']::name[]))
  from unnest(array['bookings','documents','staff','staff_invites','availability_rules','blocked','settings']) t
  union all
  select 'data', 'at least one active admin', exists (select 1 from staff where role = 'admin' and active)
  union all
  select 'data', 'opening hours exist', exists (select 1 from availability_rules)
  union all
  select 'data', 'settings row exists', exists (select 1 from settings where id = 1)
  union all
  select 'data', 'services exist', exists (select 1 from services)
  union all
  select 'data', 'old one-booking-per-slot index replaced', not exists (select 1 from pg_indexes where indexname = 'one_booking_per_slot')
)
select area, item, case when ok then 'OK' else 'MISSING / WRONG' end as result
from checks
order by ok, area, item;

-- ===== PART 2: run this second, on its own =====
-- Shows the next 14 days and how many free slots each day has. If this errors, supabase-calendars.sql did not install correctly.
-- select d::date as day, (select count(*) from get_day_slots(d::date) s where s.available) as free_slots
-- from generate_series(current_date, current_date + 13, interval '1 day') d order by 1;
