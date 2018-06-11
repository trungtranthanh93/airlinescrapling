const models = require('../models');
const common = require('../services/textUtility');
const fs = require('fs');

async function create() {
    var obj = await JSON.parse(fs.readFileSync('city.json', 'utf8'));
    models.city.bulkCreate(obj).then().catch(function(err) {
        // print the error details
        console.log(err);
    });
}
create();
