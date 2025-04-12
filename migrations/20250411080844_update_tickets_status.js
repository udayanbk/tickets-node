exports.up = function(knex) {
  return knex.schema.alterTable('tickets', function(table) {
    table.string('status', 20).defaultTo('New').alter();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('tickets', function(table) {
    table.string('status', 20).defaultTo('pending').alter(); // previous default
  });
};
