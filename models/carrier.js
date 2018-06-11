'use strict';

module.exports = (sequelize, DataTypes) => {    
    var columns = {
        Id: { type: DataTypes.UUID, primaryKey: true },
        Name: { type: DataTypes.STRING, allowNull: false }
    };
    var option = {
        timestamps: false,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        tableName: 'Carrier',
    };

    var Carrier = sequelize.define('carrier', columns, option);

    return Carrier;
}