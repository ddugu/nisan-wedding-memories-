function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function getSupabaseUrl(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | undefined {
  return trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return (
    trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    trimEnv(process.env.SUPABASE_SECRET_KEY)
  );
}

export function getIpHashSalt(): string | undefined {
  return trimEnv(process.env.IP_HASH_SALT);
}

/** Logs presence only — never logs secret values. */
export function logMemoryApiEnvStatus(context: string) {
  console.error(`[memories:${context}] env status`, {
    hasSupabaseUrl: Boolean(getSupabaseUrl()),
    hasAnonKey: Boolean(getSupabaseAnonKey()),
    hasServiceRoleKey: Boolean(getSupabaseServiceRoleKey()),
    hasIpHashSalt: Boolean(getIpHashSalt()),
    nodeEnv: process.env.NODE_ENV,
  });
}

export function logSupabaseError(context: string, error: unknown) {
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    console.error(`[memories:${context}]`, {
      code: e.code ?? null,
      message: e.message ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    });
    return;
  }

  console.error(`[memories:${context}]`, error);
}
