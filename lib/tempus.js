const constants = require('./constants.json');
const utils = require('./utils');

/**
 * Core Tempus Object
 * @param {Date} date 
 * @param {String} language 
 */
function Tempus(date = new Date(), language = "en") {
    // check type of date
    //? cheezy temp solution
    if (typeof date === 'string') {
        this.date = new Date(date);
    } else if (date instanceof Date) {
        this.date = date;
    } else {
        throw new Error('Object is not a Date');
    }

    this.language = language;

    /**
     * Init Constants
     */
    this.seperators = constants.seperators;
    this.days = constants.lang[this.language].days;
    this.months = constants.lang[this.language].months;
    this.times = constants.time;

    this.initData();
}

/**
 * changes variables depend on date
 */
Tempus.prototype.initData = function () {
    this.timeZone = this.date.getTimezoneOffset() / 60;
    this.unix = this.date.getTime(); // in ms
    this.isLeapYear = this.checkLeapYear();

    this.extractedTime = this.extractDate();
    this.getEpochTime = (date = this.date) => Math.round(date.getTime() / 1e3);
}

/**
 * Set date as unix.
 * unix in seconds
 */
Tempus.prototype.setTimeAsUnix = function(unix){
    this.date = new Date(unix * 1e3);
    this.initData();
    return this;
}

Tempus.prototype.monthDays = function () {
    const M = [];
    for (let m = 1; m <= 12; m++) {
        if (m === 2) {
            if (this.isLeapYear) {
                M.push({
                    index: m,
                    days: 29,
                    name: this.months[m - 1].long,
                    weeks: Math.round(29 / 7),
                    plusDays: Math.round(29 % 7)
                });
            } else {
                M.push({
                    index: m,
                    days: 28,
                    name: this.months[m - 1].long,
                    weeks: Math.round(28 / 7),
                    plusDays: Math.round(28 % 7)
                });
            }
        } else if (m < 8 && m % 2 === 0) {
            M.push({
                index: m,
                days: 30,
                name: this.months[m - 1].long,
                weeks: Math.round(30 / 7),
                plusDays: Math.round(30 % 7)
            });
        } else if (m < 8 && m % 2 !== 0) {
            M.push({
                index: m,
                days: 31,
                name: this.months[m - 1].long,
                weeks: Math.round(31 / 7),
                plusDays: Math.round(31 % 7)
            });
        } else if (m >= 8 && m % 2 === 0) {
            M.push({
                index: m,
                days: 31,
                name: this.months[m - 1].long,
                weeks: Math.round(31 / 7),
                plusDays: Math.round(31 % 7)
            });
        } else if (m >= 8 && m % 2 !== 0) {
            M.push({
                index: m,
                days: 30,
                name: this.months[m - 1].long,
                weeks: Math.round(30 / 7),
                plusDays: Math.round(30 % 7)
            });
        }
    }
    console.log(this.extractedTime.year.number);
    console.log(M)
}

Tempus.prototype.weeksInYear = function () {
    let days;
    if (this.isLeapYear) {
        days = 366;
    } else {
        days = 365;
    }
    return {
        weeks: Math.floor(days / 7),
        plusDays: days % 7
    }
}

Tempus.prototype.hoursInYear = function () {
    let days;
    if (this.isLeapYear) {
        days = 366;
    } else {
        days = 365;
    }
    return days * 24;
}

Tempus.prototype.secondsInYear = function () {
    let days;
    if (this.isLeapYear) {
        days = 366;
    } else {
        days = 365;
    }
    return days * 24 * 3600;
}

Tempus.prototype.checkLeapYear = function () {
    let year = this.date.getFullYear();
    return (year % 400 === 0) || ((year % 100 !== 0) && (year % 4 === 0));
}

Tempus.prototype.getWeekNumber = function () {
    let firstDayOfYear = new Date(`01-01-${this.date.getFullYear()}`);
    let secondsInFirstDay = firstDayOfYear.getTime() / 1000;

    let secondsIn = this.date.getTime() / 1000;
    let days = Math.round((secondsIn - secondsInFirstDay) / 60 / 60 / 24);
    return Math.round(days / 7);
}

Tempus.prototype.fixMonth = function (monthIndex) {
    if (monthIndex === 12) {
        return 1;
    }
    return monthIndex + 1;
}

Tempus.prototype.zeroPadding = function (str) {
    let n = Number.parseInt(str);

    if (n < 10) {
        return `0${str}`;
    }

    return str.toString();
}

Tempus.prototype.extractDate = function (date = this.date) {
    return {
        year: { str: date.getFullYear().toString(), number: date.getFullYear() },
        month: { str: this.months[date.getMonth()], number: this.fixMonth(date.getMonth()) },
        weekday: { str: this.days[date.getDay()], number: date.getDay() },
        weeknumber: this.getWeekNumber(),
        day: { str: this.zeroPadding(date.getDate()), number: date.getDate() },
        hour: this.zeroPadding(date.getHours()),
        minute: this.zeroPadding(date.getMinutes()),
        second: this.zeroPadding(date.getSeconds()),
        millisecond: this.zeroPadding(date.getMilliseconds())
    }
}

