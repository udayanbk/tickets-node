const bookshelf = require('../config/db');
const usersRolesModel = require('./usersRolesModel');

let UsersModel = bookshelf.Model.extend({
    tableName: 'users',
    hasTimestamps: true,

    role: function () {
        return this.belongsTo(usersRolesModel, 'role_id', 'id');
      }

});


module.exports = bookshelf.model('UsersModel',UsersModel);
