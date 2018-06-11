
module.exports = {

    /** Format number with commas. Eg: 123456789 => 123.456.789 */
    toLocaleString: (number) => {
        var parts = number.toString().split(",");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return parts.join(",");
    }

}
