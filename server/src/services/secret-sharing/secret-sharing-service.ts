import { db } from "@app/db/knex";
import crypto from "node:crypto";
import * as argon2 from "argon2";
import { decryptSymmetric, encryptSymmetric } from "@app/lib/crypto/encryption";

const FRAGMENT_SIZE = 64; // We can change this based on what types of data we expect. For simple messages I'm keeping it lower.
const MASTER_ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY!;
const ARGON_CONFIG = {
  timeCost: 3,
  memoryCost: 4096,
  hashLength: 32,
  parallelism: 1,
};

async function deriveEncryptionKey(
  secretId: string,
  password?: string,
): Promise<Buffer> {
  // Create a base key (which does not require password)
  const baseKey = crypto
    .createHmac("sha256", MASTER_ENCRYPTION_KEY)
    .update(secretId)
    .digest();

  if (!password) return baseKey;

  // Combine with password-derived key
  const passwordKey = await argon2.hash(password, {
    ...ARGON_CONFIG,
    salt: baseKey,
    raw: true,
  });

  return crypto.createHmac("sha256", baseKey).update(passwordKey).digest();
}

// Create a secret and return its slug
export async function createSecret({
  content,
  daysActive,
  viewsCount,
  password,
}: {
  content: string;
  daysActive: number;
  viewsCount?: number;
  password?: string;
}) {
  let slug: string;
  let attempts = 0;

  // Attempt to generate unique slug with collision prevention
  do {
    slug = crypto.randomBytes(4).toString("hex");
    if (++attempts > 10) throw new Error("Slug generation failed");
  } while (await db("secrets").where({ slug }).first());

  return db.transaction(async (trx) => {
    const [secret] = await trx("secrets")
      .insert({
        slug,
        password_hash: password ? await argon2.hash(password) : null,
        expires_at: new Date(Date.now() + daysActive * 24 * 60 * 60 * 1000), // Today + daysActive
        max_views_count: viewsCount,
        views_count: viewsCount ? 0 : null,
      })
      .returning("id");

    const encryptionKey = await deriveEncryptionKey(secret.id, password);

    // Split and encrypt content
    const fragments: {
      ciphertext: Buffer;
      iv: Buffer;
      tag: Buffer;
      order: number;
    }[] = [];

    for (let i = 0; i < content.length; i += FRAGMENT_SIZE) {
      const fragmentData = encryptSymmetric(
        content.slice(i, i + FRAGMENT_SIZE),
        encryptionKey,
      );

      fragments.push({ ...fragmentData, order: fragments.length });
    }

    // Store fragments
    await trx("secret_fragments").insert(
      fragments.map((f) => ({
        secret_id: secret.id,
        iv: f.iv,
        tag: f.tag,
        encrypted_data: f.ciphertext,
        fragment_order: f.order,
      })),
    );

    return { slug };
  });
}

// Fetch a secret by its slug
export async function fetchSecretUsingSlug(
  slug: string,
  password?: string,
): Promise<{
  success: boolean;
  data?: {
    content: string;
    expiresAt: Date;
  };
  errorCode?: string;
  errorMessage?: string;
}> {
  const secret = await db("secrets").where({ slug }).first();
  if (!secret) {
    return {
      success: false,
      errorCode: "NOT_FOUND",
      errorMessage: "Secret not found",
    };
  }

  // Check expiry
  if (new Date() > new Date(secret.expires_at)) {
    return {
      success: false,
      errorCode: "NOT_FOUND",
      errorMessage: "Secret has recently expired.",
    };
  }

  // Check if views count is over max_views_count
  if (
    secret.views_count !== null &&
    secret.max_views_count !== null &&
    secret.views_count > secret.max_views_count
  ) {
    return {
      success: false,
      errorCode: "NOT_FOUND",
      errorMessage: "Secret has been viewed too much.",
    };
  }

  // Increment view count
  if (secret.views_count !== null) {
    await db("secrets")
      .update("views_count", secret.views_count + 1)
      .where({ id: secret.id });
  }

  // Check password if secret has one
  if (secret.password_hash) {
    if (!password) {
      return {
        success: false,
        errorCode: "PASSWORD_REQUIRED",
        errorMessage: "Password required",
      };
    }

    const passwordValid = await argon2.verify(
      secret.password_hash.toString(),
      password,
    );
    if (!passwordValid) {
      return {
        success: false,
        errorCode: "INVALID_PASSWORD",
        errorMessage: "Invalid password",
      };
    }
  }

  const encryptionKey = await deriveEncryptionKey(secret.id, password);

  // Fetch and decrypt fragments
  const fragments = await db("secret_fragments")
    .where({ secret_id: secret.id })
    .orderBy("fragment_order");

  let content = "";
  for (const fragment of fragments) {
    const decrypted = decryptSymmetric({
      ciphertext: fragment.encrypted_data,
      iv: fragment.iv,
      tag: fragment.tag,
      key: encryptionKey,
    });
    content += decrypted;
  }

  return { success: true, data: { content, expiresAt: secret.expires_at } };
}
