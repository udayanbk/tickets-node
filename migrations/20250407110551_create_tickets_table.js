/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tickets', (table) => {
    table.increments('id').primary();
    table.integer('emp_id').notNullable();
    table.string('title', 100).notNullable();
    table.text('description').notNullable();
    table.integer('category').notNullable();
    table.integer('priority').notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tickets');
};
