const NODE_ENVS = ['development', 'test', 'production'] as const;

export type NodeEnv = (typeof NODE_ENVS)[number];

/**
 * Validated, typed view of the environment the API needs to boot.
 *
 * Only variables the application actually reads are represented here; the set
 * grows alongside the features that consume them.
 */
export interface Env {
  NODE_ENV: NodeEnv;
  PORT: number;
  WEB_ORIGIN: string;
}

const DEFAULTS = {
  NODE_ENV: 'development',
  PORT: '3000',
  WEB_ORIGIN: 'http://localhost:5173',
} as const;

function readString(source: Record<string, unknown>, key: keyof typeof DEFAULTS): string {
  const value = source[key];
  if (typeof value !== 'string' || value.trim() === '') {
    return DEFAULTS[key];
  }
  return value.trim();
}

function isNodeEnv(value: string): value is NodeEnv {
  return (NODE_ENVS as readonly string[]).includes(value);
}

function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Fails fast at startup rather than surfacing misconfiguration as a confusing
 * runtime error later. Wired into ConfigModule via its `validate` hook.
 */
export function validateEnv(source: Record<string, unknown>): Env {
  const errors: string[] = [];

  const nodeEnv = readString(source, 'NODE_ENV');
  if (!isNodeEnv(nodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${NODE_ENVS.join(', ')} (received "${nodeEnv}")`);
  }

  const rawPort = readString(source, 'PORT');
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push(`PORT must be an integer between 1 and 65535 (received "${rawPort}")`);
  }

  const webOrigin = readString(source, 'WEB_ORIGIN');
  if (!isHttpOrigin(webOrigin)) {
    errors.push(`WEB_ORIGIN must be an http(s) URL (received "${webOrigin}")`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return {
    NODE_ENV: nodeEnv as NodeEnv,
    PORT: port,
    WEB_ORIGIN: webOrigin,
  };
}
