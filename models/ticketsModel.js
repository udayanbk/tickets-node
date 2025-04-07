const bookshelf = require('../config/db');

const TicketsModel = bookshelf.model('TicketsModel', bookshelf.Model.extend({
  tableName: 'tickets',
  hasTimestamps: true,
}));

module.exports = TicketsModel;
