const DatePartern = "YYYY-MM-DD";
const moment = require('moment');

module.exports = {
    
    getCarrie: function getCarrier(carrier_name) {
        if (carrier_name.toLowerCase().includes("vietjet")) {
            return 'vj';
        } else {
            return "vn";
        }
    },

    returnJustNumber: function returnJustNumber(value) {
        return parseInt(value.replace(/\D/g, ''));
    },

    removeSpace: function removeSpace(value) {
        return value.replace(/\s/g, '')
    },

    formatDate: function formatDate(date, DateParternBefore) {
        return moment(date, DateParternBefore).format(DatePartern);
    },

    isNullOrUndefined: (s) => {
        if (s == undefined || s == null)
            return true;
        return false;
    },

    isNullOrBlank: (s) => {
        s.trim();
        if (s == undefined || s == null || s.length == 0)
            return true;
        return false;
    }

}
