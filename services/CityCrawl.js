const cheerio = require('cheerio');
const Nightmare = require('nightmare')
const common = require('../services/textUtility')
const DatePartern = 'YYYY-MM-DD';
const moment = require('moment');
const fs = require('fs');
var flight_json = [];
var url = "https://www.vietjetair.com/Sites/Web/vi-VN/Home";
new Nightmare({
    show: true, loadTimeout: 120 * 1000,
    waitTimeout: 120 * 1000
}).goto(url)
    //  .type('#search_form_input_homepage', 'github nightmare')
    //  .click('#search_button_homepage')
    .wait(1000)
    .evaluate(() => document.querySelector('body').outerHTML
    )
    .end()
    .then((html) => {
        const $ = cheerio.load(html);
        $('#selectOrigin').find('option').each(function (i, elem) {
            var city = {};
            if (elem.attribs.value != "") {
                city.Code = elem.attribs.value;
                city.Name = $(this).text();
            }
            flight_json.push(city);
        });
        fs.writeFile('city.json', JSON.stringify(flight_json), 'utf8', function (err) {
            if (err) console.log(err);
            else console.log("Done!");
        });
    });
