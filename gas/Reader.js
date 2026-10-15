/* Short publisher leads, without unrelated headlines or page scripts. */
var TDReader=(function(){
  function lead(html,title){
    var text=String(html||'').slice(0,150000).replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').replace(/<\/(?:p|div|li|h[1-6])\s*>|<br\s*\/?>/gi,'\n');
    text=text.replace(/\s*The post[\s\S]*$/i,'');
    var headline=TDCore.clean(title),parts=text.split(/\n+/).map(function(p){return TDCore.clean(p);}).filter(function(p){return p.length>20&&p!==headline&&!/^(?:อ่านต่อ|อ่านเพิ่มเติม|ติดตาม|แชร์|Advertisement|Read more|Subscribe|Sign up)/i.test(p);});
    text=parts.join('\n\n').trim();
    if(text.length<=1200)return text;
    var cut=text.slice(0,1200),boundary=Math.max(cut.lastIndexOf('\n'),cut.lastIndexOf('. '),cut.lastIndexOf('。'));
    if(boundary>650)return cut.slice(0,boundary+1).trim();
    return cut.replace(/\s+\S*$/,'').trim()+'…';
  }
  function feed(description,encoded,title){var a=lead(description,title),b=lead(encoded,title);return b.length>a.length?b:a;}
  function meta(html,base,title){
    var head=String(html||'').split(/<\/head\s*>/i)[0].slice(0,500000),values={};
    (head.match(/<meta\b[^>]{0,5000}>/gi)||[]).forEach(function(tag){var a={},m,re=/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;while((m=re.exec(tag)))a[m[1].toLowerCase()]=TDCore.clean(m[2]===undefined?m[3]:m[2]);var key=(a.property||a.name||'').toLowerCase();if(key&&a.content)values[key]=a.content;});
    var canonical=values['og:url'];
    if(canonical&&TDCore.canonical(canonical).replace(/\/$/,'')!==TDCore.canonical(base).replace(/\/$/,''))return '';
    if(/^(?:website|profile)$/i.test(values['og:type']||''))return '';
    return lead(values['og:description']||values.description||values['twitter:description'],title);
  }
  return {lead:lead,feed:feed,meta:meta};
})();
