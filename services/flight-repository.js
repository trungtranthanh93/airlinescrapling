const models = require('../models');
const common = require('../services/textUtility');
const dataCrawl = require('../services/crawl');

module.exports = {

	createOrUpdate: async function createOrUpdate(data) {
		var result = await dataCrawl.crawlAllPage(data);
		var updateValues = [];
		var insertValues = [];
		for (let element of result) {
			let existModel = await models.flight.findOne(
				{
					where: {
						FlightNumber: common.removeSpace(element.FlightNumber),
						DepartDate: element.DepartDate,
					}
				}
			);
			if (existModel != null) {
				EcoAvailable:(element.EcoPrice)? true : false,
				existModel.EcoLastPrice = existModel.EcoPrice;
				existModel.EcoPrice = element.EcoPrice;
				BusinessAvailable : (element.BusinessPrice)? true : false,
				existModel.BusinessLastPrice = existModel.BusinessPrice;
				existModel.BusinessPrice = element.BusinessPrice;
				existModel.FlightDuration = element.FlightDuration;
				existModel.DepartHour = element.DepartHour;
				existModel.ArrivalHour = element.ArrivalHour;
				existModel.ArrivalDate = element.ArrivalDate;
				updateValues.push(existModel);
			} else {
				let value = {
					FlightNumber: common.removeSpace(element.FlightNumber),
					CarrierId: common.getCarrie(element.CarrierId),
					FlightDuration: element.FlightDuration,
					Aircraft: element.Aircraft,

					EcoSeat: element.EcoSeat,
					EcoPrice: element.EcoPrice,
					EcoAvailable:(element.EcoPrice)? true : false,
					BusinessSeat: element.BusinessSeat,
					BusinessPrice: element.BusinessPrice,
					BusinessAvailable : (element.BusinessPrice)? true : false,
					//LastPrice: { type: DataTypes.INTEGER, allowNull: true },
					// Depart
					DepartCityId: data.DepartCity.Code,
					DepartHour: element.DepartHour,
					DepartDate: element.DepartDate,
					DepartAirport: element.DepartAirport,
					// Arrival
					ArrivalCityId: data.ArrivalCity.Code,
					ArrivalHour: element.ArrivalHour,
					ArrivalDate: element.ArrivalDate,
					ArrivalAirport: element.ArrivalAirport
				};
				insertValues.push(value);
			}
		}
		
		var Promises = [];
		for (let item of updateValues) {
			Promises.push(item.save());
		}
		Promises.push(models.flight.bulkCreate(insertValues));
		return Promises;
	}

}

