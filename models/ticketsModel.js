const bookshelf = require('../config/db');
const usersModel = require('./usersModel');

const TicketsModel = bookshelf.model('TicketsModel', bookshelf.Model.extend({
  tableName: 'tickets',
  hasTimestamps: true,

  updatedByUser() {
    return this.belongsTo('usersModel', 'updated_by', 'emp_id'); // For tick.updated_by
  }

}));

module.exports = TicketsModel;
