function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const databaseUrl =
  `postgresql://` +
  `${requireEnv('DB_USER')}:${requireEnv('DB_PASSWORD')}` +
  `@${requireEnv('DB_HOST')}:${requireEnv('DB_PORT')}` +
  `/${requireEnv('DB_NAME')}`;
