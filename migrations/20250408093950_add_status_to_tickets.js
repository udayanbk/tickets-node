exports.up = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.string('status', 20).after("updated_by").defaultTo('new');
  });
};

exports.down = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.dropColumn('status');
  });
};
