const bookshelf = require('../config/db');
const TicketsModel = require('./ticketsModel');
const usersModel = require('./usersModel');

const TicketLogModel = bookshelf.model('TicketLogModel', bookshelf.Model.extend({
  tableName: 'ticket_log',
  hasTimestamps: true,

  tick() {
    return this.belongsTo('TicketsModel', 'ticket_id');
  },

  tickUpdater() {
    return this.belongsTo('usersModel', 'updated_by', 'emp_id');
  }

}));

module.exports = TicketLogModel;
