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
    var rules={tech:/ปัญญาประดิษฐ์|เทคโนโลยี|\b(?:openai|chatgpt|gemini|nvidia|artificial intelligence|ai|cybersecurity|smartphone|iphone)\b/,crime:/จับกุม|อาชญากรรม|ฆาตกรรม|ยาเสพติด|(?:^|[^ห])ลักทรัพย์|ตำรวจ|คดีทุจริต|ยิงเสียชีวิต/,economy:/เศรษฐกิจ|ดอกเบี้ย|เงินเฟ้อ|ตลาดหุ้น|หลักทรัพย์|หุ้นกู้|ซื้อขาย|สินเชื่อ|ธนาคาร|ราคาทอง|ราคาน้ำมัน|ภาวะตลาด|การเงิน|\b(?:inflation|economy|interest rate|stock market|imf|gdp|jpmorgan)\b/,politics:/รัฐบาล|นายกรัฐมนตรี|นายกฯ|ครม\.|รัฐสภา|เลือกตั้ง|พรรคการเมือง|คณะรัฐมนตรี|ซักฟอก|อภิปราย|\b(?:election|parliament)\b/,world:/สงคราม|หยุดยิง|โจมตี|ขีปนาวุธ|นิวเคลียร์|สหรัฐฯ|สหรัฐอเมริกา|รัสเซีย|ยูเครน|จีน|ญี่ปุ่น|เกาหลี|อิสราเอล|อิหร่าน|ตะวันออกกลาง|สหประชาชาติ|\b(?:war|ceasefire|airstrike|missile|united states|russia|ukraine|israel|iran|china|japan|united nations)\b/};
    if(fallback==='world')return fallback;
    for(var k in rules)if(rules[k].test(s))return k;
    return fallback&&fallback!=='general'?fallback:'society';
  }
  function scopeOf(item) {
    var s=String(item.title||'').toLowerCase();
    if(/ไทย|ประเทศไทย|กรุงเทพ|นายกฯ|นายกรัฐมนตรี|รัฐบาลไทย|ครม\.|รัฐสภา|สภาฯ|กนง\.|ธปท\.|เงินบาท|จังหวัด|อำเภอ|กรมอุตุ|ปภ\.|กทม\./i.test(s))return 'thailand';
    if(/ซาอุ|ศรีลังกา|กัมพูชา|มาเลเซีย|สิงคโปร์|ปากีสถาน|บังกลาเทศ|\b(?:saudi|sri lanka|cambodia|malaysia|singapore|pakistan|bangladesh)\b/i.test(s))return 'world';
    if(item.category_id==='world'||/สงคราม|หยุดยิง|โจมตี|ขีปนาวุธ|นิวเคลียร์|สหรัฐฯ|เฟด|ดาวโจนส์|แนสแด็ก|nasdaq|วอลล์สตรีท|รัสเซีย|ยูเครน|จีน|ญี่ปุ่น|เกาหลี|เมียนมา|พม่า|เวียดนาม|อินเดีย|อินโดนีเซีย|ฟิลิปปินส์|อิสราเอล|อิหร่าน|ตะวันออกกลาง|ยุโรป|อาเซียน|\b(?:war|ceasefire|airstrike|missile|united states|federal reserve|wall street|russia|ukraine|israel|iran|china|japan|europe|myanmar|vietnam|india|indonesia|philippines)\b/i.test(s))return 'world';
    return item.language==='th'?'thailand':'world';
  }
  function titleWords(title) {
    var stop={ข่าว:1,ด่วน:1,ล่าสุด:1,วันนี้:1,เผย:1,เปิด:1,หลัง:1,ก่อน:1,พร้อม:1,จาก:1,ของ:1,และ:1,หรือ:1,ใน:1,ที่:1,เป็น:1,the:1,and:1,for:1,with:1,from:1,after:1,new:1,latest:1,breaking:1};
    return clean(title).toLowerCase().replace(/[|()[\]{}“”‘’'".,:;!?/\\–—_-]/g,' ').split(/\s+/).filter(function(w){return w.length>=3&&!stop[w]&&!/^\d{1,2}[\/.:-]\d/.test(w);}).slice(0,22);
  }
  function similar(a,b) {
    if(a.category_id!==b.category_id||Math.abs(Date.parse(a.published_at)-Date.parse(b.published_at))>12*3600000)return false;
    var aw=a._topicWords||titleWords(a.title),bw=b._topicWords||titleWords(b.title),seen={},common=0;
    aw.forEach(function(w){seen[w]=true;});bw.forEach(function(w){if(seen[w])common++;});
    var base=Math.max(1,Math.min(aw.length,bw.length));
    return common>=2&&common/base>=0.34||common>=3&&common/base>=0.26;
  }
  function impactOf(item) {
    var s=String(item.title||'');
    if(/ฉากทัศน์|บทวิเคราะห์|วิเคราะห์(?:สถานการณ์|แนวโน้ม)|ย้อนรอย|ย้อน(?:อดีต|ประวัติ)|บทเรียนจาก|\b(?:opinion|analysis|anniversary|what if)\b/i.test(s))return 1;
    var quake=s.match(/(?:ขนาด|magnitude)\s*([0-9]+(?:\.[0-9]+)?)/i);if(quake&&Number(quake[1])<5)return 1;
    var noise=/รีบเลย|เลขเด็ด|ดูดวง|ผลบอล|ดารา|เปิดวาร์ป|ชาวเน็ต|ไวรัล|สุดช็อก|ราคาทองวันนี้|ภาวะตลาด|stock focus|สรุปปริมาณการซื้อขาย|กวาดรางวัล|คว้ารางวัล|เปิดตัวสินค้า|โปรโมชั่น/i.test(s);
    if(noise)return 0;
    if(/สึนามิ|แผ่นดินไหว|อพยพ|ภัยพิบัติ|ประกาศฉุกเฉิน|กฎอัยการศึก|รัฐประหาร|ก่อการร้าย|ระเบิดครั้งใหญ่|โรงไฟฟ้านิวเคลียร์|โรคระบาด|ระบบล่มทั่วประเทศ|ไฟดับทั่วประเทศ|\b(?:tsunami|major earthquake|evacuation|state of emergency|coup|terror attack|nuclear plant|pandemic)\b/i.test(s))return 5;
    if(/ประกาศเตือน|เตือนภัย|น้ำท่วมฉับพลัน|พายุเข้า|ดินถล่ม|สงคราม|ขีปนาวุธ|โจมตีทางอากาศ|หยุดยิง|ยุบสภา|นายก(?:ฯ|รัฐมนตรี)?ลาออก|ศาลรัฐธรรมนูญ.*(?:ยุบ|วินิจฉัย)|ผลเลือกตั้ง|ปิดน่านฟ้า|ปิดชายแดน|\b(?:war|missile|airstrike|ceasefire|parliament dissolved|prime minister resigns|election result)\b/i.test(s))return 4;
    if(/เลือกตั้ง|มติครม\.|มติ กนง\.|ขึ้นดอกเบี้ย|ลดดอกเบี้ย|เงินเฟ้อ.*(?:สูงสุด|พุ่งแรง)|จีดีพี|gdp|คว่ำบาตร|ข้อตกลงสันติภาพ|ประกาศใช้|มีผลบังคับ|ข้อมูลรั่วไหล|โจมตีไซเบอร์/i.test(s))return 3;
    if(/รัฐบาล|รัฐสภา|ศาล|ธปท\.|น้ำท่วม|พายุ|เศรษฐกิจ|เงินเฟ้อ|ราคาน้ำมัน|ค่าไฟ|ค่าแรง|ภาษี|สาธารณสุข|วัคซีน/i.test(s))return 2;
    return 1;
  }
  function signalOf(item,now) {
    var hours=Math.max(0,(now-Date.parse(item.published_at))/3600000),impact=item.impact||0,sources=item.source_count||1,scope=scopeOf(item),signal='latest',level='none';
    var explicit=/^(?:ด่วน|breaking)|ประกาศเตือน|เตือนภัย|อพยพ|เกิดเหตุ|มติ(?:ครม\.| กนง\.)|ยุบสภา|ลาออก|\b(?:breaking|evacuation|state of emergency)\b/i.test(item.title||'');
    var decision=/มติ|ผลเลือกตั้ง|ขึ้นดอกเบี้ย|ลดดอกเบี้ย|ยุบสภา|ลาออก|ประกาศใช้|มีผลบังคับ|จีดีพี|gdp|\b(?:decision|election result|resigns|takes effect)\b/i.test(item.title||'');
    if((hours<=3&&impact>=5)||(hours<=2&&impact>=4&&(explicit||sources>=2))){signal='breaking';level='breaking';}
    else if((hours<=8&&impact>=4&&(sources>=2||scope==='thailand'))||(hours<=6&&impact>=3&&sources>=3&&decision)){signal='major';level='major';}
    else if(hours<=12&&sources>=3&&(impact>=2||sources>=4)){signal='trending';level='watch';}
    else if(hours<=3&&sources>=2&&impact>=2){signal='rising';level='watch';}
    var eligible=scope==='thailand'?level!=='none':(signal==='breaking'||signal==='major')&&impact>=4;
    return {scope:scope,impact:impact,signal:signal,alert_level:level,alert_eligible:eligible};
  }
  function normalize(raw,source,now) {
    var title=clean(raw.title),url=canonical(raw.url),published=Date.parse(raw.published||'');
    if(!title||title.length>260||!url||!Number.isFinite(published)||published>now+10*60000||published<now-72*3600000)return null;
    var name=clean(raw.source||source.name),sourceUrl=safeUrl(raw.sourceUrl)||source.home;
    if(name&&title.endsWith(' - '+name))title=title.slice(0,-name.length-3).trim();
    var h=host(sourceUrl)||host(url);
    if(/(?:^|\.)(?:facebook\.com|fb\.com|youtube\.com|tiktok\.com|vietnam\.vn|pinterest\.com)$/.test(h))return null;
    var excerpt=source.query||source.id==='google-th'?'':clean(raw.excerpt).replace(/The post[\s\S]*$/i,'').replace(title,'').trim().slice(0,320);
    if(excerpt.length<12)excerpt='';
    var category=classify(title,excerpt,source.category);
    var label=(categories.filter(function(c){return c.id===category;})[0]||categories[1]).label;
    var id=hash(title.toLowerCase().replace(/[\s\p{P}]/gu,'')+'|'+h);
    return {id:id,title:title,title_raw:title,title_th:title,excerpt:excerpt,snippet:excerpt,url:url,source:name,source_url:sourceUrl,host:h,published_at:new Date(published).toISOString(),category_id:category,category:label,module:category,language:/[\u0e00-\u0e7f]/.test(title)?'th':'en',first_seen_at:new Date(now).toISOString(),content_hash:hash(title+'|'+excerpt),score:0,group_count:1,source_count:1,adapter:source.id};
  }
  function rank(item,now) {
    var hours=Math.max(0,(now-Date.parse(item.published_at))/3600000);
    var signalBonus={breaking:8,major:5,trending:3,rising:2,latest:0}[item.signal||'latest']||0;
    return Math.round((10*Math.exp(-hours/16)+(item.impact||impactOf(item))*1.8+Math.min(5,(item.source_count||1)-1)*1.2+signalBonus)*100)/100;
  }
  function merge(previous,incoming,now) {
    var map={},old={};(previous||[]).forEach(function(it){old[it.id]=it;});
    (previous||[]).concat(incoming||[]).forEach(function(it){
      if(!it||!it.id||Date.parse(it.published_at)<now-72*3600000||/(?:^|\.)(?:facebook\.com|fb\.com|youtube\.com|tiktok\.com|vietnam\.vn|pinterest\.com)$/.test(it.host)||it.title.length>260)return;
      if(old[it.id])it=Object.assign({},it,{first_seen_at:old[it.id].first_seen_at||it.first_seen_at});
      // The same headline can arrive later from Google while its publisher feed is not due.
      // Keep the publisher record: Google contributes no article body or direct URL.
      if(map[it.id]&&!/^google-/.test(map[it.id].adapter||'')&&host(map[it.id].url)!=='news.google.com'&&(/^google-/.test(it.adapter||'')||host(it.url)==='news.google.com'))it=Object.assign({},it,map[it.id]);
      if(map[it.id]&&map[it.id].excerpt&&!it.excerpt)it=Object.assign({},it,{excerpt:map[it.id].excerpt,snippet:map[it.id].excerpt});
      it=Object.assign({},it);
        if(map[it.id]&&map[it.id].metadata_checked_at&&!it.metadata_checked_at)it.metadata_checked_at=map[it.id].metadata_checked_at;
        if(map[it.id]&&(map[it.id].reading_text||'').length>(it.reading_text||'').length){it.reading_text=map[it.id].reading_text;it.reading_origin=map[it.id].reading_origin;}
      if(map[it.id]&&map[it.id].image_url&&!it.image_url){it.image_url=map[it.id].image_url;it.image_origin=map[it.id].image_origin;}
      if(map[it.id]&&map[it.id].image_checked_at&&!it.image_checked_at)it.image_checked_at=map[it.id].image_checked_at;
      if(/^google-/.test(it.adapter||'')||host(it.url)==='news.google.com'){it.excerpt='';it.snippet='';it.reading_text='';}
      else {it.excerpt=clean(it.excerpt).replace(/\s*The (?:post|po)[\s\S]*$/i,'').trim();it.snippet=it.excerpt;}
      it.category_id=classify(it.title,it.excerpt,it.category_id);
        it.content_hash=hash(it.title+'|'+(it.reading_text||it.excerpt||''));
      var cat=categories.filter(function(c){return c.id===it.category_id;})[0]||categories[1];
      it.category=cat.label;it.module=cat.id;
      map[it.id]=it;
    });
    var items=Object.keys(map).map(function(k){return map[k];});
    items.sort(function(a,b){return Date.parse(b.published_at)-Date.parse(a.published_at);});
    var clusters=[];
    items.forEach(function(it){
      it._topicWords=titleWords(it.title);var cluster=null;
      for(var c=0;c<clusters.length;c++)if(similar(it,clusters[c].representative)){cluster=clusters[c];break;}
      if(!cluster){cluster={representative:it,items:[],sources:{},existing:[]};clusters.push(cluster);}
      cluster.items.push(it);cluster.sources[(it.host||it.source||it.id).toLowerCase()]=true;if(it.topic_id)cluster.existing.push(it.topic_id);
    });
    clusters.forEach(function(cluster){
      var sourceCount=Object.keys(cluster.sources).length,topic=cluster.existing.sort()[0]||hash(cluster.representative._topicWords.slice().sort().slice(0,8).join('|'));
      cluster.items.forEach(function(it){it.group_count=cluster.items.length;it.source_count=sourceCount;it.topic_id=topic;delete it._topicWords;it.impact=impactOf(it);var state=signalOf(it,now);it.scope=state.scope;it.signal=state.signal;it.alert_level=state.alert_level;it.alert_eligible=state.alert_eligible;it.score=rank(it,now);});
    });
    items.sort(function(a,b){return Date.parse(b.published_at)-Date.parse(a.published_at);});
    return items.slice(0,360);
  }
  function top(items,limit) {
    var sorted=items.slice().sort(function(a,b){return b.score-a.score;}),out=[],seen={},topics={};
    sorted.forEach(function(it){if(!seen[it.category_id]&&!topics[it.topic_id]&&out.length<limit){out.push(it);seen[it.category_id]=true;topics[it.topic_id]=true;}});
    sorted.forEach(function(it){if(out.length<limit&&!topics[it.topic_id]&&!out.some(function(o){return o.id===it.id;})){out.push(it);topics[it.topic_id]=true;}});
    return out.sort(function(a,b){return b.score-a.score;});
  }
  function quiet(prefs,now) {
    if(!prefs.quietHours)return false;
    var hour=new Date(now-(Number(prefs.timezoneOffset)||-420)*60000).getUTCHours();
    return hour>=22||hour<7;
  }
  function matches(item,prefs) {
    if(!item.alert_eligible)return false;
    var mode=prefs.alertMode||'major',accepted=mode==='signals'||mode==='major'&&(item.signal==='breaking'||item.signal==='major')||mode==='breaking'&&item.signal==='breaking';
    return accepted&&(!(prefs.categories||[]).length||prefs.categories.indexOf(item.category_id)>=0);
  }
  return {categories:categories,hash:hash,clean:clean,safeUrl:safeUrl,host:host,canonical:canonical,classify:classify,scopeOf:scopeOf,titleWords:titleWords,impactOf:impactOf,signalOf:signalOf,normalize:normalize,rank:rank,merge:merge,top:top,quiet:quiet,matches:matches};
})();
