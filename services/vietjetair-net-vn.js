const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const common = require('../services/textUtility');
const moment = require('moment');
const DatePartern = 'DD.MM.YYYY';
const _ = require('lodash');
const fees = 336000; 
const tax = 0.1;
module.exports = {
    crawl: async function (data) {
        data.FormatDepartDate = moment(data.DepartDate, 'YYYY/MM/DD').format('DD/MM/YYYY');
        var flight_json = [];
        var url = "https://vietjetair.net.vn";
        var nightmare = new Nightmare({
            show: true, loadTimeout: 120 * 1000,
            waitTimeout: 120 * 1000
        });
        await nightmare.goto(url)
            .evaluate((data) => {
                document.querySelector('.bt-diem-den span').removeAttribute('data-code');
                document.querySelector('.bt-diem-den span').setAttribute('data-code', data.ArrivalCity.Code);
                document.querySelector('.bt-diem-den span').innerHTML = data.ArrivalCity.Name;
                document.querySelector('.bt-diem-di span').removeAttribute('data-cde');
                document.querySelector('.bt-diem-di span').setAttribute('data-code', data.DepartCity.Code);
                document.querySelector('.bt-diem-di span').innerHTML = data.DepartCity.Name;;
                document.querySelector('#date_di').setAttribute('value', data.FormatDepartDate);
                // document.querySelector('#date_ve').setAttribute('value', data.ReturnDate);
                document.querySelector('#num-adault-xs').setAttribute('value', '1');
                document.querySelector('#num-adault').setAttribute('value', '2');
                // document.querySelector('#num-child-xs').setAttribute('value', '1');
                // document.querySelector('#num-baby-xs').setAttribute('value', '1');
                document.querySelector('.btn-tim-ve').click();
                return nightmare;
            }, data).wait('.FlightItem')
            .evaluate(() => document.querySelector('body').outerHTML)
            .then((elementExists) => {
                if (elementExists) {
                    return nightmare
                        .evaluate(() => {
                            document.querySelectorAll('.FlightItem .Detail .show-detail a').forEach(function (el) {
                                el.click(); 
                            });
                            return nightmare;
                        })
                        .wait(10000)
                        .evaluate(() => document.querySelector('body').outerHTML)
                        .end()
                        .then((html) => {
                            const $ = cheerio.load(html);
                            $('#original').find('.flight-details').each(function (i, elem) {
                                departFlight = {};
                                departFlight.FlightNumber = $(this).find(" .ItineraryBox-Direct .FltNum .col2").text().trim();

                                departFlight.CarrierId = $(this).find(" .ItineraryBox-Carrier .CarrierName").text().trim();
                                departFlight.FlightDuration = $(this).find(" .ItineraryBox-Direct .FltTime .col2").text().trim();

                                var flightInfo = $(this).find('.ItineraryBox-FlightInfo').find('.col2');
                                departFlight.Aircraft = $(flightInfo[1]).text().trim();

                                departFlight.DepartCityId = $(this).find(" .ItineraryBox-Depart .City").text().trim();
                                departFlight.DepartAirport = $(this).find(" .ItineraryBox-Depart .Airport").text().trim();
                                departFlight.DepartHour = $(this).find(" .ItineraryBox-Depart .Hour").text().trim();
                                departFlight.DepartDate = common.formatDate($(this).find(" .ItineraryBox-Depart .Date").text().trim(), DatePartern);



                                departFlight.ArrivalCityId = $(this).find(" .ItineraryBox-Arrival .City").text().trim();
                                departFlight.ArrivalAirport = $(this).find(" .ItineraryBox-Arrival .Airport").text().trim();
                                departFlight.ArrivalHour = $(this).find(" .ItineraryBox-Arrival .Hour").text().trim();
                                departFlight.ArrivalDate = common.formatDate($(this).find(" .ItineraryBox-Arrival .Date").text().trim(), DatePartern);

                                var seatName = $(flightInfo[0]).text().trim();
                                var adults = $($(this).find(" .DetailPriceBox").find("tr")[1]);
                                var prices = adults.find("td:nth-child(3)").text().trim();

                                if (seatName.toLowerCase().includes('eco')) {
                                    departFlight.EcoSeat = seatName;
                                    departFlight.EcoPrice = common.returnJustNumber(prices);


                                } else {
                                    departFlight.BusinessSeat = seatName;
                                    departFlight.BusinessPrice = common.returnJustNumber(prices);

                                }
                                flight_json.push(departFlight);
                            });
                        })
                } else {
                    console.log(elementExists);
                    return nightmare.end();
                }
            })
            .catch(error => {
                console.error('Search failed:', error)
            });
        return extendFlightSeat(flight_json);
    }

}
function extendFlightSeat(flight_json) {
    var result = [];
    var ecoArr = _.filter(flight_json, function (e) {
        return e.EcoSeat ;
    })
    var skyBossArr = _.filter(flight_json, function (e) {
        return e.BusinessSeat;
    })
    var mergedList = _.map(ecoArr, function (item) {
        return _.extend({}, item, _.find(skyBossArr, ['FlightNumber', item.FlightNumber]));
    });
    mergedList.map(function(e){
        e.EcoPrice = calPriceAfterTax(e.EcoPrice,tax,fees);
        e.BusinessPrice = calPriceAfterTax(e.BusinessPrice,tax,fees);
        return e;
    })
    return mergedList;
}
function calPriceAfterTax(price, tax, fees){
    return price + price*tax + fees; 
}