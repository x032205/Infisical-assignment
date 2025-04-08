/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("secrets", (table) => {
    table.integer("max_views_count");
    table.integer("views_count");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("secrets", (table) => {
    table.dropColumn("max_views_count");
    table.dropColumn("views_count");
  });
};
