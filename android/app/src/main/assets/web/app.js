/* Thai Daily News — one reading experience for desktop, Android and GAS. */
(() => {
  'use strict';
  const C=window.TDN_CONFIG, native=!!window.NativeNews, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const categories=[{id:'politics',label:'การเมือง',icon:'landmark',color:'#b49bd9'},{id:'society',label:'สังคม',icon:'people',color:'#79bca9'},{id:'crime',label:'อาชญากรรม',icon:'shield',color:'#dc9292'},{id:'economy',label:'เศรษฐกิจ',icon:'chart',color:'#d9bc7b'},{id:'world',label:'ต่างประเทศ',icon:'globe',color:'#8caee2'},{id:'tech',label:'เทคโนโลยี',icon:'sparkles',color:'#96a4ee'}];
  const paths={home:'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',clock:'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',bookmark:'M6 3h12v18l-6-4-6 4z',trending:'m3 16 6-6 4 4 8-10M15 4h6v6',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3z',search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',moon:'M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',refresh:'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M18 18a8 8 0 0 1-14-6',arrow:'M4 12h16m-6-6 6 6-6 6','arrow-down':'M12 4v16m-6-6 6 6 6-6',close:'m6 6 12 12M6 18 18 6',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',landmark:'m3 9 9-6 9 6H3m2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',people:'M16 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0M17 4a4 4 0 0 1 0 8m4 9v-3a4 4 0 0 0-3-4',shield:'M12 3 3 6v6c0 5 9 9 9 9s9-4 9-9V6zM9 12l2 2 4-4',chart:'M4 3v18h17M8 16v-4m5 4V7m5 9v-6',sparkles:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3zM21 2v4m-2-2h4',widget:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',palette:'M12 3a9 9 0 1 0 0 18c3 0 3-3 1-4-2-1-1-3 1-3h4c4 0 3-11-6-11M7 9h.01M11 6h.01M16 8h.01M6 14h.01',android:'M5 8h14v11H5zM7 8a5 5 0 0 1 10 0M8 3 6 1m10 2 2-2M8 19v3m8-3v3M2 10v7m20-7v7',share:'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M9 10l6-4M9 14l6 4',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',check:'m4 12 5 5L20 6',newspaper:'M4 3h16v18H4zM7 7h10M7 11h4v4H7zM14 11h3m-3 4h3M7 18h10',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'};
  const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.newspaper}"></path></svg>`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=s=>/^https?:\/\//i.test(String(s||''))?String(s):'#';
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f;}catch{return f;}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{/* Reading remains available when storage is full. */}};
  let preferences=load('tdn.preferences',{categories:[],importantOnly:false,quietHours:true,timezoneOffset:new Date().getTimezoneOffset(),enabled:false});
  if(native){try{preferences={...preferences,...JSON.parse(NativeNews.getSettings())};}catch{}}
  const state={snapshot:null,view:'today',category:'all',query:'',limit:25,saved:load('tdn.saved',{}),read:new Set(load('tdn.read',[])),selected:null,pending:null,refreshing:false};
  let toastTimer,refreshTimer,installPrompt,swRegistration,bridgeReady,bridgeWindow,bridgeOrigin,bridgeToken,bridgePromise;
  const requests=new Map();
  const views=[{id:'today',label:'ภาพรวมวันนี้',short:'วันนี้',icon:'home'},{id:'latest',label:'ข่าวล่าสุด',short:'ล่าสุด',icon:'clock'},{id:'important',label:'ข่าวสำคัญ',short:'สำคัญ',icon:'trending'},{id:'saved',label:'บันทึกไว้',short:'บันทึก',icon:'bookmark'}];
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
  function paintIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
  function shortTime(date){const ms=Date.now()-Date.parse(date);if(!Number.isFinite(ms))return 'ไม่ทราบเวลา';if(ms<60000)return 'เมื่อสักครู่';if(ms<3600000)return `${Math.floor(ms/60000)} นาทีที่แล้ว`;if(ms<86400000)return `${Math.floor(ms/3600000)} ชม. ที่แล้ว`;return new Date(date).toLocaleDateString('th-TH',{day:'numeric',month:'short'});}
  function fullTime(date){return date?new Date(date).toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'ยังไม่มีเวลาอัปเดต';}
  function categoryOf(item){return categories.find(c=>c.id===item.category_id)||categories[1];}
  function titleOf(item){return item.title_th||item.title||item.title_raw||'';}
  function meta(item){return `<div class="story-meta"><span class="source-name">${esc(item.source||item.host||'สำนักข่าว')}</span><i class="meta-dot"></i><time datetime="${esc(item.published_at)}">${esc(shortTime(item.published_at))}</time>${item.language==='en'?'<span class="language-tag">EN</span>':''}</div>`;}
  function renderNavigation(){
    $('#desktopNav').innerHTML=views.map(v=>`<button class="nav-item ${state.view===v.id?'active':''}" data-view="${v.id}">${icon(v.icon)}${v.label}${v.id==='saved'?`<span class="nav-count">${Object.keys(state.saved).length}</span>`:''}</button>`).join('');
    $('#categoryNav').innerHTML=categories.map(c=>`<button class="nav-item ${state.category===c.id?'active':''}" data-category="${c.id}"><i class="category-dot" style="background:${c.color}"></i>${c.label}</button>`).join('');
    $('#bottomNav').innerHTML=views.map(v=>`<button data-view="${v.id}" class="${state.view===v.id?'active':''}">${icon(v.icon)}<span>${v.short}</span></button>`).join('')+`<button data-action="settings">${icon('settings')}<span>ตั้งค่า</span></button>`;
    $('#categoryChips').innerHTML=[{id:'all',label:'ทั้งหมด',icon:'newspaper'},...categories].map(c=>`<button class="category-chip ${state.category===c.id?'active':''}" data-category="${c.id}" aria-pressed="${state.category===c.id}">${icon(c.icon)}${c.label}</button>`).join('');
  }
  function listItems(){
    let items=state.view==='saved'?Object.values(state.saved):(state.snapshot?.items||[]).slice();
    const hours=Number($('#timeFilter').value),q=state.query.toLowerCase();
    items=items.filter(it=>(state.view==='saved'||Date.now()-Date.parse(it.published_at)<hours*3600000)&&(state.category==='all'||it.category_id===state.category)&&(!q||(titleOf(it)+' '+it.excerpt+' '+it.source+' '+it.category).toLowerCase().includes(q)));
    return items.sort(state.view==='important'?(a,b)=>b.score-a.score:(a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at));
  }
  function render(){
    renderNavigation();
    const titles={today:['วันนี้ มีอะไรสำคัญ','ข่าวไทยและรอบโลก คัดมาให้คุณติดตามในที่เดียว'],latest:['ติดตามเรื่องราวล่าสุด','เรียงตามเวลาที่สำนักข่าวเผยแพร่ ให้คุณตามเรื่องใหม่ได้ทัน'],important:['เรื่องสำคัญ ที่ควรรู้','ประเด็นที่น่าจับตา จากข่าวในไทยและต่างประเทศ'],saved:['เก็บไว้ อ่านในจังหวะของคุณ','ข่าวที่คุณสนใจ พร้อมกลับมาอ่านต่อได้ทุกเมื่อ']};
    $('#pageTitle').textContent=titles[state.view][0];$('#pageSubtitle').textContent=titles[state.view][1];
    const items=listItems(),filtered=state.category!=='all'||state.query,showHero=state.view==='today'&&!filtered&&items.length;
    const hero=showHero?(items.find(it=>(state.snapshot?.topIds||[])[0]===it.id)||items[0]):null;
    $('#heroContainer').innerHTML=hero?`<article class="hero-card" tabindex="0" role="button" data-open="${hero.id}" aria-label="อ่านข่าว ${esc(titleOf(hero))}"><div><div class="hero-kicker">${icon('sparkles')}THE DAILY FOCUS <span>· ${esc(categoryOf(hero).label)}</span></div><h2>${esc(titleOf(hero))}</h2>${hero.excerpt?`<p>${esc(hero.excerpt)}</p>`:''}</div><div class="hero-bottom">${meta(hero)}<span class="read-circle">${icon('arrow')}</span></div></article>`:'';
    const rest=hero?items.filter(it=>it.id!==hero.id):items,shown=rest.slice(0,state.limit);
    $('#newsCount').textContent=`${items.length.toLocaleString('th-TH')} ข่าว${state.view==='saved'?'ที่บันทึกไว้':''}`;
    $('#feed').setAttribute('aria-busy','false');
    $('#feed').innerHTML=shown.length?`<div class="section-heading"><h2>${state.query?'ผลการค้นหา':state.view==='saved'?'ข่าวที่บันทึกไว้':state.view==='important'?'ประเด็นที่น่าติดตาม':'อ่านต่อรอบวัน'}</h2><span>${state.view==='important'?'คัดจากความใหม่และประเด็นสำคัญ':'อัปเดตต่อเนื่องจากหลายสำนัก'}</span></div>`+shown.map(it=>{const c=categoryOf(it);return `<article class="news-card"><button class="story-open" data-open="${it.id}"><span class="category-label" style="--category:${c.color}">${c.label}</span><h3>${esc(titleOf(it))}</h3>${it.excerpt?`<p class="excerpt">${esc(it.excerpt)}</p>`:''}${meta(it)}</button><button class="icon-button bookmark-button ${state.saved[it.id]?'saved':''}" data-save="${it.id}" aria-label="${state.saved[it.id]?'นำออกจาก':'เพิ่มใน'}ข่าวที่บันทึกไว้" aria-pressed="${!!state.saved[it.id]}">${icon('bookmark')}</button></article>`;}).join(''):`<div class="empty-state">${icon(state.view==='saved'?'bookmark':'search')}<h3>${state.view==='saved'?'เรื่องที่อยากอ่าน เก็บไว้ตรงนี้':'ยังไม่พบข่าวในช่วงนี้'}</h3><p>${state.view==='saved'?'แตะไอคอนบันทึกที่ข่าว แล้วกลับมาอ่านต่อได้ทุกเมื่อ':state.snapshot?.items?.length?'ลองเปลี่ยนหมวด ช่วงเวลา หรือคำค้นหา':'กำลังเตรียมข่าวล่าสุด หากยังไม่มีข้อมูลให้แตะอัปเดตอีกครั้ง'}</p></div>`;
    $('#loadMore').hidden=rest.length<=state.limit;
    const top=(state.snapshot?.topIds||[]).map(id=>(state.snapshot?.items||[]).find(it=>it.id===id)).filter(Boolean).slice(0,5);
    $('#topStories').innerHTML=top.length?top.map((it,i)=>`<button class="top-story" data-open="${it.id}"><span class="ordinal">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(titleOf(it))}</h3><span>${esc(it.source)} · ${esc(shortTime(it.published_at))}</span></div></button>`).join(''):'<p class="muted">กำลังเตรียมประเด็นล่าสุด</p>';
    renderFreshness();renderSources();
  }
  function renderFreshness(offline=false){
    const at=state.snapshot?.updatedAt,stale=!at||Date.now()-Date.parse(at)>25*60000||offline;
    $('#freshness').classList.toggle('stale',stale);
    $('#freshness').innerHTML=`<i></i>${offline?'กำลังอ่านข่าวที่บันทึกไว้':at?`${stale?'ข้อมูลอาจล่าช้า · ':''}อัปเดต ${esc(fullTime(at))}`:'กำลังเตรียมข่าวครั้งแรก'}`;
  }
  function renderSources(){
    $('#sourceHealth').innerHTML=(state.snapshot?.health||[]).map(h=>`<div class="source-health-row"><span>${esc(h.name)}</span><span class="${h.status==='ok'?'healthy':''}">${h.status==='ok'?'พร้อมอ่าน':h.status==='empty'?'ยังไม่มีข่าวใหม่':'กำลังรอการอัปเดต'}${h.lastSuccessAt?' · '+esc(shortTime(h.lastSuccessAt)):''}</span></div>`).join('')||'<p class="setting-hint">กำลังรอสถานะแหล่งข่าว</p>';
  }
  function setView(view){state.view=view;state.limit=25;render();window.scrollTo({top:0,behavior:'smooth'});}
  function getItem(id){return state.snapshot?.items?.find(it=>it.id===id)||state.saved[id];}
  function saveStory(id){const it=getItem(id);if(!it)return;if(state.saved[id]){delete state.saved[id];toast('นำออกจากข่าวที่บันทึกไว้แล้ว');}else{if(Object.keys(state.saved).length>=150){toast('บันทึกได้สูงสุด 150 ข่าว กรุณานำข่าวเดิมออกก่อน');return;}state.saved[id]={...it};toast('บันทึกข่าวไว้ให้อ่านต่อแล้ว');}save('tdn.saved',state.saved);if(native)NativeNews.saveBookmarks(JSON.stringify(Object.values(state.saved)));render();if(state.selected===id)renderArticle(it);}
  function openArticle(id){const it=getItem(id);if(!it){state.pending=id;return;}state.pending=null;state.selected=id;state.read.add(id);save('tdn.read',[...state.read].slice(-500));renderArticle(it);$('#drawerBackdrop').hidden=false;$('#articleDrawer').hidden=false;document.body.style.overflow='hidden';$('#articleDrawer').scrollTop=0;$('#closeArticle').focus();}
  function closeArticle(){state.selected=null;$('#drawerBackdrop').hidden=true;$('#articleDrawer').hidden=true;document.body.style.overflow='';}
  function renderArticle(it){const c=categoryOf(it),summary=load('tdn.summary.'+it.id,null);$('#articleContent').innerHTML=`<span class="category-label" style="--category:${c.color}">${c.label}</span><h2>${esc(titleOf(it))}</h2>${meta(it)}<div class="article-actions"><button data-save="${it.id}">${icon(state.saved[it.id]?'check':'bookmark')}${state.saved[it.id]?'บันทึกแล้ว':'บันทึกไว้อ่าน'}</button><button data-share="${it.id}">${icon('share')}แชร์ข่าว</button></div><p class="article-excerpt">${esc(it.excerpt||'สำนักข่าวเผยแพร่หัวข้อข่าวนี้ไว้ในฟีด คุณสามารถเปิดอ่านรายละเอียดทั้งหมดจากต้นฉบับได้ด้านล่าง')}</p><div class="excerpt-note">ข้อความส่วนนี้มาจากหัวข้อและข้อความย่อที่สำนักข่าวเผยแพร่ รายละเอียดล่าสุดและเนื้อหาเต็มอยู่ที่ต้นฉบับ</div><section class="ai-panel"><h3>${icon('sparkles')}อ่านให้เข้าใจ ในเวลาไม่นาน</h3><p>สรุปภาษาไทยจากหัวข้อและข้อความย่อที่มีอยู่ พร้อมเก็บผลไว้อ่านซ้ำ</p><div id="aiResult" class="ai-result">${summary?.hash===it.content_hash?esc(summary.text):''}</div><button class="secondary-button wide" id="summarizeButton" data-summary="${it.id}" ${summary?.hash===it.content_hash?'hidden':''}>${icon('sparkles')}ช่วยแปลและสรุปข่าวนี้</button></section><a class="primary-button wide original-button" href="${esc(safeUrl(it.url))}" target="_blank" rel="noopener noreferrer" data-external="${esc(safeUrl(it.url))}">อ่านฉบับเต็มจากต้นฉบับ ${icon('external')}</a><span class="original-label">${esc(it.source)} · เผยแพร่ ${esc(fullTime(it.published_at))}</span>`;}
  function requestId(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}
  function nativeRequest(action,payload={}){return new Promise((resolve,reject)=>{const id=requestId(),timer=setTimeout(()=>{requests.delete(id);reject(new Error('การเชื่อมต่อใช้เวลานาน กรุณาลองอีกครั้ง'));},45000);requests.set(id,{resolve,reject,timer});NativeNews.request(id,JSON.stringify({action,...payload}));});}
  addEventListener('tdn-native-result',e=>{const item=requests.get(e.detail.requestId);if(!item)return;clearTimeout(item.timer);requests.delete(e.detail.requestId);item.resolve(e.detail.result);});
  function jsonp(action,params={}){return new Promise((resolve,reject)=>{const callback='tdn_'+requestId(),script=document.createElement('script'),timer=setTimeout(()=>finish(new Error('เชื่อมต่อข่าวยังไม่สำเร็จ')),25000);function finish(error,data){clearTimeout(timer);delete window[callback];script.remove();error?reject(error):resolve(data);}window[callback]=data=>finish(null,data);script.onerror=()=>finish(new Error('ยังเชื่อมต่อไม่ได้'));script.src=C.api+'?'+new URLSearchParams({action,...params,callback,_:Math.floor(Date.now()/60000)});document.head.appendChild(script);});}
  function initBridge(){if(bridgePromise)return bridgePromise;bridgeToken=crypto.randomUUID().replace(/-/g,'');bridgePromise=new Promise((resolve,reject)=>{bridgeReady=resolve;const frame=document.createElement('iframe');frame.hidden=true;frame.title='เชื่อมต่อบริการข่าว';frame.src=C.api+'?bridge=1&token='+bridgeToken;document.body.appendChild(frame);setTimeout(()=>{if(!bridgeWindow){bridgePromise=null;frame.remove();reject(new Error('ยังเชื่อมต่อบริการไม่ได้ กรุณาลองอีกครั้ง'));}},30000);});return bridgePromise;}
  addEventListener('message',event=>{const data=event.data;if(!data||data.channel!=='tdn-bridge-v2'||data.token!==bridgeToken||!/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i.test(event.origin))return;if(data.ready){bridgeWindow=event.source;bridgeOrigin=event.origin;bridgeReady?.();return;}const item=requests.get(data.requestId);if(item){clearTimeout(item.timer);requests.delete(data.requestId);item.resolve(data.result);}});
  async function command(payload){
    if(native)return nativeRequest(payload.action,payload);
    if(window.google?.script?.run)return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).apiCommand(payload));
    await initBridge();return new Promise((resolve,reject)=>{const id=requestId(),timer=setTimeout(()=>{requests.delete(id);reject(new Error('บริการยังไม่ตอบกลับ กรุณาลองอีกครั้ง'));},45000);requests.set(id,{resolve,reject,timer});bridgeWindow.postMessage({channel:'tdn-bridge-v2',token:bridgeToken,requestId:id,payload},bridgeOrigin);});
  }
  async function readSnapshot(){if(native)return nativeRequest('snapshot');if(window.google?.script?.run)return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).apiGetSnapshot());return jsonp('snapshot');}
  async function refresh(silent=false){
    if(state.refreshing)return;state.refreshing=true;$('#refreshButton').classList.add('loading');$('#refreshButton').disabled=true;
    try{const data=await readSnapshot();if(!data.ok||!data.snapshot)throw new Error(data.error||'ยังไม่มีข้อมูลข่าว');if(!Array.isArray(data.snapshot.items))throw new Error('ข้อมูลข่าวไม่สมบูรณ์');state.snapshot=data.snapshot;save('tdn.snapshot',state.snapshot);render();if(state.pending)openArticle(state.pending);if(!silent)toast(data.snapshot.items.length?'อัปเดตรายการข่าวแล้ว':'กำลังรวบรวมข่าวครั้งแรก กรุณารอสักครู่');}
    catch(error){if(!state.snapshot)render();renderFreshness(true);if(!silent)toast(error.message||'ยังเชื่อมต่อไม่ได้ ข่าวที่บันทึกไว้ยังอ่านได้');}
    finally{state.refreshing=false;$('#refreshButton').classList.remove('loading');$('#refreshButton').disabled=false;}
  }
  async function summarize(id){const button=$('#summarizeButton');if(!button)return;button.disabled=true;button.innerHTML=icon('refresh')+' กำลังเตรียมสรุป';try{const res=await command({action:'summary',id});if(!res.ok)throw new Error(res.error);save('tdn.summary.'+id,{hash:getItem(id).content_hash,text:res.summary});if(state.selected===id){$('#aiResult').textContent=res.summary;button.hidden=true;}}catch(error){toast(error.message||'ยังสรุปไม่ได้ ลองอีกครั้งภายหลัง');}finally{button.disabled=false;button.innerHTML=icon('sparkles')+' ช่วยแปลและสรุปข่าวนี้';}}
  function updateSettings(){
    $('#importantOnly').checked=!!preferences.importantOnly;$('#quietHours').checked=preferences.quietHours!==false;
    $('#notifyDot').hidden=!preferences.enabled;
    $('#enableNotifications').textContent=preferences.enabled?'เปิดการแจ้งเตือนแล้ว':'เปิดการแจ้งเตือน';
    $('#notificationStatus').textContent=preferences.enabled?(native?'แจ้งเตือนตามหมวดที่เลือก ระบบ Android จัดรอบตรวจเบื้องหลังให้':'พร้อมรับข่าวใหม่ แม้ไม่ได้เปิดหน้าข่าวไว้'):'คุณเลือกเปิดหรือปิดได้ทุกเมื่อ';
    $('#notifyCategories').innerHTML=`<button class="preference-chip ${!preferences.categories.length?'selected':''}" data-notify-category="all">ทุกหมวด</button>`+categories.map(c=>`<button class="preference-chip ${preferences.categories.includes(c.id)?'selected':''}" data-notify-category="${c.id}">${c.label}</button>`).join('');
    $$('[data-theme-choice]').forEach(el=>el.classList.toggle('active',el.dataset.themeChoice===document.documentElement.dataset.theme));
    if(native){$('#installButton').hidden=true;$('#installDescription').textContent='คุณกำลังใช้แอป Android พร้อมการแจ้งเตือนและวิดเจ็ต แตะขนาดวิดเจ็ตด้านบนเพื่อเพิ่มบนหน้าจอหลัก';$('#apkDownload').hidden=true;$('#desktopInstall').hidden=true;}
  }
  let settingsTimer;
  function persistPreferences(){preferences.timezoneOffset=new Date().getTimezoneOffset();save('tdn.preferences',preferences);updateSettings();if(native){NativeNews.setSettings(JSON.stringify(preferences));return;}swRegistration?.active?.postMessage({type:'preferences',preferences});clearTimeout(settingsTimer);if(preferences.enabled)settingsTimer=setTimeout(()=>registerPush(false).catch(error=>toast(error.message)),1200);}
  function showSettings(){updateSettings();$('#settingsDialog').showModal();renderSources();}
  function setTheme(theme){document.documentElement.dataset.theme=theme;save('tdn.theme',theme);$('#themeButton').innerHTML=icon(theme==='dark'?'sun':'moon');updateSettings();if(native)NativeNews.setTheme(theme);}
  async function prepareSW(){if(native||!('serviceWorker'in navigator)||location.hostname.includes('googleusercontent'))return null;try{swRegistration=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});return await navigator.serviceWorker.ready;}catch{return null;}}
  function vapidBytes(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));}
  async function registerPush(ask=true){
    const registration=swRegistration||await prepareSW();if(!registration||!('PushManager'in window))throw new Error('อุปกรณ์นี้ยังไม่รองรับการแจ้งเตือนเว็บ ลองติดตั้งแอป Android');
    if(ask&&await Notification.requestPermission()!=='granted')throw new Error('ยังไม่ได้อนุญาตการแจ้งเตือน สามารถเปิดได้ในการตั้งค่าของเบราว์เซอร์');
    if(Notification.permission!=='granted')throw new Error('กรุณาอนุญาตการแจ้งเตือนก่อน');
    const config=await jsonp('config');if(!config.vapidPublic)throw new Error('บริการแจ้งเตือนกำลังเตรียมพร้อม ลองใหม่อีกครั้ง');
    let sub=await registration.pushManager.getSubscription(),created=false;
    if(!sub){sub=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:vapidBytes(config.vapidPublic)});created=true;}
    let proof=load('tdn.push-proof',null);if(!proof){proof=crypto.randomUUID().replace(/-/g,'');save('tdn.push-proof',proof);}
    const result=await command({action:'subscribe',subscription:sub.toJSON(),proof,preferences});
    if(!result.ok){if(created)await sub.unsubscribe();throw new Error(result.error||'ยังเปิดการแจ้งเตือนไม่สำเร็จ');}
    save('tdn.push-id',result.id);preferences.enabled=true;save('tdn.preferences',preferences);registration.active?.postMessage({type:'preferences',preferences});updateSettings();
  }
  async function enableNotifications(){if(native){NativeNews.enableNotifications();return;}const button=$('#enableNotifications');button.disabled=true;try{await registerPush(true);toast('เปิดการแจ้งเตือนข่าวใหม่แล้ว');}catch(error){toast(error.message);}finally{button.disabled=false;}}
  async function disableNotifications(){if(native){preferences.enabled=false;persistPreferences();toast('ปิดการแจ้งเตือนแล้ว');return;}try{const id=load('tdn.push-id',''),proof=load('tdn.push-proof','');if(id)await command({action:'unsubscribe',id,proof});const sub=await swRegistration?.pushManager.getSubscription();if(sub)await sub.unsubscribe();preferences.enabled=false;persistPreferences();toast('ปิดการแจ้งเตือนแล้ว');}catch{toast('ยังปิดการแจ้งเตือนไม่สำเร็จ กรุณาลองอีกครั้ง');}}
  async function testNotification(){if(native){NativeNews.testNotification();return;}if(Notification.permission!=='granted'){toast('เปิดการแจ้งเตือนก่อน แล้วลองทดสอบอีกครั้ง');return;}const registration=swRegistration||await prepareSW();if(registration)await registration.showNotification('Thai Daily News',{body:'พร้อมแล้ว ข่าวสำคัญจะมาหาคุณในจังหวะที่เหมาะสม',icon:'assets/icon-192.png',badge:'assets/badge-96.png',tag:'tdn-test',data:{url:C.web}});}
  function showInstall(){if(native){showSettings();return;}$('#installInstructions').textContent=installPrompt?'ติดตั้ง Thai Daily News เพื่อเปิดอ่านในหน้าต่างแอป แยกจากแท็บเบราว์เซอร์ได้สะดวก':'บน Chrome หรือ Edge เปิดเมนู ⋮ แล้วเลือก “ติดตั้ง Thai Daily News” หรือ “แอป → ติดตั้งเว็บไซต์นี้เป็นแอป” หากใช้ Android และต้องการวิดเจ็ต ให้ติดตั้งไฟล์ APK ด้านล่าง';$('#installNow').hidden=!installPrompt;$('#installDialog').showModal();}
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  addEventListener('appinstalled',()=>{installPrompt=null;$('#installDialog').close();toast('ติดตั้ง Thai Daily News แล้ว');});
  addEventListener('tdn-notification-permission',event=>{preferences.enabled=!!event.detail.granted;persistPreferences();toast(preferences.enabled?'เปิดการแจ้งเตือนข่าวใหม่แล้ว':'ยังไม่ได้อนุญาตการแจ้งเตือน');});
  addEventListener('tdn-open-article',event=>openArticle(event.detail.id));
  addEventListener('tdn-toast',event=>toast(event.detail.message));
  document.addEventListener('click',async event=>{
    const el=event.target.closest('button,a,[data-open]');if(!el)return;
    if(el.dataset.view){setView(el.dataset.view);return;}
    if(el.dataset.category){state.category=el.dataset.category;state.limit=25;render();return;}
    if(el.dataset.open){openArticle(el.dataset.open);return;}
    if(el.dataset.save){saveStory(el.dataset.save);return;}
    if(el.dataset.summary){summarize(el.dataset.summary);return;}
    if(el.dataset.share){const it=getItem(el.dataset.share);try{if(native)NativeNews.share(titleOf(it),it.url);else if(navigator.share)await navigator.share({title:titleOf(it),url:it.url});else{await navigator.clipboard.writeText(it.url);toast('คัดลอกลิงก์ข่าวแล้ว');}}catch{}return;}
    if(el.dataset.action==='settings'){showSettings();return;}
    if(el.hasAttribute('data-close-dialog')){el.closest('dialog').close();return;}
    if(el.dataset.themeChoice){setTheme(el.dataset.themeChoice);return;}
    if(el.dataset.notifyCategory){const cat=el.dataset.notifyCategory;if(cat==='all')preferences.categories=[];else if(preferences.categories.includes(cat)){if(preferences.categories.length===1){toast('เลือกอย่างน้อยหนึ่งหมวด หรือเลือกทุกหมวด');return;}preferences.categories=preferences.categories.filter(c=>c!==cat);}else preferences.categories=[...preferences.categories,cat];persistPreferences();return;}
    if(el.dataset.widget){if(native)NativeNews.pinWidget(el.dataset.widget);else{toast('วิดเจ็ตใช้ได้ในแอป Android ดาวน์โหลด APK ในหน้านี้ได้เลย');$('#apkDownload').scrollIntoView({behavior:'smooth',block:'center'});}return;}
    if(el.dataset.external&&native){event.preventDefault();NativeNews.openExternal(el.dataset.external);return;}
    if(el.tagName==='A'&&native&&/^https?:/.test(el.href)){event.preventDefault();NativeNews.openExternal(el.href);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeArticle();if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();$('#searchInput').focus();}if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-open][role=button]')){event.preventDefault();openArticle(event.target.dataset.open);}if(event.key==='Tab'&&!$('#articleDrawer').hidden){const focusable=$$('#articleDrawer button:not([hidden]), #articleDrawer a'),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  $('#refreshButton').addEventListener('click',()=>refresh());$('#loadMore').addEventListener('click',()=>{state.limit+=25;render();});
  $('#searchInput').addEventListener('input',event=>{state.query=event.target.value.trim();state.limit=25;render();});$('#timeFilter').addEventListener('change',()=>{state.limit=25;render();});
  $('#closeArticle').addEventListener('click',closeArticle);$('#drawerBackdrop').addEventListener('click',closeArticle);
  $('#themeButton').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  $('#enableNotifications').addEventListener('click',enableNotifications);$('#disableNotifications').addEventListener('click',disableNotifications);$('#testNotification').addEventListener('click',testNotification);
  $('#importantOnly').addEventListener('change',event=>{preferences.importantOnly=event.target.checked;persistPreferences();});$('#quietHours').addEventListener('change',event=>{preferences.quietHours=event.target.checked;persistPreferences();});
  $('#installButton').addEventListener('click',showInstall);$('#desktopInstall').addEventListener('click',()=>{$('#settingsDialog').close();showInstall();});$('#installNow').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}});
  $('#sourcesButton').addEventListener('click',()=>{showSettings();$('.source-settings').scrollIntoView({behavior:'smooth'});});
  $$('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
  window.TDN_BACK=()=>{const dialog=$$('dialog').find(d=>d.open);if(dialog){dialog.close();return true;}if(state.selected){closeArticle();return true;}if(state.view!=='today'||state.category!=='all'||state.query){state.category='all';state.query='';$('#searchInput').value='';setView('today');return true;}return false;};
  $('#editionDate').textContent=new Date().toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  paintIcons();setTheme(load('tdn.theme','dark'));renderNavigation();updateSettings();
  try{state.snapshot=native?JSON.parse(NativeNews.getCachedSnapshot()):load('tdn.snapshot',null);if(state.snapshot?.items)render();else state.snapshot=null;}catch{state.snapshot=null;}
  const initialParams=new URLSearchParams(location.search),initialId=initialParams.get('article');if(initialId)state.pending=initialId;if(views.some(v=>v.id===initialParams.get('view')))state.view=initialParams.get('view');
  if(native){try{const id=NativeNews.getInitialArticle();if(id)state.pending=id;}catch{}}
  refresh(true);prepareSW();refreshTimer=setInterval(()=>{if(!document.hidden)refresh(true);},5*60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
  navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='open-article')openArticle(event.data.id);});
})();
