/**
 * Role model
 * Springload - 2014
 *
 **/

module.exports = function (sequelize, DataTypes) {
    var Role = sequelize.define('roles', {
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: "Please enter a role name"
                }
            }
        }
    }, {
        tableName: 'roles',

        getterMethods: {
            hashId: function() {

                var app = Role.getApplication();

                return app.lib.utils.hashId(app, this.getDataValue('id'))
            }
        }
    })

    return Role
}
