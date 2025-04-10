exports.up = function (knex) {
  return knex.schema.createTable('ticket_log', function (table) {
    table.increments('id').primary();
    table.integer('ticket_id').unsigned().notNullable();
    table.string('created_by', 100).notNullable();
    table.string('updated_by', 100).notNullable();
    table.string('comment', 100);
    table.integer('priority').notNullable();
    table.string('status', 20);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('ticket_log');
};
