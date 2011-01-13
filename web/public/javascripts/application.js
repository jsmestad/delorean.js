(function($) {
  
  $(document).ready(function(){

    // Single Lines
    if ($('#week_chart').length) {
      $.getJSON('/stats?sequence_length=7', function(stats) {
        var chart = $.delorean('#week_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#month_chart').length) {
      $.getJSON('/stats?sequence_length=30', function(stats) {
        var chart = $.delorean('#month_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#quarter_chart').length) {
      $.getJSON('/stats?sequence_length=90', function(stats) {
        var chart = $.delorean('#quarter_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#semiannual_chart').length) {
      $.getJSON('/stats?sequence_length=180', function(stats) {
        var chart = $.delorean('#semiannual_chart', stats, {width: 780});
        chart.render();
      });
    }

    // Multiple Lines
    if ($('#multi_week_chart').length) {
      $.getJSON('/stats?sequence_length=7&multi_line=2', function(stats) {
        var chart = $.delorean('#multi_week_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#multi_month_chart').length) {
      $.getJSON('/stats?sequence_length=30&multi_line=4', function(stats) {
        var chart = $.delorean('#multi_month_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#multi_quarter_chart').length) {
      $.getJSON('/stats?sequence_length=90&multi_line=3', function(stats) {
        var chart = $.delorean('#multi_quarter_chart', stats, {width: 780});
        chart.render();
      });
    }

    if ($('#multi_semiannual_chart').length) {
      $.getJSON('/stats?sequence_length=180&multi_line=2', function(stats) {
        var chart = $.delorean('#multi_semiannual_chart', stats, {width: 780});
        chart.render();
      });
    }

  });
  
})(jQuery);

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  // log.history = log.history || [];   // store logs to an array for reference
  // log.history.push(arguments);
  if(this.console){
    console.log( Array.prototype.slice.call(arguments) );
  }
};

// catch all document.write() calls
(function(doc){
  var write = doc.write;
  doc.write = function(q){ 
    log('document.write(): ',arguments); 
    if (/docwriteregexwhitelist/.test(q)) write.apply(doc,arguments);  
  };
})(document);
