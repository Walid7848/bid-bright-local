import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      });
      supabase.auth
        .getSession()
        .then(({ data }) => {
          setSession(data.session ?? null);
          setUser(data.session?.user ?? null);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
      return () => sub.subscription.unsubscribe();
    } catch (err) {
      console.error(err);
      setLoading(false);
      return;
    }
  }, []);


  return { session, user, loading };
}
