// Lightweight console tracing for Supabase query failures.
// No telemetry, no dependencies — technical details stay in the console.
export function logQueryError(queryName: string, error: unknown) {
  const e = error as { code?: string; message?: string; details?: string } | null;
  console.error(
    `[query:${queryName}] failed`,
    JSON.stringify({
      code: e?.code ?? "unknown",
      message: e?.message ?? String(error),
      details: e?.details,
    }),
  );
}
