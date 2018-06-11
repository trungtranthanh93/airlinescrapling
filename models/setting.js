'use strict';

module.exports = (sequelize, DataTypes) => {    
    var columns = {
        Key: { type: DataTypes.STRING, primaryKey: true },
        Value: { type: DataTypes.STRING, allowNull: false }
    };
    var option = {
        timestamps: false,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        tableName: 'Setting',
    };

    var Setting = sequelize.define('setting', columns, option);
    return Setting;
}