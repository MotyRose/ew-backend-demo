export function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`Env Variable not found: '${name}'`);
  }

  return value;
}

export function getBooleanEnv(
  name: string,
  defaultValue: boolean = false,
): boolean {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return defaultValue;
  }

  // Handle common truthy values
  const normalizedValue = value.toLowerCase().trim();
  return (
    normalizedValue === "true" ||
    normalizedValue === "1" ||
    normalizedValue === "yes"
  );
}
