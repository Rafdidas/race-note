const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

async function hmac(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(signature);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }

  return difference === 0;
}

export async function verifyAdminPassword(
  submittedPassword: string,
  configuredPassword: string,
  sessionSecret: string,
): Promise<boolean> {
  const [submittedDigest, configuredDigest] = await Promise.all([
    hmac(submittedPassword, sessionSecret),
    hmac(configuredPassword, sessionSecret),
  ]);

  return constantTimeEqual(submittedDigest, configuredDigest);
}

export async function hashAdminSessionToken(
  token: string,
  sessionSecret: string,
): Promise<string> {
  return toBase64Url(await hmac(token, sessionSecret));
}

export function createAdminSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export function isAdminSessionExpired(
  expiresAt: string,
  now = new Date(),
): boolean {
  const expiresAtTime = new Date(expiresAt).getTime();
  return !Number.isFinite(expiresAtTime) || expiresAtTime <= now.getTime();
}
