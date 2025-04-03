import crypto from "node:crypto";

export const IV_BYTES_SIZE = 12;

export const decryptSymmetric = ({
  ciphertext,
  iv,
  tag,
  key,
}: {
  ciphertext: string;
  iv: string;
  tag: string;
  key: string;
}): string => {
  const secretKey = crypto.createSecretKey(key, "base64");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    secretKey,
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let plaintext = decipher.update(ciphertext, "base64", "utf8");
  plaintext += decipher.final("utf8");

  return plaintext;
};

export function encryptSymmetric(plaintext: string, key: string) {
  const secretKey = crypto.createSecretKey(key, "base64");
  const iv = crypto.randomBytes(IV_BYTES_SIZE);

  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "base64");
  ciphertext += cipher.final("base64");

  return {
    ciphertext,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function generateHash(value: string | Buffer) {
  crypto.createHash("sha256").update(value).digest("hex");
}
