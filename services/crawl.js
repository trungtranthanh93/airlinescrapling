const VietNamAirLine = require('../services/vietnamairline');
const VIetJetAirHaNoi = require('../services/vietjetair-hanoi-vn');
const VietJetAirNet = require('../services/vietjetair-net-vn');
const common = require('../services/textUtility');
const _ = require('lodash')
/* GET users listing. */
module.exports = {
  crawlAllPage: async function crawlAllPage(data) {
    try {
      const vjPromise = VietJetAirNet.crawl(data);
      const vnPromise = VietNamAirLine.crawl(data);
      var dataVietJetAirNet = await vjPromise;
      var dataVietNamAirLine = await vnPromise;
      return _.concat(dataVietNamAirLine,dataVietJetAirNet);
    } catch (error) {
        return null;
    }
  }
};

