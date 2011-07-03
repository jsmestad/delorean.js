if _.isUndefined(Date::setISO8601)
  Date::setISO8601 = (string) ->
    regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?"
    d = string.match(new RegExp(regexp))
    offset = 0
    date = new Date(d[1], 0, 1)
    date.setMonth d[3] - 1  if d[3]
    date.setDate d[5]  if d[5]
    date.setHours d[7]  if d[7]
    date.setMinutes d[8]  if d[8]
    date.setSeconds d[10]  if d[10]
    date.setMilliseconds Number("0." + d[12]) * 1000  if d[12]
    if d[14]
      offset = (Number(d[16]) * 60) + Number(d[17])
      offset *= (if (d[15] == "-") then 1 else -1)
    offset -= date.getTimezoneOffset()
    time = (Number(date) + (offset * 60 * 1000))
    @setTime Number(time)

if _.isUndefined(Date::toISOString)
  Date::toISOString = ->
    @getUTCFullYear() + "-" + (@getUTCMonth() + 1).toPaddedString(2) + "-" + @getUTCDate().toPaddedString(2) + "T" + @getUTCHours().toPaddedString(2) + ":" + @getUTCMinutes().toPaddedString(2) + ":" + @getUTCSeconds().toPaddedString(2) + "Z"

if _.isUndefined(Number::toPaddedString)
  Number::toPaddedString = toPaddedString = (length, radix) ->
    string = @toString(radix or 10)
    "0".times(length - string.length) + string

if _.isUndefined(Date::strftime)
  Date::strftime = (->
    day = (date) ->
      date.getDate() + ""
    day_of_week = (date) ->
      date.getDay() + ""
    day_of_year = (date) ->
      (((date.getTime() - cache["start_of_year"].getTime()) / day_in_ms + 1) + "").split(/\./)[0]
    day_padded = (date) ->
      ("0" + day(date)).slice -2
    default_local = (date) ->
      date.toLocaleString()
    default_local_date = (date) ->
      date.toLocaleDateString()
    default_local_time = (date) ->
      date.toLocaleTimeString()
    hour = (date) ->
      hour = date.getHours()
      if hour == 0
        hour = 12
      else hour -= 12  if hour > 12
      hour + ""
    hour_24 = (date) ->
      date.getHours()
    hour_24_padded = (date) ->
      ("0" + hour_24(date)).slice -2
    hour_padded = (date) ->
      ("0" + hour(date)).slice -2
    meridian = (date) ->
      (if date.getHours() >= 12 then "pm" else "am")
    meridian_upcase = (date) ->
      meridian(date).toUpperCase()
    minute = (date) ->
      ("0" + date.getMinutes()).slice -2
    month = (date) ->
      ("0" + (date.getMonth() + 1)).slice -2
    month_name = (date) ->
      months[date.getMonth()]
    month_name_abbr = (date) ->
      abbr_months[date.getMonth()]
    second = (date) ->
      ("0" + date.getSeconds()).slice -2
    time_zone_offset = (date) ->
      tz_offset = date.getTimezoneOffset()
      (if tz_offset >= 0 then "-" else "") + ("0" + (tz_offset / 60)).slice(-2) + ":" + ("0" + (tz_offset % 60)).slice(-2)
    week_number_from_sunday = (date) ->
      ("0" + Math.round(parseInt(day_of_year(date), 10) / 7)).slice -2
    weekday_name = (date) ->
      days[date.getDay()]
    weekday_name_abbr = (date) ->
      abbr_days[date.getDay()]
    year = (date) ->
      date.getFullYear() + ""
    year_abbr = (date) ->
      year(date).slice -2
    strftime = (format) ->
      output = format
      cache["start_of_year"] = new Date("Jan 1 " + @getFullYear())
      while match = regexp.exec(format)
        output = output.replace(new RegExp(match[0], "mg"), formats[match[1]](this))  if match[1] of formats
      output
    cache = start_of_year: new Date("Jan 1 " + (new Date()).getFullYear())
    regexp = /%([a-z]|%)/g
    day_in_ms = 1000 * 60 * 60 * 24
    days = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
    months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    abbr_days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]
    abbr_months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
    formats =
      a: weekday_name_abbr
      A: weekday_name
      b: month_name_abbr
      B: month_name
      c: default_local
      d: day_padded
      e: day
      H: hour_24_padded
      I: hour_padded
      j: day_of_year
      k: hour_24
      l: hour
      m: month
      M: minute
      p: meridian_upcase
      P: meridian
      S: second
      U: week_number_from_sunday
      w: day_of_week
      x: default_local_date
      X: default_local_time
      y: year_abbr
      Y: year
      z: time_zone_offset
      "%": ->
        "%"

    strftime
  )()

