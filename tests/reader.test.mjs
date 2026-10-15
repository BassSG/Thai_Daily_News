import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const ctx=vm.createContext({Date,Math,Number,String,Object,Array});vm.runInContext(fs.readFileSync('gas/Core.js','utf8')+'\n'+fs.readFileSync('gas/Reader.js','utf8'),ctx);const {TDReader:reader,TDCore:core}=ctx;
test('reader keeps longer encoded content and paragraphs beyond 200 characters',()=>{
 const first='หน่วยงานประกาศมาตรการช่วยเหลือประชาชนในพื้นที่น้ำท่วม โดยเปิดศูนย์ประสานงานเพื่อรับเรื่องจากผู้ได้รับผลกระทบ '.repeat(3),second='ประชาชนสามารถแจ้งเหตุได้ตลอด 24 ชั่วโมง และเจ้าหน้าที่จะตรวจสอบพื้นที่ก่อนจัดส่งความช่วยเหลือ';
 const result=reader.feed('ข้อความย่อสั้น ๆ จากสำนักข่าว',`<p>${first}</p><p>${second}</p><p>The post Story appeared first on Publisher.</p>`,'ข่าวน้ำท่วม');assert.ok(result.includes(second));assert.ok(result.includes('\n\n'));assert.ok(result.length>200);assert.ok(!result.includes('The post'));
});
test('reader removes scripts, repeated titles and promotions and bounds content',()=>{
 const result=reader.lead('<h1>หัวข้อข่าวที่ยาวพอจะเป็นพาดหัว</h1><script>alert("fake facts")</script><p>เนื้อหาข่าวจากสำนักข่าวที่มีข้อมูลจริงอยู่ในย่อหน้าแรก</p><p>อ่านเพิ่มเติมได้ที่เว็บไซต์ของเรา</p>','หัวข้อข่าวที่ยาวพอจะเป็นพาดหัว');assert.equal(result,'เนื้อหาข่าวจากสำนักข่าวที่มีข้อมูลจริงอยู่ในย่อหน้าแรก');assert.ok(reader.lead('รายละเอียดจากต้นฉบับ '.repeat(500),'').length<=1201);
});
test('metadata rejects other articles and homepage redirects',()=>{
 const url='https://publisher.example/news/1',description='เจ้าหน้าที่ประกาศเปิดศูนย์ช่วยเหลือประชาชนในพื้นที่ประสบอุทกภัย',html=`<head><meta property="og:url" content="${url}"><meta property="og:type" content="article"><meta property="og:description" content="${description}"></head>`;assert.equal(reader.meta(html,url,''),description);assert.equal(reader.meta(html,'https://publisher.example/news/2',''),'');assert.equal(reader.meta(html.replace('content="article"','content="website"'),url,''),'');
});
test('refresh preserves richer text and summary hashes follow source facts',()=>{
 const now=Date.now(),source={id:'infoquest',name:'InfoQuest',home:'https://www.infoquest.co.th',category:'general'},a=core.normalize({title:'รัฐบาลประกาศมาตรการช่วยเหลือประชาชน',url:'https://www.infoquest.co.th/news/1',published:new Date(now).toISOString(),excerpt:'รายละเอียดจากสำนักข่าวที่มีมากกว่าพาดหัว'},source,now);a.reading_text='เนื้อหาย่อหน้าที่หนึ่งจากสำนักข่าวซึ่งมีข้อเท็จจริงเพิ่มเติม';a.metadata_checked_at=new Date(now).toISOString();
 const first=core.merge([],[a],now)[0],second=core.merge([first],[{...a,reading_text:''}],now)[0];assert.equal(second.reading_text,first.reading_text);assert.equal(second.content_hash,first.content_hash);
 const changed=core.merge([first],[{...a,reading_text:a.reading_text+' และมีการประกาศพื้นที่เพิ่มเติมในวันนี้'}],now)[0];assert.notEqual(changed.content_hash,first.content_hash);
 const corrected=core.merge([changed],[{...a,reading_text:'สำนักข่าวแก้ไขรายละเอียดให้สั้นลง'}],now)[0];assert.equal(corrected.reading_text,'สำนักข่าวแก้ไขรายละเอียดให้สั้นลง');
 const google=core.merge([],[{...a,adapter:'google-th',reading_text:'พาดหัวข่าวคนละข่าวจากรายการ Google'}],now)[0];assert.equal(google.reading_text,'');
});
test('a Google refresh cannot replace the same publisher story with a headline-only record',()=>{
 const now=Date.now(),item={id:'story',title:'รัฐบาลประกาศมาตรการช่วยเหลือประชาชน',url:'https://publisher.example/news/1',host:'publisher.example',published_at:new Date(now).toISOString(),adapter:'infoquest',excerpt:'เนื้อหาจริงจากสำนักข่าว',reading_text:'เนื้อหาย่อหน้าที่อ่านแล้วเข้าใจเหตุการณ์ได้จากสำนักข่าว',category_id:'politics'};
 const google={...item,adapter:'google-politics',url:'https://news.google.com/rss/articles/1',excerpt:'พาดหัวอื่น',reading_text:''},result=core.merge([item],[google],now)[0];assert.equal(result.url,item.url);assert.equal(result.adapter,item.adapter);assert.equal(result.reading_text,item.reading_text);assert.equal(result.excerpt,item.excerpt);
});
