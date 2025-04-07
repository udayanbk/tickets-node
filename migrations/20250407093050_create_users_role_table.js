/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users_role', table => {
    table.increments('id').primary();
    table.string('role_name').notNullable();
    table.timestamps(true, true); // created_at and updated_at
  });

  // Insert initial roles
  await knex('users_role').insert([
    { role_name: 'Admin' },
    { role_name: 'Manager' },
    { role_name: 'Supervisor' },
    { role_name: 'Agent' }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users_role');
};
