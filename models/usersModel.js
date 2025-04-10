const bookshelf = require('../config/db');
const TicketsModel = require('./ticketsModel');
const usersRolesModel = require('./usersRolesModel');

let UsersModel = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,

    role: function () {
        return this.belongsTo(usersRolesModel, 'role_id', 'id');
    },

    myTickets: function () {
        return this.hasMany(TicketsModel, 'priority', 'role_id');
    },

    

});


module.exports = bookshelf.model('UsersModel',UsersModel);
