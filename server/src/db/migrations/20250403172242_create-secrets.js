// I won't be making the secrets editable so I will not be using the updated_at field or related functions

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("secrets", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("slug").unique().notNullable();
      table.binary("password_hash"); // Used to quickly verify password before starting decryption routine

      table.timestamp("expires_at").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index(["slug"]); // For fast slug lookups
      table.index(["expires_at"]); // For efficient cleanup of expired secrets
    })
    .createTable("secret_fragments", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("secret_id")
        .references("id")
        .inTable("secrets")
        .onDelete("CASCADE");
      table.binary("iv").notNullable();
      table.binary("tag").notNullable();
      table.binary("encrypted_data").notNullable();
      table.integer("fragment_order").notNullable();

      table.index(["secret_id"]); // For efficient fragment retrieval
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("secret_fragments")
    .dropTableIfExists("secrets");
};
