const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: 'Root@123',
    database: 'tickets_mern_stack'
  }
});

const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;
