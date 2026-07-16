function keyMaterial() {
  const secret = process.env.WEBSITE_CREDENTIALS_ENCRYPTION_KEY;
  if (!secret || secret.length < 32)
    throw new Error("WEBSITE_CREDENTIALS_ENCRYPTION_KEY must be at least 32 characters");
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
}

function encode(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value);
}

function decode(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function encryptCredentials(value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", await keyMaterial(), "AES-GCM", false, [
    "encrypt",
  ]);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return `${encode(iv)}.${encode(new Uint8Array(encrypted))}`;
}

export async function decryptCredentials<T>(value: string): Promise<T> {
  const [iv, payload] = value.split(".");
  const key = await crypto.subtle.importKey("raw", await keyMaterial(), "AES-GCM", false, [
    "decrypt",
  ]);
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: decode(iv) },
    key,
    decode(payload),
  );
  return JSON.parse(new TextDecoder().decode(clear)) as T;
}
