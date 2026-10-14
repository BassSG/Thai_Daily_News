/* Only publisher-provided images. No paid search, generic stock photos or image proxy. */
var TDImages=(function(){
  function attrs(tag){var out={},re=/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g,m;while((m=re.exec(tag)))out[m[1].toLowerCase()]=TDCore.clean(m[2]!==undefined?m[2]:m[3]!==undefined?m[3]:m[4]);return out;}
  function url(value,base){
    var s=String(value||'').replace(/&amp;/gi,'&').trim();if(!s||s.length>2000||/[\s<>"'`]/.test(s))return '';
    if(/^[a-z][a-z0-9+.-]*:/i.test(s)&&!/^https?:/i.test(s))return '';
    if(s.indexOf('//')===0)s='https:'+s;
    else if(s.charAt(0)==='/'){var origin=String(base||'').match(/^https:\/\/[^/]+/i);if(!origin)return '';s=origin[0]+s;}
    else if(!/^https?:/i.test(s)){var directory=String(base||'').split(/[?#]/)[0].replace(/\/[^/]*$/,'/');if(!/^https:\/\//i.test(directory))return '';s=directory+s;}
    s=s.replace(/^http:/i,'https:');
    var match=s.match(/^https:\/\/([a-z0-9.-]+)(?::443)?\//i);if(!match)return '';
    var host=match[1].toLowerCase();if(!host.includes('.')||/^[\d.]+$/.test(host)||/\.(?:local|internal|localhost|test|invalid)$/.test(host))return '';
    if(/(?:^|[/_.-])(?:logo|favicon|sprite|placeholder|tracking|pixel)(?:[/_.-]|$)/i.test(s.split('?')[0]))return '';
    return s;
  }
  function markup(html,base){var tags=String(html||'').match(/<img\b[^>]{0,3000}>/gi)||[];for(var i=0;i<tags.length;i++){var a=attrs(tags[i]);if((a.width&&Number(a.width)<80)||(a.height&&Number(a.height)<60))continue;var candidate=url(a['data-src']||a.src,base);if(candidate)return candidate;}return '';}
  function meta(html,base){
    var tags=String(html||'').split(/<\/head\s*>/i)[0].slice(0,500000).match(/<meta\b[^>]{0,3000}>/gi)||[],values={};
    tags.forEach(function(tag){var a=attrs(tag),key=(a.property||a.name||'').toLowerCase();if(key&&a.content&&!values[key])values[key]=a.content;});
    if(values['og:type']==='website'&&values['og:url']&&values['og:url'].split(/[?#]/)[0].replace(/\/$/,'')!==String(base).split(/[?#]/)[0].replace(/\/$/,''))return '';
    if((values['og:image:width']&&Number(values['og:image:width'])<80)||(values['og:image:height']&&Number(values['og:image:height'])<60))return '';
    return url(values['og:image:secure_url']||values['og:image']||values['twitter:image']||values['twitter:image:src'],base);
  }
  function feed(node,description,base){
    var choices=[];
    function visit(parent,depth){if(depth>2)return;parent.getChildren().forEach(function(child){var name=child.getName(),a={};child.getAttributes().forEach(function(attr){a[attr.getName()]=attr.getValue();});if((name==='thumbnail'||name==='content'||name==='enclosure')&&(name==='thumbnail'||a.medium==='image'||/^image\//i.test(a.type||'')||/\.(?:jpe?g|png|webp)(?:\?|$)/i.test(a.url||''))){var candidate=url(a.url,base);if(candidate&&(!a.width||Number(a.width)>=80)&&(!a.height||Number(a.height)>=60))choices.push({url:candidate,size:Number(a.width)||0});}if(name==='group')visit(child,depth+1);});}
    visit(node,0);choices.sort(function(a,b){return b.size-a.size;});
    return choices.length?choices[0].url:markup(description,base);
  }
  return {url:url,markup:markup,meta:meta,feed:feed};
})();

function tdEnrichImages_(items,now){
  // Bound extra metadata requests. Previously checked stories retry after six hours, not every read.
  var allowed=['infoquest.co.th','aljazeera.com','bangkokpost.com'];
  var candidates=items.filter(function(it){return !it.image_url&&allowed.indexOf(TDCore.host(it.url))>=0&&(!it.image_checked_at||now-Date.parse(it.image_checked_at)>6*3600000);});
  candidates.sort(function(a,b){return b.score-a.score;});candidates=candidates.slice(0,8);if(!candidates.length)return;
  try{
    var responses=UrlFetchApp.fetchAll(candidates.map(function(it){return {url:it.url,method:'get',headers:{Accept:'text/html'},muteHttpExceptions:true,followRedirects:true,validateHttpsCertificates:true};}));
    candidates.forEach(function(it,i){it.image_checked_at=new Date(now).toISOString();try{var response=responses[i];if(response.getResponseCode()!==200)return;var html=response.getContentText('UTF-8');if(html.length>2000000)return;var image=TDImages.meta(html,it.url);if(image){it.image_url=image;it.image_origin='publisher';}}catch(ignored){}});
  }catch(ignored){candidates.forEach(function(it){it.image_checked_at=new Date(now).toISOString();});}
}
