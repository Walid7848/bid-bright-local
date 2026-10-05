CREATE OR REPLACE FUNCTION public.tg_requests_guard_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF coalesce(current_setting('wasla.state_machine', true), '') = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Request status can only be changed through an allowed transition';
  END IF;
  IF NEW.awarded_bid_id IS DISTINCT FROM OLD.awarded_bid_id THEN
    -- Allow only the ON DELETE SET NULL cascade: new value NULL and the old bid no longer exists.
    IF NOT (NEW.awarded_bid_id IS NULL
            AND OLD.awarded_bid_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM public.bids b WHERE b.id = OLD.awarded_bid_id)) THEN
      RAISE EXCEPTION 'Awarded bid cannot be changed directly';
    END IF;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    RAISE EXCEPTION 'Request owner cannot be changed';
  END IF;
  RETURN NEW;
END;
$function$;