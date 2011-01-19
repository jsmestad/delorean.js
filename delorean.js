/*
* Delorean.js -- Raphael-based time series graphing library
* This work is Copyright by Justin Smestad
* It is licensed under the Apache License 2.0
*
* This code requires jQuery, Underscore.js, and Raphael.js
* http://github.com/jsmestad/delorean.js
*/

(function($, window, document, undefined) {
  // Constructor.
  var Delorean = function(options) {
    // Empty vars.
    var chart, data;

    // Defaults.
    options = {
      // Colors for graphs.
      line_colors: [
        '#4da74d',
        '#afd8f8',
        '#edc240',
        '#cb4b4b',
        '#9440ed'
      ],
      date_format: '%m/%d',
      width: 700,
      height: 200,
      label_display_count: 3,
      label_offset: 15,
      margin_left: 5,
      margin_bottom: 5,
      margin_top: 5,
      text_date: {
        'fill': '#333',
        'font-size': '10px'
      },
      text_metric: {
        'font-size': '13px',
        'font-family': 'Arial, san-serif'
      },
      stroke_width: 4,
      stroke_width_dense: 2,
      point_size: 5,
      point_size_hover: 7
    };

    function log() {
      window.console && console.log(Array.prototype.slice.call(arguments));
    }

    function parseDate(d) {
      d = new Date(d);

      if (isNaN(d)) {
        log('ISO 8601 Date constructor not supported.');
        d = new Date();
        d.setISO8601(d);
      }

      return d;
    }

    function displayValue(value, precision) {
      if (value >= 0 && value < 1000) {
        return value.toString();
      }
      else if (value >= 1000 && value < 1000000) {
        return (value / 1000).toFixed(precision) + 'K';
      }
      else if (value >= 1000000) {
        return (value / 1000000).toFixed(precision) + 'M';
      }
    }

    // This draws the X Axis (the dates).
    Raphael.fn.drawXAxis = function(dates, X) {
      var x, date;
      var dates_length = dates.length;
      var num_to_skip = Math.round(dates_length / 11);
      var y_position = options.height - 8;
      var i = dates_length;

      while (i--) {
        if (i === 0 && dates_length < 20) {
          x = -10;
        }
        else if (dates_length > 60 && i === 1) {
          x = Math.round(X * i) + 5;
        }
        else {
          x = Math.round(X * i);
        }

        if ((dates_length < 20) || (i !== 0 && i % num_to_skip === 1)) {
          date = parseDate(dates[i]).strftime(options.date_format);
          this.text(x, y_position, date).attr({
            'font-size': '10px',
            'fill': '#afafaf'
          }).toBack();
        }
      }
    };

    // This draws the Y Axis (the scale).
    Raphael.fn.drawYAxis = function(max, color) {
      var display = options.label_display_count + 1;
      var max_more = max * 1.33;
      var max_less = max / display;
      var offset_x = options.label_offset;
      var y_spacing = Math.round((options.height - options.margin_bottom - options.margin_top) / display);

      // Start from lower number and go higher.
      var offset_y = y_spacing * display;

      for (var scale = 0; scale < max_more; scale += max_less) {
        if (display >= 1 && scale > 0) {
          this.text(offset_x, offset_y, displayValue(Math.round(scale), 0)).attr({
            'fill': color,
            'font-weight': 'bold'
          }).toFront();
        }

        offset_y -= y_spacing;
        display--;
      }
    };

    Raphael.fn.drawChart = function(X, Y) {
      var line_paths = [];
      var dates = _(data).keys();
      var values = _(data).values();
      var margin_left = options.margin_left;
      var margin_bottom = options.margin_bottom;
      var margin_top = options.margin_top;
      var stroke_width = dates.length > 45 ? options.stroke_width_dense : options.stroke_width;

      for (var k = 0, kk = values[0].length; k < kk; k++) {
        line_paths[k] = this.path().attr({
          'stroke': options.line_colors[k],
          'stroke-width': stroke_width,
          'stroke-linejoin': 'round'
        });
      }

      // Not sure if we need this yet.
      // var bgp = this.path().attr({stroke: 'none', opacity: 0.0, fill: line_color})
      //             .moveTo(margin_left + X * -0.5, options.height - margin_bottom),

      var layer = this.set();
      var point_array = [];
      var tooltip_visible = false;
      var leave_timer = null;
      var dates_length = dates.length;

      for (var i = 0; i < dates_length; i++) {
        var x = Math.round(X * i);

        point_array[x] = [];

        var stroke_color = '#fff';
        var point_size = options.point_size;
        var point_size_hover = options.point_size_hover;
        var first_point = i === 0;

        if (dates_length > 45 && dates_length <= 90) {
          point_size = 3;
          point_size_hover = 5;
        }
        else if (dates_length > 90) {
          point_size = 0;
          point_size_hover = 3;
        }

        for (var j = 0; j < values[i].length; j++) {
          var value = values[i][j];
          var y = Math.round(options.height - margin_bottom - Y * value);

          if (value < 0) {
            y = Math.round(options.height - margin_bottom - Y * 0);
          }

          if (dates_length < 45) {
            // bgp[(first_point ? 'lineTo' : 'cplineTo')](x, y, 10);
            line_paths[j][(first_point ? 'moveTo' : 'cplineTo')](x, y, 10);
          }
          else {
            // bgp[(first_point ? 'lineTo' : 'lineTo')](x, y, 10);
            line_paths[j][(first_point ? 'moveTo' : 'lineTo')](x, y, 10);
          }

          var point = this.circle(x, y, point_size).attr({
            fill: options.line_colors[j],
            stroke: stroke_color
          });

          point.insertAfter(line_paths[j]);
          point_array[x].push(point);
        }

        layer.push(this.rect(X * i, 0, X, options.height - margin_bottom).attr({
          'stroke': 'none',
          'fill': '#fff',
          'opacity': 0
        }));

        (function(rect, points, x) {
          rect.hover(function() {
            _.each(points[x], function(point) {
              point.attr({
                'r': point_size_hover
              });
            });
          },
          function() {
            _.each(points[x], function(point) {
              point.attr({
                'r': point_size
              });
            });
          });
        })(layer[layer.length - 1], point_array, x);
      }
    };

    return {
      init: function(target_, data_, options_) {
        $.extend(true, options, options_);

        chart = $(target_);
        chart.children().remove();
        data = data_;

        var i = data.length;

        while (i--) {
          data[i] = parseDate(data[i]);
        }
      },
      render: function() {
        var max;
        var r = Raphael(chart.get(0), options.width, options.height);
        var dates = _(data).keys();
        var values = _(data).values();

        if (_.isArray(values[0])) {
          max = _(_(values).flatten()).max();
        }
        else {
          max = _(values).max();

          _.each(data, function(value, key) {
            data[key] = [value];
          });
        }

        var X = options.width / dates.length;
        var Y = (options.height - options.margin_bottom - options.margin_top) / max;

        r.drawXAxis(dates, X);
        r.drawChart(X, Y);
        r.drawYAxis(max, '#afafaf');
      }
    };
  };

  $.delorean = function(target, data, options) {
    var delorean = new Delorean();
    delorean.init(target, data, options);
    return delorean;
  };

})(jQuery, this, this.document);