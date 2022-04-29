class Tempus extends Date {
  constructor(...args) {
    super(args)
    this.timeZone = 'UTC'
    this.locale = 'en-US'
  }

  // public

  /**
	 * Get the start of the day
	 *
	 * @return {Date} Start of day
	 */
  get dayStart() {
    return Tempus.dayStart(this)
  }

  get dayEnd() {
    return Tempus.dayEnd(this)
  }

  get dayOfWeek() {
    return Tempus.dayOfWeek(this)
  }

  /**
	 * Get time zone offset
	 *
	 * @example
	 * // returns -4
	 * this.timeZoneOffset.hours;
	 *
	 * @example
	 * // returns -4
	 * Number(this.timeZoneOffset);
	 *
	 * @example
	 * // returns '-04:00'
	 * String(this.timeZoneOffset);
	 *
	 * @returns {Tempus.TimeZoneOffset} timezne off
	 */
  get timeZoneOffset() {
    return new Tempus.TimeZoneOffset(this.timeZone, this)
  }

  get startOfWeek() {
    const oldTZ = this.timeZone
    const nd = new Tempus(this)
    nd.setTimeZone('UTC')
    nd.setHours(0, 0, 0, 0)
    const date = Tempus.getWeekStart(nd)
    this.setTimeZone(oldTZ)
    return date
  }

  get endOfWeek() {
    const oldTZ = this.timeZone
    const nd = new Tempus(this)
    nd.setTimeZone('UTC')
    nd.setHours(0, 0, 0, 0)
    const date = Tempus.getWeekEnd(nd)
    this.setTimeZone(oldTZ)
    return date
  }

  get localeDate() {
    return Tempus.getLocaleDate(this, this.locale, this.timeZone)
  }

  /**
	 * @param {string} tz timeZone Valid time zone (e.g. 'UTC' or 'America/Los_Angeles')
	 */
  setTimeZone(tz) {
    const oldOffset = Number(this.timeZoneOffset)
    this.timeZone = tz
    const offset = Number(this.timeZoneOffset)
    this.adjustByHours(offset - oldOffset)
  }

  /**
	 * @param {string} locale Valid locale (e.g. 'en-US')
	 */
  setLocale(locale) {
    this.locale = locale
  }

  toSQLString(timeZone = 'UTC', format = 'DATETIME') {
    // eslint-disable-next-line unicorn/no-this-assignment
    const nd = this
    nd.setTimeZone(timeZone)
    return Tempus.toSQLString(nd, format)
  }

  adjustByDays(days) {
    return Tempus.adjustByDays(days, this)
  }

  adjustByHours(hours) {
    return Tempus.adjustByHours(hours, this)
  }

  // static
  static daysInWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  static dayStart = date => {
    const newDate = date
    newDate.setUTCHours(0, 0, 0, 0)
    return new Date(newDate)
  }

  static dayEnd = date => {
    const newDate = date
    newDate.setUTCHours(23, 59, 59, 999)
    return new Date(newDate)
  }

  static dayOfWeek = (date, startMonday = true) => startMonday ? (date.getDay() === 0 ? 6 : date.getDay() - 1) : date.getDay()

  static getDateChangedByDays = (days, initialDate) => new Date(new Date(initialDate).getTime() + (days * 86_400_000))

  static adjustByDays = (days, initialDate) => initialDate.setDate(initialDate.getDate() + days)

  static adjustByHours = (hours, initialDate) => initialDate.setHours(initialDate.getHours() + hours)

  static decimalToTime = (num, secs = true) => {
    let neg = ''
    if (num < 0) {
      num *= -1
      neg = '-'
    }

    const n = new Date(0, 0)
    n.setSeconds(Number(num) * 60 * 60)
    if (secs) {
      return neg + n.toTimeString().slice(0, 8)
    }

    const r = n.toTimeString().slice(0, 8)
    let inc = 0
    return neg + r.split(':').reverse().map((e, i) => {
      if (i === 0) {
        if (Number(e) >= 30) {
          inc = 1
        }

        return String(0).padStart(2, '0')
      }

      if (i === 1) {
        return String(Number(e) + inc).padStart(2, '0')
      }

      return e
    }).reverse().join(':').slice(0, 5)
  }

  /**
	 * Format in SQL entry style
	 *
	 * @param {Date} date JavaScript Date
	 * @param {string|false} timeZone Valid timezone (e.g. 'America/Los_Angeles'), or false for default system timezone
	 * @param {'DATE'|'DATETIME'|'TIMESTAMP'|'YEAR'} format SQL column type
	 * @returns
	 */
  static toSQLString = (date, format = 'DATETIME') => {
    format = format.toLowerCase()
    const formatted = date.toISOString()
    // eslint-disable-next-line default-case
    switch (format) {
      case 'year':
        return formatted.slice(0, 4)

      case 'date':
        return formatted.split('T')[0]
    }

    return formatted.slice(0, -5).replace('T', ' ')
  }

  static getWeekStart = _date => {
    const date = new Date(_date)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    const newDate = new Date(date.setDate(diff))
    newDate.setUTCHours(0, 0, 0, 0)
    return newDate
  }

  static getWeekEnd = _date => {
    const date = Tempus.getDateChangedByDays(6, Tempus.getWeekStart(_date))
    date.setUTCHours(23, 59, 59, 999)
    return date
  }

  static getLocaleDate = (date, locale = 'en-US', timeZone = false) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    if (timeZone) {
      options.timeZone = timeZone
    }

    return date.toLocaleString(locale, options)
  }

  /**
	 * Get time zone offset
	 *
	 * @description Cast as primitive to get desired result
	 */
  static TimeZoneOffset = class {
    constructor(timeZone, date = new Date()) {
      const tz = date.toLocaleString('en', { timeZone, timeStyle: 'long' }).split(' ').slice(-1)[0]
      const dateString = date.toString()
      const offset = Date.parse(`${dateString} UTC`) - Date.parse(`${dateString} ${tz}`)

      // return UTC offset in millis
      const result = offset / 3_600_000
      this.hours = result
    }

    toString() {
      return Tempus.decimalToTime(this, false)
    }

    [Symbol.toPrimitive](hint) {
      if (hint === 'number') {
        return this.hours
      }

      return Tempus.decimalToTime(this.hours, false)
    }
  }
}

export default Tempus
