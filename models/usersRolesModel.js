const bookshelf = require('../config/db');

let UserRolesModel = bookshelf.Model.extend({
    tableName: 'users_role',
    hasTimestamps: true,

});


module.exports = bookshelf.model('UserRolesModel',UserRolesModel);
