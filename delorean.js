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

    // This draws the X Axis (the dates)
    Raphael.fn.drawXAxis = function(dates, X) {
      var num_to_skip   = Math.round(dates.length / 11);
          y_position    = options.height - 8,
          i             = dates.length;

      var x;
      while (i--) {
        if (i == 0 && dates.length < 20) {
          x = -10;
        } else if (dates.length > 60 && i == 1) {
          x = Math.round(X * i) + 5;
        } else {
          x = Math.round(X * i);
        }

        if ((dates.length < 20) || (i != 0 && i % num_to_skip == 1)) {
          var date = (new Date(dates[i])).strftime(options.date_format);
          this.text(x, y_position, date).attr({"font-size": "10px", fill: "#AFAFAF"}).toBack();
        }
      }
    };

    // This draws the Y Axis (the scale)
    Raphael.fn.drawYAxis = function(max, color) {
      var display = 4,
          max_more = 1.33 * max,
          max_less = max / 4,
          offset_x = 15;

      var value, offset_y;

      for (var scale = 0; scale < max_more; scale += max_less) {
        if (display >= 1 && display < 4) {
          
          if (display === 2) {
            offset_y = 75;
          } else if (display === 3) {
            offset_y = 125;
          } else {
            offset_y = 25;
          }

          value = displayValue(Math.round(scale), 0);

          this.text(offset_x, offset_y, value).attr({'font-weight': 'bold','fill': color}).toFront();
        }

        display--;
      }
    };

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
            point_size_hover  = options.point_size_hover,
            first_point       = (i == 0 ? true : false);

        if (dates.length > 45 && dates.length <= 90) {
          point_size = 3;
          point_size_hover = 5;
        } else if (dates.length > 90) {
          point_size = 0;
          point_size_hover = 3;
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

        (function (data, date, point, idx, position_index) {
          rect.hover(function () {
            point.attr({"r": point_size_hover});
          }, function () {
            point.attr({"r": point_size});
          });
        })(values[i], dates[i], point, 0, i);

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

        r.drawXAxis(dates, X);
        r.drawChart(X, Y);
        r.drawYAxis(max, "#AFAFAF");
      }
    };
  };

  $.delorean = function(target, data, options) {
    var delorean = new Delorean();
    delorean.init(target, data, options);
    return delorean;
  };

})(jQuery, window, this);
