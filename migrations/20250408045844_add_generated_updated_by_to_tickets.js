exports.up = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.string('generated_by', 100).after("priority").notNullable();
    table.string('updated_by', 100).after("generated_by");
  });
};

exports.down = function(knex) {
  return knex.schema.table('tickets', function(table) {
    table.dropColumn('generated_by');
    table.dropColumn('updated_by');
  });
};
