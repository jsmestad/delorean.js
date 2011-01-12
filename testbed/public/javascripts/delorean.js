/*
*  Delorean.js -- Raphael-based time series graphing library
*  This work is Copyright by Justin Smestad
*  It is licensed under the Apache License 2.0
*  
*  This code requires jQuery, Raphael.js and Underscore.js
*  http://github.com/jsmestad/delorean.js
*/

(function($, window, document, undefined) {

  var Delorean = function(options) {
    var $chart, data;
    var options = {
      line_colors: ["#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed"], // the color theme used for graphs
      date_format: '%m/%d',
      width: 698,
      height: 200,
      margin_left: 80,
      margin_bottom: 0,
      margin_top: 0,
      text_date: {
        "font-size": "10px",
        fill: "#333333"
      },
      text_metric: {
        "font-size": "13px",
        "font-family": "Trebuchet MS, Arial, Helvetica, san-serif"
      },
      stroke_width: 4,
      stroke_width_dense: 2,
      point_size: 5,
      point_size_hover: 7
    };

    function log() {
      log.history = log.history || [];   // store logs to an array for reference
      log.history.push(arguments);
      if (window.console) {
        console.log(Array.prototype.slice.call(arguments));
      }
    };

    function displayValue(value, precision) {
      if (value >= 0 && value < 1000) {
        return value + '';
      } else if (value >= 1000 && value < 1000000) {
        return (value / 1000).toFixed(precision) + 'K';
      } else if (value >= 1000000) {
        return (value / 1000000).toFixed(precision) + 'M';
      }
    }

    Raphael.fn.drawChart = function(X, Y) {
      var dates   = _(data).keys(),
          values  = _(data).values();

      var margin_left   = options.margin_left,
          margin_bottom = options.margin_bottom,
          margin_top    = options.margin_top,
          stroke_width  = ((dates.length > 45) ? options.stroke_width_dense : options.stroke_width),
          line_color    = options.line_colors[1];

      var path    = this.path().attr({stroke: line_color, "stroke-width": stroke_width, "stroke-linejoin": "round"}),
          bgp     = this.path().attr({stroke: "none", opacity: 0.0, fill: line_color})
                      .moveTo(margin_left + X * -0.5, options.height - margin_bottom),
          blanket = this.set();

      var tooltip_visible = false,
          leave_timer     = null;

      for (var i = 0, ii = dates.length; i < ii; i++) {
        var x = Math.round(X * i),
            y = Math.round(options.height - margin_bottom - Y * values[i]);

        var stroke_color      = "#FFFFFF",
            fill_color        = line_color,
            point_size        = options.point_size,
            point_size_hover  = options.point_size,
            first_point       = (i == 0 ? true : false);

        if (dates.length > 90) {
          point_size = 0;
          point_size_hover = 3;
        } else if (dates.length > 45) {
          point_size = 3;
          point_size_hover = 5;
        }

        if (values[i] < 0) {
          y = Math.round(options.height - margin_bottom - Y * 0);
        }
        
        // TODO: This is aesthetic settings
        // y = y - 20;
        // if (i == 0) { x = -10; }

        if (dates.length < 45) {
          bgp[(first_point ? "lineTo" : "cplineTo")](x, y, 10);
          path[(first_point ? "moveTo" : "cplineTo")](x, y, 10);
        } else {
          bgp[(first_point ? "lineTo" : "lineTo")](x, y, 10);
          path[(first_point ? "moveTo" : "lineTo")](x, y, 10);
        }

        point = this.circle(x, y, point_size).attr({fill: fill_color, stroke: stroke_color});
        blanket.push(this.rect(X * i, 0, X, options.height - margin_bottom)
               .attr({stroke: "none",fill: "#FFFFFF", opacity: 0}));

        var rect = blanket[blanket.length - 1];

        (function (x, y, data, date, point, idx, position_index) {
          var timer, i;
          rect.hover(function () {

            /*
            * This is for supporting multiple datasets and sizing them together.
            *
            *   for (var d2 in datasets) {
            *     if (!isNaN(d2) && allPoints[d2].hasItem(date)) {
            *         var thePoint = allPoints[d2].getItem(date);
            *         thePoint.attr({
            *             "r": point_size_hover
            *         });
            *     }
            *   }
            */

            point.attr({"r": point_size_hover});
          }, function () {
            point.attr({"r": point_size});
          });
        })(x, y, values[i], dates[i], point, 0, i);

      }
    };

    Raphael.fn.drawDates = function(dates, X, height) {
      var num_to_skip = Math.round(dates.length / 11);
      for (var i = 0, ii = dates.length; i < ii; i++) {
        var datePos = height - 8;
        if (dates.length < 20) {
          if (i == 0) {
            var x = -10;
          } else {
            var x = Math.round(X * i) + 5;
          }
        } else if (dates.length > 60 && i == 1) {
          var x = Math.round(X * i) + 5;
        } else {
          var x = Math.round(X * i);
        }

        if ((dates.length < 20) || (i != 0 && i % num_to_skip == 1)) {
          var t = this.text(x, datePos, (new Date(dates[i])).strftime(options.date_format)).attr({
                    "font-size": "10px",
                    fill: "#afafaf"
                  }).toBack();
        }
      }
    };

    Raphael.fn.drawYScale = function(max, color) {
      var dv = 4;
      for (var sc = 0; sc < (1.33 * max); sc += (max / 4)) {
        if (dv >= 1 && dv < 4) {
          var val = displayValue(Math.round(sc), 0);
          var offset_1 = 15;
          var y_offset = 25;
          if (dv == 2) {
            y_offset = 75;
          } else if (dv == 3) {
            y_offset = 125;
          }
          var yscale = this.text(offset_1, y_offset, val).attr("fill", color).attr("font-weight", "bold").toFront();
        }
        dv--;
      }
    };

    return {
      init: function(target_, data_, options_) {
        $.extend(true, options, options_);

        $chart = $(target_);
        $chart.children().remove();

        data = data_;
        var array_length = data.length;
        while (array_length--) {
          data[array_length] = new Date(data[array_length]);
        }
      },

      render: function() {
        var r       = Raphael($chart.get(0), options.width, options.height),
            dates   = _(data).keys(),
            values  = _(data).values(),
            max     = _(values).max();
        
        var X = (options.width / dates.length),
            Y = ((options.height - options.margin_bottom - options.margin_top) / max);

        r.drawDates(dates, X, options.height);
        r.drawChart(X, Y);
        r.drawYScale(max, "#afafaf");
      }
    };
  };

  $.delorean = function(target, data, options) {
    var delorean = new Delorean();
    delorean.init(target, data, options);
    return delorean;
  };

})(jQuery, window, this);
