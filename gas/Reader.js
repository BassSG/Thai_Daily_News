/* Short publisher leads, without unrelated headlines or page scripts. */
var TDReader=(function(){
  function lead(html,title){
    var text=String(html||'').slice(0,150000).replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<\/(?:p|div|li|h[1-6])\s*>|<br\s*\/?>/gi,'\n');
    text=text.replace(/\s*The post[\s\S]*$/i,'');
    var entities={hellip:'…',ndash:'–',mdash:'—',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”'};
    text=text.replace(/&(hellip|ndash|mdash|lsquo|rsquo|ldquo|rdquo);/gi,function(_,key){return entities[key.toLowerCase()];});
    var headline=TDCore.clean(title),parts=text.split(/\n+/).map(function(p){return TDCore.clean(p);}).filter(function(p){return p.length>20&&p!==headline&&!/^(?:อ่านต่อ|อ่านเพิ่มเติม|ติดตาม|แชร์|Advertisement|Read more|Subscribe|Sign up)/i.test(p);});
    text=parts.join('\n\n').trim();
    if(text.length<=1200)return text;
    var cut=text.slice(0,1200),boundary=Math.max(cut.lastIndexOf('\n'),cut.lastIndexOf('. '),cut.lastIndexOf('。'));
    if(boundary>650)return cut.slice(0,boundary+1).trim();
    return cut.replace(/\s+\S*$/,'').trim()+'…';
  }
  function feed(description,encoded,title){var a=lead(description,title),b=lead(encoded,title);return b.length>a.length?b:a;}
  function nodeContent(node){
    var best='';
    node.getChildren().forEach(function(c){
      if(c.getName()!=='encoded'&&c.getName()!=='content')return;
      var ns=c.getNamespace(),uri=ns&&ns.getURI?ns.getURI():'';
      if(/search\.yahoo\.com\/mrss/i.test(uri)||c.getAttribute('url')||c.getAttribute('src'))return;
      var value=c.getText();if(lead(value,'').length>lead(best,'').length)best=value;
    });
    return best;
  }
  function identity(value){return TDCore.canonical(value).replace(/^http:/,'https:').replace(/\/$/,'');}
  function structured(html,base,title){
    var best='',count=0,expected=identity(base),headline=TDCore.clean(title).toLowerCase().replace(/[\s\p{P}]/gu,'');
    function visit(value,depth){
      if(!value||typeof value!=='object'||depth>8||++count>150)return;
      if(Array.isArray(value)){value.slice(0,30).forEach(function(v){visit(v,depth+1);});return;}
      var types=Array.isArray(value['@type'])?value['@type']:[value['@type']];
      if(types.some(function(t){return /^(?:Article|NewsArticle|ReportageNewsArticle|AnalysisNewsArticle|BlogPosting)$/.test(t||'');})){
        var page=value.mainEntityOfPage,urls=[value.url,typeof page==='string'?page:page&&page['@id']].filter(function(v){return typeof v==='string'&&/^https?:\/\//i.test(v);});
        var same=urls.length?urls.every(function(v){return identity(v)===expected;}):headline.length>=12&&TDCore.clean(value.headline).toLowerCase().replace(/[\s\p{P}]/gu,'')===headline;
        if(same)['description','articleBody'].forEach(function(k){if(typeof value[k]!=='string')return;var text=lead(value[k],title);if(text.length>best.length)best=text;});
      }
      if(value['@graph'])visit(value['@graph'],depth+1);
      if(value.mainEntity)visit(value.mainEntity,depth+1);
    }
    var scripts=String(html||'').slice(0,700000).match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script\s*>/gi)||[];
    scripts.slice(0,12).forEach(function(script){var json=script.replace(/^<script\b[^>]*>/i,'').replace(/<\/script\s*>$/i,'');if(json.length>150000)return;try{visit(JSON.parse(json),0);}catch(ignored){}});
    return best;
  }
  function meta(html,base,title){
    var head=String(html||'').split(/<\/head\s*>/i)[0].slice(0,500000),values={};
    (head.match(/<meta\b[^>]{0,5000}>/gi)||[]).forEach(function(tag){var a={},m,re=/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;while((m=re.exec(tag)))a[m[1].toLowerCase()]=TDCore.clean(m[2]===undefined?m[3]:m[2]);var key=(a.property||a.name||'').toLowerCase();if(key&&a.content)values[key]=a.content;});
    var canonical=values['og:url'];
    if(canonical&&TDCore.canonical(canonical).replace(/\/$/,'')!==TDCore.canonical(base).replace(/\/$/,''))return '';
    if(/^(?:website|profile)$/i.test(values['og:type']||''))return '';
    var description=lead(values['og:description']||values.description||values['twitter:description'],title),article=structured(html,base,title);
    return article.length>description.length?article:description;
  }
  return {lead:lead,feed:feed,nodeContent:nodeContent,meta:meta};
})();
