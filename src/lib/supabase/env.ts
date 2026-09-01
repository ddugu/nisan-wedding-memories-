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
      name: e.name ?? null,
      code: e.code ?? e.error ?? null,
      message: e.message ?? null,
      status: e.status ?? e.statusCode ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    });
    return;
  }

  console.error(`[memories:${context}]`, error);
}

export type MemoryPipelineStage =
  | "validation"
  | "storage-reserve"
  | "storage-upload"
  | "storage-delete"
  | "db-insert"
  | "db-delete";

export class MemoryPipelineError extends Error {
  readonly stage: MemoryPipelineStage;
  readonly details?: Record<string, unknown>;

  constructor(
    stage: MemoryPipelineStage,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MemoryPipelineError";
    this.stage = stage;
    this.details = details;
  }
}
