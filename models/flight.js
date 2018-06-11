'use strict';

module.exports = (sequelize, DataTypes) => {
    var columns = {
        Id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
        FlightNumber: { type: DataTypes.STRING, allowNull: false },
        CarrierId: { type: DataTypes.STRING, allowNull: false },
        FlightDuration: { type: DataTypes.STRING, allowNull: true },
        Aircraft: { type: DataTypes.UUID, allowNull: true },
        EcoSeat: { type: DataTypes.STRING, allowNull: true },
        EcoAvailable: { type: DataTypes.BOOLEAN, allowNull: true },
        EcoPrice: { type: DataTypes.INTEGER, allowNull: true },
        EcoLastPrice: { type: DataTypes.INTEGER, allowNull: true },
        BusinessSeat: { type: DataTypes.STRING, allowNull: true },
        BusinessAvailable: { type: DataTypes.BOOLEAN, allowNull: true },
        BusinessPrice: { type: DataTypes.INTEGER, allowNull: true },
        BusinessLastPrice: { type: DataTypes.INTEGER, allowNull: true },
        // Depart
        DepartCityId: { type: DataTypes.STRING, allowNull: false },
        DepartHour: { type: DataTypes.TIME, allowNull: true },
        DepartDate: { type: DataTypes.DATEONLY, allowNull: true },
        DepartAirport: { type: DataTypes.STRING, allowNull: true },
        // Arrival
        ArrivalCityId: { type: DataTypes.STRING, allowNull: false },
        ArrivalHour: { type: DataTypes.TIME, allowNull: true },
        ArrivalDate: { type: DataTypes.DATEONLY, allowNull: true },
        ArrivalAirport: { type: DataTypes.STRING, allowNull: true }
    };
    var option = {
        timestamps: true,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        tableName: 'Flight',
    };

    var Flight = sequelize.define('flight', columns, option);

    // Relationship
    Flight.associate = function (models) {
        models.flight.belongsTo(models.city, {foreignKey: 'DepartCityId', as: 'DepartCity'});
        models.flight.belongsTo(models.city, {foreignKey: 'ArrivalCityId', as: 'ArrivalCity'});
        models.flight.belongsTo(models.carrier, {foreignKey: 'CarrierId', as: 'Carrier'});
    };

    return Flight;
}