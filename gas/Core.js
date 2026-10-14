/* Shared, deterministic news rules. No network, credentials, or browser dependencies. */
var TDCore = (function () {
  'use strict';
  var categories = [
    {id:'politics',label:'การเมือง',icon:'landmark',color:'#b49bd9'},
    {id:'society',label:'สังคม',icon:'people',color:'#79bca9'},
    {id:'crime',label:'อาชญากรรม',icon:'shield',color:'#dc9292'},
    {id:'economy',label:'เศรษฐกิจ',icon:'chart',color:'#d9bc7b'},
    {id:'world',label:'ต่างประเทศ',icon:'globe',color:'#8caee2'},
    {id:'tech',label:'เทคโนโลยี',icon:'sparkles',color:'#96a4ee'}
  ];
  function hash(s) {
    var a=2166136261,b=2246822507;
    for(var i=0;i<s.length;i++){a=Math.imul(a^s.charCodeAt(i),16777619);b=Math.imul(b^s.charCodeAt(i),3266489909);}
    return ('00000000'+(a>>>0).toString(16)).slice(-8)+('00000000'+(b>>>0).toString(16)).slice(-8);
  }
  function clean(s) {
    return String(s||'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|apos|lt|gt);|&#(?:x[0-9a-f]+|\d+);/gi,function(x){
      var m={ '&nbsp;':' ','&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'};
      if(m[x])return m[x];
      var n=x.charAt(2).toLowerCase()==='x'?parseInt(x.slice(3,-1),16):parseInt(x.slice(2,-1),10);
      return n>0&&n<=1114111?String.fromCodePoint(n):'';
    }).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/\s+/g,' ').trim();
  }
  function safeUrl(s) { return /^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:[/?#]|$)/i.test(String(s||''))?String(s):''; }
  function host(s) { var m=String(s||'').match(/^https?:\/\/([^/:?#]+)/i);return m?m[1].toLowerCase().replace(/^www\./,''):''; }
  function canonical(s) {
    s=safeUrl(s);if(!s)return '';
    var a=s.split('#')[0].split('?');
    if(a.length>1){var q=a.slice(1).join('?').split('&').filter(function(p){return !/^(utm_[^=]*|fbclid|gclid|mc_cid|mc_eid|ref|ref_src)=/i.test(p);});return a[0]+(q.length?'?'+q.sort().join('&'):'');}
    return a[0];
  }
  function classify(title,excerpt,fallback) {
    var s=String(title).toLowerCase();
    var rules={tech:/ปัญญาประดิษฐ์|เทคโนโลยี|\b(?:openai|chatgpt|gemini|nvidia|artificial intelligence|ai|cybersecurity|smartphone|iphone)\b/,crime:/จับกุม|อาชญากรรม|ฆาตกรรม|ยาเสพติด|(?:^|[^ห])ลักทรัพย์|ตำรวจ|คดีทุจริต|ยิงเสียชีวิต/,economy:/เศรษฐกิจ|ดอกเบี้ย|เงินเฟ้อ|ตลาดหุ้น|หลักทรัพย์|หุ้นกู้|ซื้อขาย|สินเชื่อ|ธนาคาร|ราคาทอง|ราคาน้ำมัน|ภาวะตลาด|การเงิน|\b(?:inflation|economy|interest rate|stock market|imf|gdp|jpmorgan)\b/,politics:/รัฐบาล|นายกรัฐมนตรี|นายกฯ|ครม\.|รัฐสภา|เลือกตั้ง|พรรคการเมือง|คณะรัฐมนตรี|ซักฟอก|อภิปราย|\b(?:election|parliament)\b/};
    if(fallback==='world')return fallback;
    for(var k in rules)if(rules[k].test(s))return k;
    return fallback&&fallback!=='general'?fallback:'society';
  }
  function normalize(raw,source,now) {
    var title=clean(raw.title),url=canonical(raw.url),published=Date.parse(raw.published||'');
    if(!title||title.length>260||!url||!Number.isFinite(published)||published>now+10*60000||published<now-72*3600000)return null;
    var name=clean(raw.source||source.name),sourceUrl=safeUrl(raw.sourceUrl)||source.home;
    if(name&&title.endsWith(' - '+name))title=title.slice(0,-name.length-3).trim();
    var h=host(sourceUrl)||host(url);
    if(/(?:^|\.)(?:facebook\.com|fb\.com|youtube\.com|tiktok\.com|vietnam\.vn|pinterest\.com)$/.test(h))return null;
    var excerpt=source.query||source.id==='google-th'?'':clean(raw.excerpt).replace(/The post[\s\S]*$/i,'').replace(title,'').trim().slice(0,200);
    if(excerpt.length<12)excerpt='';
    var category=classify(title,excerpt,source.category);
    var label=(categories.filter(function(c){return c.id===category;})[0]||categories[1]).label;
    var id=hash(title.toLowerCase().replace(/[\s\p{P}]/gu,'')+'|'+h);
    return {id:id,title:title,title_raw:title,title_th:title,excerpt:excerpt,snippet:excerpt,url:url,source:name,source_url:sourceUrl,host:h,published_at:new Date(published).toISOString(),category_id:category,category:label,module:category,language:/[\u0e00-\u0e7f]/.test(title)?'th':'en',first_seen_at:new Date(now).toISOString(),content_hash:hash(title+'|'+excerpt),score:0,group_count:1,adapter:source.id};
  }
  function rank(item,now) {
    var hours=Math.max(0,(now-Date.parse(item.published_at))/3600000);
    var impact=/ประกาศเตือน|อพยพ|แผ่นดินไหว|น้ำท่วม|สงคราม|หยุดยิง|เสียชีวิต|เลือกตั้ง|ดอกเบี้ย|\b(?:earthquake|ceasefire|war|evacuation|election)\b/i.test(item.title)?4:0;
    return Math.round((12*Math.exp(-hours/14)+impact+Math.min(3,(item.group_count||1)-1))*100)/100;
  }
  function merge(previous,incoming,now) {
    var map={},old={};(previous||[]).forEach(function(it){old[it.id]=it;});
    (previous||[]).concat(incoming||[]).forEach(function(it){
      if(!it||!it.id||Date.parse(it.published_at)<now-72*3600000||/(?:^|\.)(?:facebook\.com|fb\.com|youtube\.com|tiktok\.com|vietnam\.vn|pinterest\.com)$/.test(it.host)||it.title.length>260)return;
      if(old[it.id])it=Object.assign({},it,{first_seen_at:old[it.id].first_seen_at||it.first_seen_at});
      if(map[it.id]&&map[it.id].excerpt&&!it.excerpt)it=Object.assign({},it,{excerpt:map[it.id].excerpt,snippet:map[it.id].excerpt});
      it=Object.assign({},it);
      if(map[it.id]&&map[it.id].image_url&&!it.image_url){it.image_url=map[it.id].image_url;it.image_origin=map[it.id].image_origin;}
      if(map[it.id]&&map[it.id].image_checked_at&&!it.image_checked_at)it.image_checked_at=map[it.id].image_checked_at;
      if(/^google-/.test(it.adapter||'')||host(it.url)==='news.google.com'){it.excerpt='';it.snippet='';}
      else {it.excerpt=clean(it.excerpt).replace(/\s*The (?:post|po)[\s\S]*$/i,'').trim();it.snippet=it.excerpt;}
      it.category_id=classify(it.title,it.excerpt,it.category_id);
      var cat=categories.filter(function(c){return c.id===it.category_id;})[0]||categories[1];
      it.category=cat.label;it.module=cat.id;
      map[it.id]=it;
    });
    var items=Object.keys(map).map(function(k){return map[k];});
    items.forEach(function(it){it.score=rank(it,now);});
    items.sort(function(a,b){return Date.parse(b.published_at)-Date.parse(a.published_at);});
    return items.slice(0,360);
  }
  function top(items,limit) {
    var sorted=items.slice().sort(function(a,b){return b.score-a.score;}),out=[],seen={};
    sorted.forEach(function(it){if(!seen[it.category_id]&&out.length<limit){out.push(it);seen[it.category_id]=true;}});
    sorted.forEach(function(it){if(out.length<limit&&!out.some(function(o){return o.id===it.id;}))out.push(it);});
    return out.sort(function(a,b){return b.score-a.score;});
  }
  function quiet(prefs,now) {
    if(!prefs.quietHours)return false;
    var hour=new Date(now-(Number(prefs.timezoneOffset)||-420)*60000).getUTCHours();
    return hour>=22||hour<7;
  }
  function matches(item,prefs) {
    return (!(prefs.categories||[]).length||prefs.categories.indexOf(item.category_id)>=0)&&(!prefs.importantOnly||item.score>=13);
  }
  return {categories:categories,hash:hash,clean:clean,safeUrl:safeUrl,host:host,canonical:canonical,classify:classify,normalize:normalize,rank:rank,merge:merge,top:top,quiet:quiet,matches:matches};
})();
