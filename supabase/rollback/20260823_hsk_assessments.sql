-- Destructive rollback for migration 20260823000001_hsk_assessments.sql.
-- Export assessment history before running this file if production attempts exist.
drop table if exists public.hsk_assessment_attempts;
