const express = require('express');
const router = express.Router();
const models = require('../models');
const Op = models.Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const numberUtil = require('../services/numberUtility');
const textUtil = require('../services/textUtility');
const flightRepo = require('../services/flight-repository')

router.get('/', async function (req, res, next) {
    var query = req.query;

    /* Build metadata */
    var result = {};
    result.title = "Quay lại";
    result.navigateIcon = '<i class="fa fa-angle-left fa-fw"></i>';

    result.DepartDate = query.DepartDate;
    // City
    var cities = await models.city.findAll({
        where: { Code: { [Op.in]: [query.DepartCity, query.ArrivalCity] } }
    });
    result.DepartCity = _.find(cities, ['Code', query.DepartCity]);
    result.ArrivalCity = _.find(cities, ['Code', query.ArrivalCity]);

    // Date
    result.Dates = [];
    var searchDate = moment(query.DepartDate, "YYYY/MM/DD");
    for (i = 0; i < 7; i++) {
        let addDate = moment(query.DepartDate, "YYYY/MM/DD").subtract(3, "days").add(i, "days");
        let formatAddDate = addDate.format("YYYY/MM/DD");
        let active = searchDate.diff(addDate) == 0;
        result.Dates.push({
            DoW: addDate.format("dddd"),
            Day: formatAddDate,
            Active: active,
            Url: req.baseUrl + "?" +
                "DepartCity=" + query["DepartCity"] + "&" +
                "ArrivalCity=" + query["ArrivalCity"] + "&" +
                "DepartDate=" + encodeURIComponent(formatAddDate)
        })
    }

    res.render('result', result);
});

router.post('/', async function (req, res, next) {
    var body = req.body;

    /* Data to Fetch */
    var data = {};

    var cities = await models.city.findAll({
        where: { Code: { [Op.in]: [body.DepartCity, body.ArrivalCity] } }
    });
    data.DepartCity = _.find(cities, ['Code', body.DepartCity]);
    data.ArrivalCity = _.find(cities, ['Code', body.ArrivalCity]);;
    data.DepartDate = body.DepartDate;

    /** Check last updated 2 hours ago
     * If yes then fetch new data */
    var existFlight = await models.flight.findOne({
        where: {
            DepartDate: body.DepartDate,
            DepartCityId: body.DepartCity,
            ArrivalCityId: body.ArrivalCity
        }
    });
    if (textUtil.isNullOrUndefined(existFlight)) {
        await flightRepo.createOrUpdate(data);
    }
    else {
        var lastUpdated = existFlight.updated_at || existFlight.created_at;
        if (moment().isAfter(moment(lastUpdated).add(2, 'h'))) {
            await flightRepo.createOrUpdate(data);
        }
    };
    
    /* Get Flight from DB */
    var flights = await models.flight.findAll({
        include: [{ all: true }],
        where: {
            DepartDate: body.DepartDate,
            DepartCityId: body.DepartCity,
            ArrivalCityId: body.ArrivalCity
        }
    });
    _.forEach(flights, (flight) => {        
        flight.DepartHour = flight.DepartHour.substr(0, 5);
        flight.ArrivalHour = flight.ArrivalHour.substr(0, 5);
        // Eco Price
        if (flight.EcoAvailable != false) {
            if (textUtil.isNullOrUndefined(flight.EcoLastPrice))
                flight.EcoLastPrice = flight.EcoPrice;
            flight.IsEcoIncrease = flight.EcoPrice >= flight.EcoLastPrice;
            flight.EcoIncreaseAmount = flight.EcoPrice - flight.EcoLastPrice;
            flight.EcoIncreasePercent = Math.round(flight.EcoIncreaseAmount / flight.EcoLastPrice * 100);
            flight.EcoIncreaseAmount = numberUtil.toLocaleString(flight.EcoIncreaseAmount);
            flight.EcoPrice = numberUtil.toLocaleString(flight.EcoPrice);
        }
        // Business Price
        if (flight.BusinessAvailable != false) {
            if (textUtil.isNullOrUndefined(flight.BusinessLastPrice))
                flight.BusinessLastPrice = flight.BusinessPrice;
            flight.IsBusinessIncrease = flight.BusinessPrice >= flight.BusinessLastPrice;
            flight.BusinessIncreaseAmount = flight.BusinessPrice - flight.BusinessLastPrice;
            flight.BusinessIncreasePercent = Math.round(flight.BusinessIncreaseAmount / flight.BusinessLastPrice * 100);
            flight.BusinessIncreaseAmount = numberUtil.toLocaleString(flight.BusinessIncreaseAmount);
            flight.BusinessPrice = numberUtil.toLocaleString(flight.BusinessPrice);
        }
    });
    var groupFlight = _.groupBy(flights, 'CarrierId');
    var result = {};
    result.vietJetFlights = _.sortBy(groupFlight['vj'], 'DepartHour');
    result.vietnamAirlineFlights = _.sortBy(groupFlight['vn'], 'DepartHour');

    res.render('_listFlight', result);
});

module.exports = router;