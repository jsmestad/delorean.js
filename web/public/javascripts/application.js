(function($) {
  
  $(document).ready(function(){

    $.getJSON('/stats?sequence_length=7', function(stats) {
      var chart = $.delorean('#week_chart', stats, {});
      chart.render();
    });

    $.getJSON('/stats?sequence_length=30', function(stats) {
      var chart = $.delorean('#month_chart', stats, {});
      chart.render();
    });

    $.getJSON('/stats?sequence_length=90', function(stats) {
      var chart = $.delorean('#quarter_chart', stats, {});
      chart.render();
    });

    $.getJSON('/stats?sequence_length=180', function(stats) {
      var chart = $.delorean('#semiannual_chart', stats, {});
      chart.render();
    });

  });
  
})(jQuery);

// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
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
