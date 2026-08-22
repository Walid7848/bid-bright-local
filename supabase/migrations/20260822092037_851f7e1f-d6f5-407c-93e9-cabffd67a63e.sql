CREATE OR REPLACE FUNCTION public.tg_notifications_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- App users connect as the "authenticated" role; system/maintenance
  -- operations (e.g. cascading FK updates on account deletion) are exempt.
  IF current_user <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.actor_id IS DISTINCT FROM OLD.actor_id
     OR NEW.request_id IS DISTINCT FROM OLD.request_id
     OR NEW.bid_id IS DISTINCT FROM OLD.bid_id
     OR NEW.metadata IS DISTINCT FROM OLD.metadata
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Only read_at can be updated on notifications';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.tg_prevent_accepted_bid_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user <> 'authenticated' THEN
    RETURN OLD;
  END IF;

  IF OLD.status = 'accepted'
     AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = OLD.request_id) THEN
    RAISE EXCEPTION 'Cannot delete an accepted bid';
  END IF;
  RETURN OLD;
END;
$function$;

DELETE FROM auth.users WHERE email LIKE '%@wasla-test.com';