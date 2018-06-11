const cheerio = require('cheerio');
const Nightmare = require('nightmare')
const common = require('../services/textUtility')
const DatePartern = 'YYYY-MM-DD';
const moment = require('moment');
module.exports = {
    crawl: async function (data) {
        var flight_json = [];
        var url = "https://fly.vietnamairlines.com/dx/VNDX/#/flight-selection?";
        url += "journeyType=" + "one-way";
        url += "&locale=" + "vi-VI";
        url += "&origin=" + data.DepartCity.Code;
        url += "&destination=" + data.ArrivalCity.Code;
        url += "&ADT=" + '1';
        url += "&CHD=";
        url += "&INF=";
        url += "&date=" + moment(data.DepartDate, 'YYYY/MM/DD').format('MM-DD-YYYY');
        //url+="&ReturnDate="+ data.ReturnDate.replace('/','').replace('/','');
        await new Nightmare({
            show: true, loadTimeout: 120 * 1000,
            waitTimeout: 120 * 1000
        }).goto(url)
            //  .type('#search_form_input_homepage', 'github nightmare')
            //  .click('#search_button_homepage')
            .wait('.airline-flight-equipment')
            .evaluate(() => document.querySelector('body').outerHTML
            )
            .end()
            .then((html) => {
                const $ = cheerio.load(html);
                var nameCity = $(html).find(".dxp-summary-bar-container-airport-code");

                $('.flights-table').find('tbody.dxp-flight').each(function (i, elem) {
                    departFlight = {};

                    var flighNumber = $(this).find(".dxp-flight-row .flight-departure .flight-operated-by .flight-number").find('span');
                    departFlight.FlightNumber = $(flighNumber[0]).text().trim() + " " + $(flighNumber[1]).text().trim();

                    departFlight.CarrierId = "Vietnam Airlines";
                    departFlight.FlightDuration = $(this).find(".dxp-flight-row .flight-duration .flight-hrs time")[0].attribs.datetime;

                    departFlight.Aircraft = $(flighNumber[2]).text().trim();
                    // ten thanh pho 
                    departFlight.DepartCityId = $(nameCity[0]).text().trim();
                    departFlight.ArrivalCityId = $(nameCity[1]).text().trim();;



                    //ngay thang + thoi gian bay
                    var date = $(this).find(".dxp-flight-row .flight-departure .flight-depart time.dxp-time");
                    var dateDepart = $(date)[0].attribs.datetime.split(' ');
                    departFlight.DepartHour = dateDepart[1];
                    departFlight.DepartDate = common.formatDate(dateDepart[0], DatePartern);
                    var dateReturn = $(date)[1].attribs.datetime.split(' ');
                    departFlight.ArrivalHour = dateReturn[1];
                    departFlight.ArrivalDate = common.formatDate(dateReturn[0], DatePartern);

                    departFlight.DepartAirport = $(this).find(" .ItineraryBox-Depart .Airport").text().trim();
                    departFlight.ArrivalAirport = $(this).find(" .ItineraryBox-Arrival .Airport").text().trim();
                    if( $(this).find(" .flight-prices .economy .name").text().trim()!=""){
                        departFlight.EcoSeat = $(this).find(" .flight-prices .economy .name").text().trim();
                        departFlight.EcoPrice = common.returnJustNumber($(this).find(".flight-prices .economy button .price-container .dxp-price .number").text().trim());
                    }
                    if($(this).find(" .flight-prices .business .name").text().trim()!=""){
                        departFlight.BusinessSeat = $(this).find(" .flight-prices .business .name").text().trim();
                        departFlight.BusinessPrice = common.returnJustNumber($(this).find(".flight-prices .business button .price-container .dxp-price .number").text().trim());
                    }

                    flight_json.push(departFlight);
                });
            })
            .catch(error => {
                console.error('Search failed:', error)
            });
        return flight_json;
    }
}