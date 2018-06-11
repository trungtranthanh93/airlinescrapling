'use strict';

module.exports = (sequelize, DataTypes) => {    
    var columns = {
        Code: { type: DataTypes.STRING, primaryKey: true },
        Name: { type: DataTypes.STRING, allowNull: false },
        IsAutoCrawl: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    };
    var option = {
        timestamps: false,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        tableName: 'City',
    };

    var City = sequelize.define('city', columns, option);

    return City;
}