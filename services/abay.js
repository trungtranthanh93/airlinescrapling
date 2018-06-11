const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const commont = require('../services/textUtility');
const moment = require('moment');
const DatePartern = 'DD/MM/YYYY';
const fs = require('fs');

var flight_json = {};
var url = "https://abay.vn";
var nightmare = new Nightmare({
    show: true, loadTimeout: 120 * 1000,
    waitTimeout: 120 * 1000
});
var data = {};
data.day = '10';
data.month = '10/2018';
data.DepartCity = 'Hà Nội (HAN)';
data.ArrivalCity = 'Hồ Chí Minh  (SGN)';
nightmare.goto(url)
    .select('#cphMain_UsrSearchFormMainV31_cboDepartureDay', data.day)
    .select('#cphMain_UsrSearchFormMainV31_cboDepartureMonth', data.month)
    .evaluate((data) => {
        document.querySelector('#cphMain_UsrSearchFormMainV31_txtFrom').setAttribute('value', data.DepartCity);
        document.querySelector('#cphMain_UsrSearchFormMainV31_txtTo').setAttribute('value', data.ArrivalCity);
        document.querySelector('#cphMain_UsrSearchFormMainV31_btnSearch').click();
        return nightmare;
    }, data)
    .wait('.airlogo.img-VN-Full')
    .wait('.airlogo.img-VJ-Full')
    .evaluate(() => document.querySelector('body').outerHTML)
    .then((elementExists) => {
        if (elementExists) {
            return nightmare
                .evaluate(() => {
                    document.querySelectorAll('.linkViewFlightDetail').forEach(function (el) {
                        el.click();
                    });
                    return nightmare;
                })
                .wait(6000)
                .evaluate(() => document.querySelector('body').outerHTML)
                .end()
                .then((html) => {
                    const $ = cheerio.load(html);
                    fs.writeFile('abay.html',$.html(),'utf8',function(err){
                        if(err){
                            console.log(err);
                        }
                    })
                    flight_json.departArray = [];
                    $('#flightResultMainContent').find('.flight-detail-content').each(function (i, elem) {
                        var detail = $(this).find('.view-detail-flight td');
                        var dt0 = $($(detail[0])).text().trim().replace(/ /g, "").split('\n');
                        var dt1 =  $($(detail[1])).text().trim().replace(/ /g, "").split('\n');
                        var dt2 = $($(detail[2])).text().trim().replace(/ /g, "").split('\n');
                        var dt3 = $($(detail[3]).find('td')[1]).text().trim().replace(/ /g, "").split('\n');
          
                        departFlight = {};
                        departFlight.flightInfo = {};
    
                        departFlight.flightInfo.flighNumber =dt3[2].substring(10);
                        
                        departFlight.flightInfo.carrierName = dt3[0];
                        //   departFlight.flightInfo.itineraryBox.direct.FltNum = $(this).find(id + " .ItineraryBox-Direct .FltNum").text().trim();
                        departFlight.flightInfo.FltTime = dt1[0];
    
                        departFlight.flightInfo.aircraft = dt1[2];
    
    
                        departFlight.flightInfo.depart = {};
                        departFlight.flightInfo.arrival = {};
                        // ten thanh pho 
                        departFlight.flightInfo.depart.city = dt0[0];
                        departFlight.flightInfo.arrival.city = dt2[0];
    
                        //ngay thang + thoi gian bay
                        var dateDepart = dt0[3].split(',');
                        departFlight.flightInfo.depart.hour = dateDepart[0];
                        departFlight.flightInfo.depart.date = commont.formatDate(dateDepart[1],DatePartern);
                        var dateReturn = dt2[4].split(',');
                        departFlight.flightInfo.arrival.hour = dateReturn[0];
                        departFlight.flightInfo.arrival.date = commont.formatDate(dateReturn[1],DatePartern);
    
                        departFlight.flightInfo.depart.airport = dt0[7];
                        departFlight.flightInfo.arrival.airport = dt2[8];

                        // departFlight.detailPriceBox = {};
                        // departFlight.detailPriceBox.adults = {};
                        // departFlight.detailPriceBox.adults.eco = {}
                        // departFlight.detailPriceBox.adults.bussi = {}
                        
                        // var seatNames =  $(this).find(" .flight-prices button .name"); 
                        // departFlight.detailPriceBox.adults.eco.name = $(seatNames)[0].text().trim();
                        // departFlight.detailPriceBox.adults.bussi.name = $(seatNames)[0].text().trim();
    
                        // var prices = $(this).find(" .flight-prices button .price-container .dxp-price .number");
                        // departFlight.detailPriceBox.adults.eco.prices= $(prices)[0].text().trim();
                        // departFlight.detailPriceBox.adults.bussi.prices= $(prices)[1].text().trim();
                        flight_json.departArray.push(departFlight);
                    });
                    fs.writeFile('abay.json',JSON.stringify(flight_json),'utf8',function(err){
                        if(err) console.log(err)
                        else console.log('done')
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
