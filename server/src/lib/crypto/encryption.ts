import crypto from "node:crypto";

export const IV_BYTES_SIZE = 12;

export const decryptSymmetric = ({
  ciphertext,
  iv,
  tag,
  key,
}: {
  ciphertext: Buffer;
  iv: Buffer;
  tag: Buffer;
  key: Buffer;
}): string => {
  const secretKey = crypto.createSecretKey(key);

  const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey, iv);
  decipher.setAuthTag(tag);

  let plaintext = decipher.update(ciphertext);
  plaintext = Buffer.concat([plaintext, decipher.final()]);

  return plaintext.toString("utf8");
};

export function encryptSymmetric(plaintext: string, key: Buffer) {
  const secretKey = crypto.createSecretKey(key);
  const iv = crypto.randomBytes(IV_BYTES_SIZE);

  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey, iv);

  let ciphertext = cipher.update(plaintext);
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);

  return {
    ciphertext,
    iv: iv,
    tag: cipher.getAuthTag(),
  };
}

export function generateHash(value: string | Buffer) {
  crypto.createHash("sha256").update(value).digest("hex");
}