Tempus.prototype.FormatPatterns = {
    paddedDay: {
        pattern: /dd/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.day.number)
        }
    },
    shortDay: {
        pattern: /d/g,
        value: function () {
            return this.extractedTime.day.number;
        }
    },
    longMonth: {
        pattern: /mmm/g,
        value: function () {
            return this.extractedTime.month.str.long;
        }
    },
    paddedMonth: {
        pattern: /mm/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.month.number);
        }
    },
    shortMonth: {
        pattern: /m/g,
        value: function () {
            return this.extractedTime.month.number;
        }
    },
    longYear: {
        pattern: /yyyy/g,
        value: function () {
            return this.extractedTime.year.number;
        }
    },
    shortYear: {
        pattern: /yy/g,
        value: function () {
            return this.extractedTime.year.number;
        }
    },
    paddedHour: {
        pattern: /HH/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.hour);
        }
    },
    shortHour: {
        pattern: /H/g,
        value: function () {
            return this.extractedTime.hour;
        }
    },
    paddedMinute: {
        pattern: /MM/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.minute);
        }
    },
    shortMinute: {
        pattern: /M/g,
        value: function () {
            return this.extractedTime.minute;
        }
    },
    paddedSecond: {
        pattern: /SS/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.second);
        }
    },
    shortSecond: {
        pattern: /S/g,
        value: function () {
            return this.extractedTime.second;
        }
    },
    paddedMillisecond: {
        pattern: /ss/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.millisecond);
        }
    },
    shortMillisecond: {
        pattern: /s/g,
        value: function () {
            return this.extractedTime.millisecond;
        }
    },
    longWeekDay: {
        pattern: /ww/g,
        value: function () {
            return this.extractedTime.weekday.str.long;
        }
    },
    shortWeekDay: {
        pattern: /w/g,
        value: function () {
            return this.extractedTime.weekday.str.short;
        }
    },
    paddedWeekNumber: {
        pattern: /WW/g,
        value: function () {
            return this.zeroPadding(this.extractedTime.weeknumber);
        }
    },
    shortWeekNumber: {
        pattern: /W/g,
        value: function () {
            return this.extractedTime.weeknumber;
        }
    }
}


/**
 * Format Options
 * 
 * d - short day
 * dd - padded day
 * 
 * m - short month
 * mm - padded month
 * mmm - long month
 * 
 * yy - short year
 * yyyy - long year 
 * 
 * H - short hour
 * HH - padded hour
 * 
 * M - short minute
 * MM - padded minute
 * 
 * S - short second
 * SS - padded Second
 * 
 * s - millisecond
 * ss - padded milisecond
 * 
 * w - short week day
 * ww - long week day
 * 
 * W - short week number
 * WW - padded week number
 * 
 * 
*/
Tempus.prototype.strftime = function (format) {
    let parts = format.split(/\s/);

    let formattedParts = parts.map(part => {
        return this.formatter(part);
    });

    return formattedParts.join(' ');
}

Tempus.prototype.formatter = function (pattern) {
    for (const [_, v] of Object.entries(this.FormatPatterns)) {
        let func = v.value;
        let action = func.bind(this);

        pattern = pattern.replace(v.pattern, action());
    }
    return pattern;
}

Tempus.prototype.addSecond = function (sec) {
    utils.InputChecker(sec, 'number');
    this.date = new Date(this.unix + ( this.times.ms * sec));
    this.initData();
    return this;
}

Tempus.prototype.addMinute = function (min) {
    utils.InputChecker(min, 'number');
    this.date = new Date(this.unix + ( this.times.ms * min * this.times.min));
    this.initData();
    return this;
}

Tempus.prototype.addHour = function (hour) {
    utils.InputChecker(hour, 'number');
    this.date = new Date(this.unix + ( this.times.ms * hour * this.times.hour));
    this.initData();
    return this;
}

Tempus.prototype.addDay = function (day) {
    utils.InputChecker(day, 'number');
    this.date = new Date(this.unix + ( this.times.ms * day * this.times.day));
    this.initData();
    return this;
}

Tempus.prototype.addWeek = function (week) {
    utils.InputChecker(week, 'number');
    this.date = new Date(this.unix + ( this.times.ms * week * this.times.week));
    this.initData();
    return this;
}

Tempus.prototype.addMonth = function (month) {
    utils.InputChecker(month, 'number');
    this.date = new Date(this.unix + ( this.times.ms * month * this.times.month));
    this.initData();
    return this;
}

Tempus.prototype.addYear = function (year) {
    utils.InputChecker(year, 'number');
    this.date = new Date(this.unix + ( this.times.ms * year * this.times.year));
    this.initData();
    return this;
}

Tempus.prototype.diffrence = function (date) {
    let t1, t2;
    t1 = this.unix;

    if (date instanceof Date) {
        t2 = date.getTime();
    } else if (date instanceof Tempus) {
        t2 = date.unix;
    } else {
        throw new Error("Invalid Date");
    }

    const diff = (t1 - t2) /  this.times.ms;
    
    return {
        sec: Math.floor(diff / this.times.sec),
        min: Math.floor(diff / this.times.min),
        hour: Math.floor(diff / this.times.hour),
        day: Math.floor(diff / this.times.day),
        week: Math.floor(diff / this.times.week),
        month: Math.floor(diff / this.times.month),
        year: Math.floor(diff / this.times.year)
    }
}

/**
 * Cheap override
 */
Tempus.prototype.toString = function () {
    return this.date.toString();
}

// https://stackoverflow.com/questions/439630/create-a-date-with-a-set-timezone-without-using-a-string-representation

module.exports = Tempus;

