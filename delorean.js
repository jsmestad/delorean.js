(function() {
  var Delorean, toPaddedString;
  if (_.isUndefined(Date.prototype.setISO8601)) {
    Date.prototype.setISO8601 = function(string) {
      var d, date, offset, regexp, time;
      regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" + "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?" + "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
      d = string.match(new RegExp(regexp));
      offset = 0;
      date = new Date(d[1], 0, 1);
      if (d[3]) {
        date.setMonth(d[3] - 1);
      }
      if (d[5]) {
        date.setDate(d[5]);
      }
      if (d[7]) {
        date.setHours(d[7]);
      }
      if (d[8]) {
        date.setMinutes(d[8]);
      }
      if (d[10]) {
        date.setSeconds(d[10]);
      }
      if (d[12]) {
        date.setMilliseconds(Number("0." + d[12]) * 1000);
      }
      if (d[14]) {
        offset = (Number(d[16]) * 60) + Number(d[17]);
        offset *= (d[15] === "-" ? 1 : -1);
      }
      offset -= date.getTimezoneOffset();
      time = Number(date) + (offset * 60 * 1000);
      return this.setTime(Number(time));
    };
  }
  if (_.isUndefined(Date.prototype.toISOString)) {
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() + "-" + (this.getUTCMonth() + 1).toPaddedString(2) + "-" + this.getUTCDate().toPaddedString(2) + "T" + this.getUTCHours().toPaddedString(2) + ":" + this.getUTCMinutes().toPaddedString(2) + ":" + this.getUTCSeconds().toPaddedString(2) + "Z";
    };
  }
  if (_.isUndefined(Number.prototype.toPaddedString)) {
    Number.prototype.toPaddedString = toPaddedString = function(length, radix) {
      var string;
      string = this.toString(radix || 10);
      return "0".times(length - string.length) + string;
    };
  }
  if (_.isUndefined(Date.prototype.strftime)) {
    Date.prototype.strftime = (function() {
      var abbr_days, abbr_months, cache, day, day_in_ms, day_of_week, day_of_year, day_padded, days, default_local, default_local_date, default_local_time, formats, hour, hour_24, hour_24_padded, hour_padded, meridian, meridian_upcase, minute, month, month_name, month_name_abbr, months, regexp, second, strftime, time_zone_offset, week_number_from_sunday, weekday_name, weekday_name_abbr, year, year_abbr;
      day = function(date) {
        return date.getDate() + "";
      };
      day_of_week = function(date) {
        return date.getDay() + "";
      };
      day_of_year = function(date) {
        return (((date.getTime() - cache["start_of_year"].getTime()) / day_in_ms + 1) + "").split(/\./)[0];
      };
      day_padded = function(date) {
        return ("0" + day(date)).slice(-2);
      };
      default_local = function(date) {
        return date.toLocaleString();
      };
      default_local_date = function(date) {
        return date.toLocaleDateString();
      };
      default_local_time = function(date) {
        return date.toLocaleTimeString();
      };
      hour = function(date) {
        hour = date.getHours();
        if (hour === 0) {
          hour = 12;
        } else {
          if (hour > 12) {
            hour -= 12;
          }
        }
        return hour + "";
      };
      hour_24 = function(date) {
        return date.getHours();
      };
      hour_24_padded = function(date) {
        return ("0" + hour_24(date)).slice(-2);
      };
      hour_padded = function(date) {
        return ("0" + hour(date)).slice(-2);
      };
      meridian = function(date) {
        if (date.getHours() >= 12) {
          return "pm";
        } else {
          return "am";
        }
      };
      meridian_upcase = function(date) {
        return meridian(date).toUpperCase();
      };
      minute = function(date) {
        return ("0" + date.getMinutes()).slice(-2);
      };
      month = function(date) {
        return ("0" + (date.getMonth() + 1)).slice(-2);
      };
      month_name = function(date) {
        return months[date.getMonth()];
      };
      month_name_abbr = function(date) {
        return abbr_months[date.getMonth()];
      };
      second = function(date) {
        return ("0" + date.getSeconds()).slice(-2);
      };
      time_zone_offset = function(date) {
        var tz_offset;
        tz_offset = date.getTimezoneOffset();
        return (tz_offset >= 0 ? "-" : "") + ("0" + (tz_offset / 60)).slice(-2) + ":" + ("0" + (tz_offset % 60)).slice(-2);
      };
      week_number_from_sunday = function(date) {
        return ("0" + Math.round(parseInt(day_of_year(date), 10) / 7)).slice(-2);
      };
      weekday_name = function(date) {
        return days[date.getDay()];
      };
      weekday_name_abbr = function(date) {
        return abbr_days[date.getDay()];
      };
      year = function(date) {
        return date.getFullYear() + "";
      };
      year_abbr = function(date) {
        return year(date).slice(-2);
      };
      strftime = function(format) {
        var match, output;
        output = format;
        cache["start_of_year"] = new Date("Jan 1 " + this.getFullYear());
        while (match = regexp.exec(format)) {
          if (match[1] in formats) {
            output = output.replace(new RegExp(match[0], "mg"), formats[match[1]](this));
          }
        }
        return output;
      };
      cache = {
        start_of_year: new Date("Jan 1 " + (new Date()).getFullYear())
      };
      regexp = /%([a-z]|%)/g;
      day_in_ms = 1000 * 60 * 60 * 24;
      days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      abbr_days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      abbr_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formats = {
        a: weekday_name_abbr,
        A: weekday_name,
        b: month_name_abbr,
        B: month_name,
        c: default_local,
        d: day_padded,
        e: day,
        H: hour_24_padded,
        I: hour_padded,
        j: day_of_year,
        k: hour_24,
        l: hour,
        m: month,
        M: minute,
        p: meridian_upcase,
        P: meridian,
        S: second,
        U: week_number_from_sunday,
        w: day_of_week,
        x: default_local_date,
        X: default_local_time,
        y: year_abbr,
        Y: year,
        z: time_zone_offset,
        "%": function() {
          return "%";
        }
      };
      return strftime;
    })();
  }
  /* Features
  #
  */
  Delorean = function(options) {
    var calculateLabelWidth, displayValue, distillData, log, mean, median, mode, parseDate, range, selectColor, tintColor, tooltip;
    options = {
      line_colors: ["#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed"],
      line_labels: [],
      date_format: "%m/%d",
      height: 200,
      width: 700,
      label_display_count: 3,
      label_offset: 15,
      margin_left: 5,
      margin_bottom: 5,
      margin_top: 5,
      text_date: {
        fill: "#999",
        "font-size": "10px"
      },
      text_metric: {
        "font-size": "13px",
        "font-family": "Arial, san-serif"
      },
      trend: false,
      grid_color: "#f5f5f5",
      display_x_grid: true,
      display_y_grid: true,
      stroke_width: 4,
      stroke_width_dense: 2,
      point_size: 5,
      point_size_hover: 7,
      enable_tooltips: false,
      verify_libraries: true
    };
    /* Helper Functions
    
    # The functions below are all private, meaning they cannot be
    # invoked directly. They are below for documentation purposes
    # only.
    
    */
    log = function() {
      return window.console && console.log(Array.prototype.slice.call(arguments));
    };
    mean = function(numbers) {
      var i, total;
      total = 0;
      i = 0;
      while (i < numbers.length) {
        total += numbers[i];
        i += 1;
      }
      return total / numbers.length;
    };
    median = function(numbers) {
      var numsLen;
      median = 0;
      numsLen = numbers.length;
      numbers.sort();
      if (numsLen % 2 === 0) {
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
      } else {
        median = numbers[(numsLen - 1) / 2];
      }
      return median;
    };
    mode = function(numbers) {
      var count, i, maxIndex, modes, number;
      modes = [];
      count = [];
      maxIndex = 0;
      i = 0;
      while (i < numbers.length) {
        number = numbers[i];
        count[number] = (count[number] || 0) + 1;
        if (count[number] > maxIndex) {
          maxIndex = count[number];
        }
        i += 1;
      }
      for (i in count) {
        if (count.hasOwnProperty(i) ? count[i] === maxIndex : void 0) {
          modes.push(Number(i));
        }
      }
      return modes;
    };
    range = function(numbers) {
      numbers.sort();
      return [numbers[0], numbers[numbers.length - 1]];
    };
    parseDate = function(date) {
      var d;
      d = (_.isDate(date) ? date : new Date(date));
      if (isNaN(d)) {
        log("ISO 8601 Date constructor not supported in this browser.");
        d = new Date();
        d.setISO8601(date);
      }
      return d;
    };
    calculateLabelWidth = function(date) {
      var d, label_width, texty;
      d = parseDate(date).strftime(options.date_format);
      texty = r.text(0, 0, d).attr(options.text_date);
      label_width = Math.round(texty.getBBox().width + 22.5);
      texty.remove();
      return label_width;
    };
    displayValue = function(value, precision) {
      if (value >= 0 && value < 1000) {
        return value.toString();
      } else if (value >= 1000 && value < 1000000) {
        return (value / 1000).toFixed(precision) + "K";
      } else {
        return (value / 1000000).toFixed(precision) + "M";
      }
    };
    tooltip = function(event, values) {
      var event_x, event_y, svg, svg_x, svg_y, tooltip_inner, tooltip_x, tooltip_y;
      if (!$("#tooltip").length) {
        $("body").append("<div id=\"tooltip\"><div id=\"tooltip_inner\">" + values.join("<br />") + "</div></div>");
      } else {
        $("#tooltip_inner").html(values.join("<br />"));
      }
      svg = $(event.target.parentNode);
      svg_x = svg.offset().left + svg.outerWidth();
      svg_y = svg.offset().top + svg.outerHeight();
      tooltip = $("#tooltip").show();
      tooltip_inner = $("#tooltip_inner");
      event_x = event.pageX;
      event_y = event.pageY;
      tooltip_x = tooltip.outerWidth();
      tooltip_y = tooltip.outerHeight();
      return tooltip.css({
        top: (event_y + tooltip_y > svg_y ? event_y - (tooltip_y / 2) : event_y),
        left: (event_x + tooltip_x + 20 > svg_x ? event_x - tooltip_x - 15 : event_x + 20)
      });
    };
    tintColor = function(color, value) {
      var blue, green, red, rgb, _ref, _ref2, _ref3;
      if (color.length > 6) {
        color = color.substring(1, color.length);
      }
      rgb = parseInt(color, 16);
      red = Math.abs(((rgb >> 16) & 0xFF) + v);
      green = Math.abs(((rgb >> 8) & 0xFF) + v);
      blue = Math.abs((rgb & 0xFF) + v);
      red = red > 255 ? red - (red - 255) : red;
      green = green > 255 ? green - (green - 255) : green;
      blue = blue > 255 ? blue - (blue - 255) : blue;
      red = Number(red < 0 || isNaN(red)) ? 0 : (_ref = red > 255) != null ? _ref : {
        255: red
      };
      green = Number(green < 0 || isNaN(green)) ? 0 : (_ref2 = green > 255) != null ? _ref2 : {
        255: green
      };
      blue = Number(blue < 0 || isNaN(blue)) ? 0 : (_ref3 = blue > 255) != null ? _ref3 : {
        255: blue
      };
      return "#" + red.toPaddedString(2) + green.toPaddedString(2) + blue.toPaddedString(2);
    };
    selectColor = function(index) {
      var c, v;
      c = options.line_colors[index];
      if (_.isUndefined(c)) {
        v = index % options.line_colors.length;
        c = options.line_colors[v];
        c = tintColor(c, Math.round(index / options.line_colors.length) + 50);
      }
      return c;
    };
    distillData = function(data, force) {
      var date_groups, dates, distilled_data, every_x, max_points, normalized_data, point_num, tmp_data;
      if (_.isNull(distilled_data) || force === true) {
        distilled_data = {};
        tmp_data = _.clone(data);
        dates = _(tmp_data).keys();
        max_points = Math.round(options.width / 17);
        every_x = (dates.length >= max_points ? Math.round(dates.length / max_points) : 1);
        date_groups = [];
        normalized_data = {};
        point_num = (every_x === 1 ? dates.length : max_points - 1);
        _(point_num).times(function(i) {
          return date_groups[i] = dates.splice(0, every_x);
        });
        _.each(date_groups, function(date_group) {
          var avg, display_date, starting_date, values;
          values = _.map(date_group, function(d) {
            return tmp_data[d];
          });
          if (_.isArray(values[0])) {
            avg = [];
            _(values[0].length).times(function(i) {
              var set;
              set = _.map(values, function(v) {
                return v[i];
              });
              return avg.push(Math.round(_(set).reduce(function(sum, n) {
                return sum + n;
              }, 0) / set.length));
            });
          } else {
            avg = Math.round(_(values).reduce(function(sum, n) {
              return sum + n;
            }, 0) / values.length);
          }
          display_date = _.map(date_group, function(d) {
            return parseDate(d);
          });
          starting_date = _(display_date).chain().sort(function(a, b) {
            if (a > b) {
              return 1;
            }
            if (a < b) {
              return -1;
            }
            return 0;
          }).head().value();
          return distilled_data[starting_date.toISOString()] = avg;
        });
      }
      return distilled_data;
    };
    Raphael.fn.drawXAxis = function(dates, X) {
      var date, date_labels, dates_length, every_x, i, label_width, num_to_skip, total_possible, x, y_position, _results;
      dates_length = dates.length;
      num_to_skip = Math.round(dates_length / 11);
      y_position = options.height - 8;
      label_width = calculateLabelWidth(dates[0]);
      total_possible = Math.round(options.width / label_width);
      every_x = Math.round(dates_length / total_possible);
      if (every_x === 0) {
        date_labels = dates;
      } else {
        date_labels = _.select(dates, function(d, index) {
          return index % every_x === 0;
        });
      }
      i = date_labels.length;
      _results = [];
      while (i--) {
        x = Math.round(X * _.indexOf(dates, date_labels[i], true)) + (options.label_offset + 15);
        date = parseDate(date_labels[i]).strftime(options.date_format);
        this.text(x, y_position, date).attr(options.text_date).toBack();
        _results.push(options.display_x_grid ? this.path(["M", x, y_position, "V", 0]).attr({
          stroke: options.grid_color
        }).toBack() : void 0);
      }
      return _results;
    };
    Raphael.fn.drawYAxis = function(max) {
      var display, j, max_less, max_more, offset_x, offset_y, scale, t, y_spacing, _results;
      display = options.label_display_count + 1;
      max_more = max * 1.33;
      max_less = max / display;
      offset_x = options.label_offset;
      y_spacing = Math.round((options.height - options.margin_bottom - options.margin_top) / display);
      offset_y = y_spacing * display;
      scale = 0;
      _results = [];
      while (scale < max_more) {
        if (display >= 1 && scale > 0) {
          if (options.display_y_grid) {
            j = 0;
            while (j <= 1) {
              t = (j === 1 ? offset_y + (y_spacing / 2) : offset_y);
              this.path(["M", offset_x, t, "H", options.width - 5]).attr({
                stroke: options.grid_color
              }).toBack();
              if (display === 1 && j === 1) {
                this.path(["M", offset_x, offset_y - (y_spacing / 2), "H", options.width - 5]).attr({
                  stroke: options.grid_color
                }).toBack();
              }
              j++;
            }
          }
          this.text(offset_x, offset_y, displayValue(Math.round(scale), 0)).attr({
            fill: options.text_date["fill"],
            "font-weight": "bold"
          }).toFront();
        }
        offset_y -= y_spacing;
        display--;
        _results.push(scale += max_less);
      }
      return _results;
    };
    Raphael.fn.drawChart = function(X, Y) {
      var dates, dates_length, first_point, i, j, k, kk, layer, leave_timer, line_paths, margin_bottom, margin_left, margin_top, point, point_array, point_size, point_size_hover, stroke_color, stroke_width, tooltip_visible, value, values, values_array, x, y, _results;
      line_paths = [];
      dates = _(data).keys();
      values = _(data).values();
      margin_left = options.margin_left;
      margin_bottom = options.margin_bottom;
      margin_top = options.margin_top;
      stroke_width = (dates.length > 45 ? options.stroke_width_dense : options.stroke_width);
      k = 0;
      kk = values[0].length;
      while (k < kk) {
        line_paths[k] = this.path().attr({
          stroke: selectColor(k),
          "stroke-width": stroke_width,
          "stroke-linejoin": "round"
        });
        k++;
      }
      layer = this.set();
      point_array = [];
      values_array = [];
      tooltip_visible = false;
      leave_timer = null;
      dates_length = dates.length;
      i = 0;
      _results = [];
      while (i < dates_length) {
        x = Math.round(X * i) + (options.label_offset + 15);
        point_array[x] = [];
        values_array[x] = [];
        stroke_color = "#fff";
        point_size = options.point_size;
        point_size_hover = options.point_size_hover;
        first_point = i === 0;
        if (dates_length > 45 && dates_length <= 90) {
          point_size = 3;
          point_size_hover = 5;
        } else if (dates_length > 90) {
          point_size = 0;
          point_size_hover = 3;
        }
        j = 0;
        while (j < values[i].length) {
          value = values[i][j];
          y = Math.round(options.height - margin_bottom - Y * value);
          if (value < 0) {
            y = Math.round(options.height - margin_bottom - Y * 0);
          }
          if (dates_length <= 45) {
            line_paths[j][(first_point ? "moveTo" : "cplineTo")](x, y, 10);
          } else if (dates_length <= 90) {
            line_paths[j][(first_point ? "moveTo" : "cplineTo")](x, y, 4);
          } else {
            line_paths[j][(first_point ? "moveTo" : "cplineTo")](x, y, 1);
          }
          point = this.circle(x, y, point_size).attr({
            fill: options.line_colors[j],
            stroke: stroke_color
          });
          point.insertAfter(line_paths[j]);
          point_array[x].push(point);
          values_array[x].push(value);
          j++;
        }
        layer.push(this.rect(x, 0, X, options.height - margin_bottom).attr({
          stroke: "none",
          fill: "#fff",
          opacity: 0
        }));
        (function(rect, points, x, values) {
          return rect.hover(function() {
            return _.each(points[x], function(point) {
              return point.attr({
                r: point_size_hover
              });
            });
          }, function() {
            _.each(points[x], function(point) {
              return point.attr({
                r: point_size
              });
            });
            return $("#tooltip").hide();
          }).mousemove(function(event) {
            if (options.enable_tooltips) {
              return tooltip(event, values[x]);
            }
          });
        })(layer[layer.length - 1], point_array, x, values_array);
        _results.push(i++);
      }
      return _results;
    };
    return {
      init: function(target_, data_, options_) {
        var chart, data, r, raw_data;
        $.extend(true, options, options_);
        raw_data = _.clone(data_);
        data = (options.trend === true ? distillData(raw_data, true) : raw_data);
        if (options.verify_libraries) {
          if (_.isUndefined(Date.prototype.strftime) || _.isUndefined(Date.prototype.setISO8601)) {
            throw "You must include the strftime.js file before executing Delorean.js";
          }
          if (_.isUndefined(Raphael)) {
            throw "You must include the raphael.js file before executing Delorean.js";
          }
          if (_.isUndefined(Raphael.el.lineTo)) {
            throw "You must include the raphael.path.methods.js file before executing Delorean.js";
          }
        }
        chart = $(target_);
        chart.children().remove();
        return r = Raphael(chart.get(0), options.width, options.height);
      },
      distill: function(force) {
        return distillData(force);
      },
      render: function() {
        var X, Y, dates, max, values;
        dates = _(data).keys();
        values = _(data).values();
        if (_.isArray(values[0])) {
          max = _(_(values).flatten()).max();
        } else {
          max = _(values).max();
          _.each(data, function(value, key) {
            return data[key] = [value];
          });
        }
        X = (options.width - (options.label_offset + 15)) / dates.length;
        Y = (options.height - options.margin_bottom - options.margin_top) / max;
        r.drawXAxis(dates, X);
        r.drawChart(X, Y);
        return r.drawYAxis(max);
      }
    };
  };
  /* $.delorean
  # This will initialize a new Delorean.js chart.
  #
  #     var chart = $.delorean(#chart_id, {...data...}, {...options...});
  
  $.delorean = (target, data, options) ->
    delorean = new Delorean()
    delorean.init target, data, options
    delorean*/
}).call(this);
