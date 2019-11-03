const constants = require('./constants.json');

module.exports.TimeDifference = function (date1, date2) {
    let times = constants.times;
    let t1, t2;

    if (date1 instanceof Date && date2 instanceof Date) {
        t1 = date1.getTime();
        t2 = date2.getTime();
    } else if (date1 instanceof Chrono && date2 instanceof Chrono) {
        t1 = date1.unix;
        t2 = date2.unix;
    } else {
        throw new Error("Invalid Dates");
    }

    const ms =times.ms;
    const diff = (t1 - t2) / ms;
    return {
        sec: Math.round(diff /times.sec),
        min: Math.round(diff /times.min),
        hour: Math.round(diff /times.hour),
        day: Math.round(diff /times.day),
        week: Math.round(diff /times.week),
        month: Math.round(diff /times.month),
        year: Math.round(diff /times.year)
    }
}

module.exports.IsLeapYear = function (date) {
    let year = date.getFullYear();
    return (year % 400 === 0) || ((year % 100 !== 0) && (year % 4 === 0));
}

module.exports.InputChecker = function(input, inputType){
    if(typeof input !== inputType){
        throw Error('Invalid Input Type');
    }
}