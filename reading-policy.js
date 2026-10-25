/* Reading decisions shared by the browser build and its Android assets. */
var TDNReading=(function(){
  function mode(item){
    var length=(item.reading_text||item.excerpt||'').length;
    if(length<80)return 'unavailable';
    if(item.language==='en'||item.signal==='breaking'||item.signal==='major')return 'auto';
    return 'cached';
  }
  function quality(item){return ((item.reading_text||item.excerpt||'').length>=120?4:0)+(!/^google-/.test(item.adapter||'')&&!/^https?:\/\/news\.google\.com\//i.test(item.url||'')?2:0)+(item.image_url?1:0);}
  function representatives(items){
    var order=[],byTopic={};items.forEach(function(item){var key=item.topic_id||item.id,old=byTopic[key];if(!old)order.push(key);if(!old||quality(item)>quality(old))byTopic[key]=item;});
    return order.map(function(key){return byTopic[key];});
  }
  return {mode:mode,representatives:representatives};
})();
