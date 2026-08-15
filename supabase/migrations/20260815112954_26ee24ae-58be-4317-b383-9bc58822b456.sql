REVOKE EXECUTE ON FUNCTION public.start_request(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.complete_request(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.close_request(uuid) FROM anon;