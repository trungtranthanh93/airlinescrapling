const cheerio = require('cheerio');
const Nightmare = require('nightmare')
const commont = require('../services/textUtility')
const DatePartern = 'DD-MM-YYYY';
const moment = require('moment');

module.exports = {
    crawl: async function (data) {
        var flight_json = {};
        var url = "http://bookvj.aivivu.com/FlightsDomestic.aspx?";
        url += "Itinerary=" + '1';
        url += "&DepartCity=" + data.DepartCity.Code;
        url += "&ArrivalCity=" + data.ArrivalCity.Code;
        url += "&DepartDate=" + moment(data.DepartDate,'YYYY/MM/DD').format('MMDDYYYY');
     //   url += "&ReturnDate=" + data.ReturnDate.replace('/', '').replace('/', '');
        url += "&Adt=" + '1';
        url += "&Chd=0";
        url += "&Inf=0";
        url += "&Airline=";
        url += "&Info=";
        console.log(url);
        await new Nightmare({
            show: true,
            executionTimeout: 6000
        }).goto(url)
            //  .type('#search_form_input_homepage', 'github nightmare')
            //  .click('#search_button_homepage')
            .wait('.FlightDetail')
            .evaluate(() => document.querySelector('body').outerHTML)
            .end()
            .then((html) => {
                const $ = cheerio.load(html);
                flight_json.departArray = [];
                flight_json.returnArray = [];
                $('#ctl00_MainContent_pnDepartFlight').find('.FlightItem').each(function (i, elem) {
                    var idContent = $(this).attr('id');
                    var numberID = idContent.replace('pnDepartItem', '');
                    departFlight = {};
                    departFlight.flightInfo = {};
                    departFlight.flightInfo.flighNumber = $(this).find(".FlightInfo .FlightNumber").text().trim();

                    var id = "#DepartFlightDetail" + numberID;

                    departFlight.flightInfo.carrierName = $(this).find(id + " .ItineraryBox-Carrier .CarrierName").text().trim();
                    departFlight.flightInfo.FltTime = $(this).find(id + " .ItineraryBox-Direct .FltTime").text().trim();
                    var flightInfo = $(this).find('.ItineraryBox-FlightInfo').find('.col2');
                    departFlight.flightInfo.rankSeat = $(flightInfo[0]).text().trim();
                    departFlight.flightInfo.aircraft = $(flightInfo[1]).text().trim();

                    departFlight.flightInfo.depart = {};
                    departFlight.flightInfo.depart.city = $(this).find(id + " .ItineraryBox-Depart .City").text().trim();
                    departFlight.flightInfo.depart.airport = $(this).find(id + " .ItineraryBox-Depart .Airport").text().trim();
                    departFlight.flightInfo.depart.hour = $(this).find(id + " .ItineraryBox-Depart .Hour").text().trim();
                    departFlight.flightInfo.depart.date =commont.formatDate($(this).find(id + " .ItineraryBox-Depart .Date").text().trim(),DatePartern);

                    departFlight.flightInfo.arrival = {};
                    departFlight.flightInfo.arrival.city = $(this).find(id + " .ItineraryBox-Arrival .City").text().trim();
                    departFlight.flightInfo.arrival.airport = $(this).find(id + " .ItineraryBox-Arrival .Airport").text().trim();
                    departFlight.flightInfo.arrival.hour = $(this).find(id + " .ItineraryBox-Arrival .Hour").text().trim();
                    departFlight.flightInfo.arrival.date =commont.formatDate( $(this).find(id + " .ItineraryBox-Arrival .Date").text().trim(),DatePartern);




                    departFlight.detailPriceBox = {};
                    departFlight.detailPriceBox.adults = {};
                    departFlight.detailPriceBox.children = {};
                    departFlight.detailPriceBox.baby = {};
                    var row = $(this).find(id + " .DetailPriceBox").find("tr");

                    var adults = $(row[1])
                    departFlight.detailPriceBox.adults.count = adults.find("td:nth-child(2)").text().trim();
                    departFlight.detailPriceBox.adults.price = adults.find("td:nth-child(3)").text().trim();
                    departFlight.detailPriceBox.adults.tax = adults.find("td:nth-child(4)").text().trim();
                    departFlight.detailPriceBox.adults.total = adults.find("td:nth-child(5)").text().trim();


                    // var children = $(row[2]);
                    // departFlight.detailPriceBox.children.count = children.find("td:nth-child(2)").text().trim();
                    // departFlight.detailPriceBox.children.price = children.find("td:nth-child(3)").text().trim();
                    // departFlight.detailPriceBox.children.tax = children.find("td:nth-child(4)").text().trim();
                    // departFlight.detailPriceBox.children.total = children.find("td:nth-child(5)").text().trim();

                    // var baby = $(row[3]);
                    // departFlight.detailPriceBox.baby.count = baby.find("td:nth-child(2)").text().trim();
                    // departFlight.detailPriceBox.baby.price = baby.find("td:nth-child(3)").text().trim();
                    // departFlight.detailPriceBox.baby.tax = baby.find("td:nth-child(4)").text().trim();
                    // departFlight.detailPriceBox.baby.total = baby.find("td:nth-child(5)").text().trim();

                    flight_json.departArray.push(departFlight);
                });
                // $('#ctl00_MainContent_pnReturnFlight').find('.FlightItem').each(function (i, elem) {
                //     var idContent = $(this).attr('id');
                //     var numberID = idContent.replace('pnReturnItem', '');
                //     returnFlight = {};
                //     returnFlight.flightInfo = {};
                //     returnFlight.flightInfo.flighNumber = $(this).find(".FlightInfo .FlightNumber").text().trim();

                //     var id = "#ReturnFlightDetail" + numberID;
                //     returnFlight.flightInfo = {};
                //     returnFlight.flightInfo.carrierName = $(this).find(id + " .ItineraryBox-Carrier .CarrierName").text().trim();
                //     returnFlight.flightInfo.FltTime = $(this).find(id + " .ItineraryBox-Direct .FltTime").text().trim();
                //     var flightInfo = $(this).find('.ItineraryBox-FlightInfo').find('.col2');
                //     returnFlight.flightInfo.rankSeat = $(flightInfo[0]).text().trim();
                //     returnFlight.flightInfo.aircraft = $(flightInfo[1]).text().trim();

                //     returnFlight.flightInfo.depart = {};
                //     returnFlight.flightInfo.depart.city = $(this).find(id + " .ItineraryBox-Depart .City").text().trim();
                //     returnFlight.flightInfo.depart.airport = $(this).find(id + " .ItineraryBox-Depart .Airport").text().trim();
                //     returnFlight.flightInfo.depart.hour = $(this).find(id + " .ItineraryBox-Depart .Hour").text().trim();
                //     returnFlight.flightInfo.depart.date = $(this).find(id + " .ItineraryBox-Depart .Date").text().trim();



                //     returnFlight.flightInfo.arrival = {};
                //     returnFlight.flightInfo.arrival.depart = {};
                //     returnFlight.flightInfo.arrival.city = $(this).find(id + " .ItineraryBox-Depart .City").text().trim();
                //     returnFlight.flightInfo.arrival.airport = $(this).find(id + " .ItineraryBox-Depart .Airport").text().trim();
                //     returnFlight.flightInfo.arrival.hour = $(this).find(id + " .ItineraryBox-Depart .Hour").text().trim();
                //     returnFlight.flightInfo.arrival.date = $(this).find(id + " .ItineraryBox-Depart .Date").text().trim();



                //     returnFlight.detailPriceBox = {};
                //     returnFlight.detailPriceBox.adults = {};
                //     returnFlight.detailPriceBox.children = {};
                //     returnFlight.detailPriceBox.baby = {};
                //     var row = $(this).find(id + " .DetailPriceBox").find("tr");

                //     var adults = $(row[1])
                //     returnFlight.detailPriceBox.adults.count = adults.find("td:nth-child(2)").text().trim();
                //     returnFlight.detailPriceBox.adults.price = adults.find("td:nth-child(3)").text().trim();
                //     returnFlight.detailPriceBox.adults.tax = adults.find("td:nth-child(4)").text().trim();
                //     returnFlight.detailPriceBox.adults.total = adults.find("td:nth-child(4)").text().trim();


                //     var children = $(row[2]);
                //     returnFlight.detailPriceBox.children.count = children.find("td:nth-child(2)").text().trim();
                //     returnFlight.detailPriceBox.children.price = children.find("td:nth-child(3)").text().trim();
                //     returnFlight.detailPriceBox.children.tax = children.find("td:nth-child(4)").text().trim();
                //     returnFlight.detailPriceBox.children.total = children.find("td:nth-child(4)").text().trim();

                //     var baby = $(row[3]);
                //     returnFlight.detailPriceBox.baby.count = baby.find("td:nth-child(2)").text().trim();
                //     returnFlight.detailPriceBox.baby.price = baby.find("td:nth-child(3)").text().trim();
                //     returnFlight.detailPriceBox.baby.tax = baby.find("td:nth-child(4)").text().trim();
                //     returnFlight.detailPriceBox.baby.total = baby.find("td:nth-child(4)").text().trim();

                //     flight_json.returnArray.push(returnFlight);
                // });
            })
            .catch(error => {
                console.error('Search failed:', error)
                flight_json();
            });
        return flight_json;
    }
}