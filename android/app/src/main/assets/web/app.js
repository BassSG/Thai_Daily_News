/* Thai Daily News — one reading experience for desktop, Android and GAS. */
(() => {
  'use strict';
  const C=window.TDN_CONFIG, native=!!window.NativeNews, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const categories=[{id:'politics',label:'การเมือง',icon:'landmark',color:'#b49bd9'},{id:'society',label:'สังคม',icon:'people',color:'#79bca9'},{id:'crime',label:'อาชญากรรม',icon:'shield',color:'#dc9292'},{id:'economy',label:'เศรษฐกิจ',icon:'chart',color:'#d9bc7b'},{id:'world',label:'ต่างประเทศ',icon:'globe',color:'#8caee2'},{id:'tech',label:'เทคโนโลยี',icon:'sparkles',color:'#96a4ee'}];
  const paths={home:'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',clock:'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',bookmark:'M6 3h12v18l-6-4-6 4z',trending:'m3 16 6-6 4 4 8-10M15 4h6v6',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M9 3l-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3z',search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',moon:'M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',refresh:'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M18 18a8 8 0 0 1-14-6',arrow:'M4 12h16m-6-6 6 6-6 6','arrow-down':'M12 4v16m-6-6 6 6 6-6',close:'m6 6 12 12M6 18 18 6',globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',landmark:'m3 9 9-6 9 6H3m2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',people:'M16 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0M17 4a4 4 0 0 1 0 8m4 9v-3a4 4 0 0 0-3-4',shield:'M12 3 3 6v6c0 5 9 9 9 9s9-4 9-9V6zM9 12l2 2 4-4',chart:'M4 3v18h17M8 16v-4m5 4V7m5 9v-6',sparkles:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3zM21 2v4m-2-2h4',widget:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',palette:'M12 3a9 9 0 1 0 0 18c3 0 3-3 1-4-2-1-1-3 1-3h4c4 0 3-11-6-11M7 9h.01M11 6h.01M16 8h.01M6 14h.01',android:'M5 8h14v11H5zM7 8a5 5 0 0 1 10 0M8 3 6 1m10 2 2-2M8 19v3m8-3v3M2 10v7m20-7v7',share:'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M9 10l6-4M9 14l6 4',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',check:'m4 12 5 5L20 6',newspaper:'M4 3h16v18H4zM7 7h10M7 11h4v4H7zM14 11h3m-3 4h3M7 18h10',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'};
  Object.assign(paths,{list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z','chevron-right':'m9 5 7 7-7 7','arrow-left':'M20 12H4m6-6-6 6 6 6','arrow-up':'M12 20V4m-6 6 6-6 6 6',zap:'m13 2-9 12h7l-1 8L21 9h-8z',type:'M4 5V3h16v2M12 3v18m-4 0h8'});
  const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]||paths.newspaper}"></path></svg>`;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl=s=>/^https?:\/\//i.test(String(s||''))?String(s):'#';
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f;}catch{return f;}};
  const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{/* Reading remains available when storage is full. */}};
  let preferences=load('tdn.preferences',{categories:[],alertMode:'major',quietHours:true,timezoneOffset:new Date().getTimezoneOffset(),enabled:false});
  if(native){try{preferences={...preferences,...JSON.parse(NativeNews.getSettings())};}catch{}}
  if(!['breaking','major','signals'].includes(preferences.alertMode))preferences.alertMode='major';
  const state={snapshot:null,view:'today',category:'all',query:'',limit:20,layout:load('tdn.layout','list'),readerSize:load('tdn.reader-size','normal'),settingsTab:'alerts',saved:load('tdn.saved',{}),read:new Set(load('tdn.read',[])),failedImages:new Set(),selected:null,pending:null,refreshing:false};
  if(!['list','cards'].includes(state.layout))state.layout='list';
  let toastTimer,refreshTimer,installPrompt,swRegistration,bridgeReady,bridgeWindow,bridgeOrigin,bridgeToken,bridgePromise;
  const requests=new Map();
  const views=[{id:'today',label:'สำหรับคุณ',short:'วันนี้',icon:'home'},{id:'alerts',label:'ข่าวสำคัญ',short:'ต้องรู้',icon:'zap'},{id:'trending',label:'จับกระแส',short:'กระแส',icon:'trending'},{id:'latest',label:'ข่าวล่าสุด',short:'ล่าสุด',icon:'clock'},{id:'saved',label:'บันทึกไว้อ่าน',short:'บันทึก',icon:'bookmark'}];
  const signals={breaking:{label:'ข่าวด่วน',className:'breaking'},major:{label:'ข่าวใหญ่',className:'major'},trending:{label:'กำลังเป็นกระแส',className:'trending'},rising:{label:'เริ่มเป็นกระแส',className:'rising'}};
  function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4200);}
  function paintIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
  function detectFlexGap(){const probe=document.createElement('div');probe.style.cssText='position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px';probe.append(document.createElement('div'),document.createElement('div'));[...probe.children].forEach(el=>el.style.height='1px');document.body.appendChild(probe);document.documentElement.classList.toggle('no-flex-gap',probe.scrollHeight<3);probe.remove();}
  function shortTime(date){const ms=Date.now()-Date.parse(date);if(!Number.isFinite(ms))return 'ไม่ทราบเวลา';if(ms<60000)return 'เมื่อสักครู่';if(ms<3600000)return `${Math.floor(ms/60000)} นาทีที่แล้ว`;if(ms<86400000)return `${Math.floor(ms/3600000)} ชม. ที่แล้ว`;return new Date(date).toLocaleDateString('th-TH',{day:'numeric',month:'short'});}
  function fullTime(date){return date?new Date(date).toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'ยังไม่มีเวลาอัปเดต';}
  function categoryOf(item){return categories.find(c=>c.id===item.category_id)||categories[1];}
  function titleOf(item){return item.title_th||item.title||item.title_raw||'';}
  function signalOf(item){return signals[item.signal]||null;}
  function signalBadge(item){const signal=signalOf(item);return signal?`<span class="signal-badge ${signal.className}">${signal.label}</span>`:'';}
  function imageOf(item){const image=item.image_url||(state.snapshot?.items||[]).find(it=>it.id===item.id)?.image_url||'';return /^https:\/\/[a-z0-9.-]+(?::443)?\//i.test(image)&&!state.failedImages.has(image)?image:'';}
  function photo(item,kind){const image=imageOf(item);return image?`<figure class="story-photo ${kind}-photo"><img class="news-image" data-news-image src="${esc(image)}" alt="${kind==='article'?esc('ภาพประกอบข่าวจาก '+item.source):''}" loading="${kind==='hero'?'eager':'lazy'}" ${kind==='hero'?'fetchpriority="high"':''} decoding="async" referrerpolicy="no-referrer">${kind==='article'?`<figcaption>ภาพจาก ${esc(item.source)} · เปิดรายละเอียดที่สำนักข่าวต้นฉบับ</figcaption>`:''}</figure>`:'';}
  function meta(item){return `<div class="story-meta"><span class="source-name">${esc(item.source||item.host||'สำนักข่าว')}</span><i class="meta-dot"></i><time datetime="${esc(item.published_at)}">${esc(shortTime(item.published_at))}</time>${item.source_count>1?`<span class="source-proof">${item.source_count} แหล่งข่าว</span>`:''}${item.language==='en'?'<span class="language-tag">EN</span>':''}</div>`;}
  function renderNavigation(){
    $('#desktopNav').innerHTML=views.map(v=>`<button class="nav-item ${state.view===v.id?'active':''}" data-view="${v.id}" aria-current="${state.view===v.id?'page':'false'}">${icon(v.icon)}${v.label}${v.id==='saved'?`<span class="nav-count">${Object.keys(state.saved).length}</span>`:''}</button>`).join('');
    $('#categoryNav').innerHTML=categories.map(c=>`<button class="nav-item ${state.category===c.id?'active':''}" data-category="${c.id}"><i class="category-dot" style="background:${c.color}"></i>${c.label}</button>`).join('');
    $('#bottomNav').innerHTML=views.map(v=>`<button data-view="${v.id}" class="${state.view===v.id?'active':''}" aria-current="${state.view===v.id?'page':'false'}">${icon(v.icon)}<span>${v.short}</span></button>`).join('');
    $('#categoryChips').innerHTML=[{id:'all',label:'ทั้งหมด',icon:'newspaper'},...categories].map(c=>`<button class="category-chip ${state.category===c.id?'active':''}" data-category="${c.id}" aria-pressed="${state.category===c.id}">${icon(c.icon)}${c.label}</button>`).join('');
  }
  function listItems(){
    let items=state.view==='saved'?Object.values(state.saved):(state.snapshot?.items||[]).slice();
    const hours=Number($('#timeFilter').value),q=state.query.toLowerCase();
    items=items.filter(it=>(state.view==='saved'||Date.now()-Date.parse(it.published_at)<hours*3600000)&&(state.category==='all'||it.category_id===state.category)&&(!q||(titleOf(it)+' '+it.excerpt+' '+it.source+' '+it.category).toLowerCase().includes(q)));
    if(state.view==='today')items=items.filter(it=>it.scope!=='world'||it.alert_eligible);
    if(state.view==='alerts')items=items.filter(it=>it.alert_eligible&&(it.signal==='breaking'||it.signal==='major'));
    if(state.view==='trending')items=items.filter(it=>it.scope!=='world'&&(it.signal==='trending'||it.signal==='rising'));
    items.sort(['today','alerts','trending'].includes(state.view)?(a,b)=>b.score-a.score:(a,b)=>Date.parse(b.published_at)-Date.parse(a.published_at));
    if(['today','alerts','trending'].includes(state.view)){const topics=new Set();items=items.filter(it=>{const topic=it.topic_id||it.id;if(topics.has(topic))return false;topics.add(topic);return true;});}
    return items;
  }
  function renderPulse(){
    const all=(state.snapshot?.items||[]).filter(it=>Date.now()-Date.parse(it.published_at)<24*3600000),counted={breaking:new Set(),major:new Set(),trending:new Set()};
    all.forEach(it=>{const topic=it.topic_id||it.id;if(it.alert_eligible&&it.signal==='breaking')counted.breaking.add(topic);else if(it.alert_eligible&&it.signal==='major')counted.major.add(topic);else if(it.scope!=='world'&&['trending','rising'].includes(it.signal))counted.trending.add(topic);});
    $('#pulseStats').innerHTML=[['breaking','ข่าวด่วน','alerts'],['major','ข่าวใหญ่','alerts'],['trending','กระแส','trending']].map(([key,label,view])=>`<button class="pulse-stat ${key}" data-view="${view}" aria-label="${label} ${counted[key].size} ประเด็น"><strong>${counted[key].size}</strong><span>${label}</span></button>`).join('');
  }
  function bookmark(item,hero=false){return `<button class="icon-button ${hero?'hero-save':'bookmark-button'} ${state.saved[item.id]?'saved':''}" data-save="${item.id}" aria-label="${state.saved[item.id]?'นำออกจาก':'เพิ่มใน'}ข่าวที่บันทึกไว้" aria-pressed="${!!state.saved[item.id]}">${icon('bookmark')}</button>`;}
  function renderLead(item){
    return `<article class="hero-card ${imageOf(item)?'has-image':''}"><button class="hero-open" data-open="${item.id}" aria-label="อ่านข่าว ${esc(titleOf(item))}">${photo(item,'hero')}<span class="hero-label">${icon('eye')}IN FOCUS</span><div class="hero-copy"><div class="hero-kicker"><span>${esc(categoryOf(item).label)}</span>${signalBadge(item)}</div><h2>${esc(titleOf(item))}</h2>${item.excerpt?`<p>${esc(item.excerpt)}</p>`:''}<div class="hero-bottom">${meta(item)}<span class="read-circle">${icon('arrow')}</span></div></div></button>${bookmark(item,true)}</article>`;
  }
  function render(){
    renderNavigation();
    const titles={today:['เรื่องสำคัญ วันนี้','ข่าวไทยที่ควรรู้ และเรื่องใหญ่จากทั่วโลก','YOUR DAILY BRIEF','รอบวันของคุณ'],alerts:['เรื่องที่ต้องรู้','ข่าวด่วนและข่าวใหญ่ ที่มีผลกระทบจริง','THE ESSENTIALS','ข่าวสำคัญตอนนี้'],trending:['จับกระแส ก่อนใคร','ประเด็นที่หลายสำนักกำลังรายงาน และเรื่องใหม่ที่น่าจับตา','ON THE RADAR','ประเด็นที่กำลังขยับ'],latest:['อัปเดตล่าสุด','ข่าวใหม่จากทุกสำนัก เรียงตามเวลาที่เผยแพร่','THE LIVE FEED','ทุกความเคลื่อนไหว'],saved:['เก็บไว้ ในเวลาของคุณ','เรื่องที่สนใจ พร้อมกลับมาอ่านต่อได้ทุกเมื่อ','YOUR READING LIST','บันทึกไว้อ่าน']};
    const selectedCategory=categories.find(c=>c.id===state.category),viewTitle=titles[state.view];
    $('#pageTitle').textContent=state.query?'ค้นหาข่าว':selectedCategory?selectedCategory.label:viewTitle[0];
    $('#pageSubtitle').textContent=state.query?`ผลการค้นหา “${state.query}”`:selectedCategory?`เรื่องล่าสุดในหมวด${selectedCategory.label} จากหลายสำนักข่าว`:viewTitle[1];
    $('#viewEyebrow').textContent=state.query?'FIND YOUR PERSPECTIVE':viewTitle[2];
    $('#feedTitle').textContent=state.query?'ผลการค้นหา':selectedCategory?`ข่าว${selectedCategory.label}`:viewTitle[3];
    $('#feedEyebrow').textContent=state.view==='saved'?'SAVED FOR LATER':'THE NEWSROOM';
    const filtered=state.category!=='all'||!!state.query,hours=Number($('#timeFilter').value),items=listItems();
    const showHero=['today','alerts','trending'].includes(state.view)&&!filtered&&items.length;
    const priorities=(state.snapshot?.topIds||[]).map(id=>items.find(it=>it.id===id)).filter(Boolean);
    const hero=showHero?(items.find(it=>['breaking','major'].includes(it.signal)&&imageOf(it))||priorities.find(it=>imageOf(it)&&it.language==='th')||items.find(it=>imageOf(it))||items[0]):null;
    const urgent=showHero?items.find(it=>it.alert_eligible&&['breaking','major'].includes(it.signal)&&it.id!==hero?.id):null;
    $('#priorityBanner').hidden=!urgent;$('#priorityBanner').dataset.signal=urgent?.signal||'';$('#priorityBanner').innerHTML=urgent?`<button data-open="${urgent.id}">${signalBadge(urgent)}<strong>${esc(titleOf(urgent))}</strong>${icon('arrow')}</button>`:'';
    // Secondary stories stay in the feed on phones, where the feature rail is hidden.
    const features=hero&&state.view==='today'?items.filter(it=>it.id!==hero.id&&it.topic_id!==hero.topic_id&&imageOf(it)).slice(0,2):[];
    const side=features.length===2?`<div class="feature-side">${features.map(it=>`<article class="feature-card"><button class="feature-open" data-open="${it.id}" aria-label="อ่านข่าว ${esc(titleOf(it))}">${photo(it,'feature')}<div class="feature-copy"><div class="feature-kicker">${signalBadge(it)||esc(categoryOf(it).label)}</div><h3>${esc(titleOf(it))}</h3><div class="feature-meta">${esc(it.source)} · ${esc(shortTime(it.published_at))}</div></div></button></article>`).join('')}</div>`:'';
    $('#heroContainer').innerHTML=hero?`<div class="feature-grid ${side?'':'single'}">${renderLead(hero)}${side}</div>`:'';
    const rest=hero?items.filter(it=>it.id!==hero.id):items,shown=rest.slice(0,state.limit);
    $('.reading-layout').hidden=!!hero&&!rest.length;
    $('#newsCount').textContent=`${items.length.toLocaleString('th-TH')} ${state.view==='saved'?'เรื่องที่บันทึก':'เรื่อง'}`;
    $('#feed').setAttribute('aria-busy','false');$('#feed').classList.toggle('feed-cards',state.layout==='cards'&&shown.length>0);
    $$('[data-layout]').forEach(el=>{el.classList.toggle('active',el.dataset.layout===state.layout);el.setAttribute('aria-pressed',String(el.dataset.layout===state.layout));});
    const filteredLabels=[state.query?`“${esc(state.query)}”`:'',selectedCategory?esc(selectedCategory.label):'',hours!==24?`${hours} ชั่วโมง`:''].filter(Boolean);
    $('#filterSummary').hidden=!filteredLabels.length;$('#filterSummary').innerHTML=filteredLabels.length?`<span>กำลังแสดง ${filteredLabels.join(' · ')}</span><button data-reset-filters>${icon('close')}ล้างตัวกรอง</button>`:'';
    const empty=state.view==='saved'?['bookmark','เรื่องที่อยากอ่าน เก็บไว้ตรงนี้','แตะไอคอนบันทึกบนข่าว แล้วกลับมาอ่านต่อเมื่อพร้อม']:state.view==='alerts'?['shield','ตอนนี้ยังไม่มีข่าวที่ต้องแจ้งเตือน','เรากำลังติดตามข่าวต่อเนื่อง เรื่องที่ผ่านเกณฑ์จะปรากฏที่นี่']:state.view==='trending'?['trending','กำลังมองหาประเด็นใหม่','เมื่อหลายสำนักเริ่มรายงานเรื่องเดียวกัน คุณจะเห็นได้ที่นี่']:['search','ยังไม่พบข่าวที่ตรงกัน','ลองใช้คำค้นสั้นลง หรือดูข่าวในช่วงเวลาอื่น'];
    $('#feed').innerHTML=shown.length?shown.map(it=>{const c=categoryOf(it);return `<article class="news-card ${features.some(feature=>feature.id===it.id)&&side?'featured-secondary':''} ${state.read.has(it.id)?'is-read':''}"><button class="story-open ${imageOf(it)?'has-photo':''}" data-open="${it.id}"><div class="story-copy"><div class="story-labels"><span class="category-label">${esc(c.label)}</span>${signalBadge(it)}</div><h3>${esc(titleOf(it))}</h3>${it.excerpt?`<p class="excerpt">${esc(it.excerpt)}</p>`:''}${meta(it)}${state.read.has(it.id)?`<span class="read-indicator">${icon('check')}อ่านแล้ว</span>`:''}</div>${photo(it,'thumb')}</button>${bookmark(it)}</article>`;}).join(''):`<div class="empty-state">${icon(empty[0])}<h3>${empty[1]}</h3><p>${filtered?'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง':empty[2]}</p><button class="secondary-button" ${filtered?'data-reset-filters':'data-view="today"'}>${filtered?'ล้างตัวกรอง':'กลับไปสำรวจข่าว'}${icon('arrow')}</button></div>`;
    $('#loadMore').hidden=rest.length<=state.limit;
    const topIds=[...(state.snapshot?.trendIds||[]),...(state.snapshot?.alertIds||[]),...(state.snapshot?.topIds||[])],top=[],seen=new Set();
    topIds.forEach(id=>{const it=getItem(id),topic=it?.topic_id||id;if(it&&!seen.has(topic)&&top.length<4){seen.add(topic);top.push(it);}});
    $('#topStories').innerHTML=top.length?top.map((it,i)=>`<button class="top-story" data-open="${it.id}"><span class="ordinal">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(titleOf(it))}</h3><small>${esc(it.source)} · ${esc(shortTime(it.published_at))}</small></div></button>`).join(''):'<p class="setting-hint">กำลังมองหาประเด็นล่าสุดให้คุณ</p>';
    renderPulse();renderFreshness();renderSources();
  }
  function renderFreshness(offline=false){
    const at=state.snapshot?.updatedAt,stale=!at||Date.now()-Date.parse(at)>25*60000||offline;
    $('#freshness').classList.toggle('stale',stale);
    $('#freshness').innerHTML=`<i></i>${offline?'กำลังอ่านข่าวที่บันทึกไว้':at?`${stale?'ข้อมูลอาจล่าช้า · ':''}อัปเดต ${esc(fullTime(at))}`:'กำลังเตรียมข่าวครั้งแรก'}`;
    $('#autoStatus').textContent=offline?'ออฟไลน์ · ใช้ข่าวที่บันทึกไว้':stale?'กำลังรอรอบถัดไป':'ทำงานอยู่ · ตรวจทุก 5 นาที';
  }
  function renderSources(){
    const health=state.snapshot?.health||[],available=health.filter(h=>['ok','empty'].includes(h.status)).length;
    $('#sourceSummary').textContent=health.length?`${available} แหล่งข่าวพร้อมอัปเดต`:'กำลังเชื่อมต่อแหล่งข่าว';
    $('#sourceHealth').innerHTML=(state.snapshot?.health||[]).map(h=>`<div class="source-health-row"><span>${esc(h.name)}</span><span class="${h.status==='ok'?'healthy':''}">${h.status==='ok'?'พร้อมอ่าน':h.status==='empty'?'ยังไม่มีข่าวใหม่':'กำลังรอการอัปเดต'}${h.lastSuccessAt?' · '+esc(shortTime(h.lastSuccessAt)):''}</span></div>`).join('')||'<p class="setting-hint">กำลังรอสถานะแหล่งข่าว</p>';
  }
  function resetFilters(){state.category='all';state.query='';state.limit=20;$('#searchInput').value='';$('#timeFilter').value='24';render();}
  function setView(view){state.view=view;state.category='all';state.query='';state.limit=20;$('#searchInput').value='';render();window.scrollTo({top:0,behavior:'smooth'});}
  function getItem(id){return state.snapshot?.items?.find(it=>it.id===id)||state.saved[id];}
  function saveStory(id){const it=getItem(id);if(!it)return;if(state.saved[id]){delete state.saved[id];toast('นำออกจากข่าวที่บันทึกไว้แล้ว');}else{if(Object.keys(state.saved).length>=150){toast('บันทึกได้สูงสุด 150 ข่าว กรุณานำข่าวเดิมออกก่อน');return;}state.saved[id]={...it};toast('บันทึกข่าวไว้ให้อ่านต่อแล้ว');}save('tdn.saved',state.saved);if(native)NativeNews.saveBookmarks(JSON.stringify(Object.values(state.saved)));render();if(state.selected===id)renderArticle(it);}
  let articleOpener;
  function openArticle(id){const it=getItem(id);if(!it){state.pending=id;return;}if(!state.selected)articleOpener=document.activeElement;state.pending=null;state.selected=id;state.read.add(id);save('tdn.read',[...state.read].slice(-500));renderArticle(it);$('#drawerBackdrop').hidden=false;$('#articleDrawer').hidden=false;$('.app-shell').inert=true;document.body.style.overflow='hidden';$('#backToTop').hidden=true;$('#articleDrawer').scrollTop=0;$('#readerProgress').style.width='0%';setReaderSize(state.readerSize);$('#closeArticle').focus();prepareReading(it);}
  function closeArticle(){if(!state.selected)return;const id=state.selected;state.selected=null;$('#drawerBackdrop').hidden=true;$('#articleDrawer').hidden=true;$('.app-shell').inert=false;document.body.style.overflow='';$$(`[data-open="${id}"]`).forEach(el=>el.closest('.news-card')?.classList.add('is-read'));const opener=articleOpener?.isConnected?articleOpener:document.querySelector(`[data-open="${id}"]`);opener?.focus({preventScroll:true});}
  function setReaderSize(size){
    state.readerSize=size==='large'?'large':'normal';save('tdn.reader-size',state.readerSize);
    $('#articleDrawer').classList.toggle('reader-large',state.readerSize==='large');
    $$('[data-reader-size]').forEach(el=>{const active=el.dataset.readerSize===state.readerSize;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});
  }
  function renderArticle(it){
    const c=categoryOf(it),summary=load('tdn.summary.'+it.id,null),related=(state.snapshot?.items||[]).filter(other=>other.id!==it.id&&other.topic_id&&other.topic_id===it.topic_id).filter((other,i,all)=>all.findIndex(o=>o.host===other.host)===i).slice(0,3);
    $('#articleContent').innerHTML=`<div class="article-labels"><span class="category-label">${esc(c.label)}</span>${signalBadge(it)}</div><h2>${esc(titleOf(it))}</h2>${meta(it)}<div class="article-actions"><div><button data-save="${it.id}" class="${state.saved[it.id]?'saved':''}">${icon(state.saved[it.id]?'check':'bookmark')}${state.saved[it.id]?'บันทึกแล้ว':'บันทึกข่าว'}</button><button data-share="${it.id}">${icon('share')}แชร์</button></div><span class="article-read-note">อ่านในแบบของคุณ</span></div>${photo(it,'article')}<section class="article-context"><span class="section-eyebrow">ใจความจากสำนักข่าว</span>${(it.reading_text||it.excerpt||'').length?String(it.reading_text||it.excerpt).split(/\n\s*\n/).map(p=>`<p class="article-excerpt">${esc(p)}</p>`).join(''):'<p class="article-excerpt limited-context">แหล่งข่าวนี้ให้มาเฉพาะพาดหัว จึงยังอธิบายรายละเอียดในแอปไม่ได้ กรุณาเปิดต้นฉบับเพื่ออ่านเนื้อหาที่ครบถ้วน</p>'}</section><div class="excerpt-note">เนื้อหาบางส่วนจาก ${esc(it.source)} · เผยแพร่ ${esc(fullTime(it.published_at))}</div><a class="primary-button wide original-button" href="${esc(safeUrl(it.url))}" target="_blank" rel="noopener noreferrer" data-external="${esc(safeUrl(it.url))}">อ่านฉบับเต็มที่ ${esc(it.source)} ${icon('external')}</a><span class="original-label">เปิดเว็บไซต์สำนักข่าวต้นฉบับ</span><section class="ai-panel"><h3>${icon('sparkles')}สรุปไทยให้อ่านง่าย</h3><p>เตรียมให้อัตโนมัติจากเนื้อหาที่แหล่งข่าวส่งมา · AI อาจคลาดเคลื่อน ตรวจสอบกับต้นฉบับได้</p><div id="aiResult" class="ai-result">${summary?.hash===it.content_hash?esc(summary.text):''}</div><button class="secondary-button wide" id="summarizeButton" data-summary="${it.id}" ${summary?.hash===it.content_hash?'hidden':''}>${icon('sparkles')}ช่วยแปลและสรุป</button></section>${related.length?`<section class="related-stories"><span class="section-eyebrow">ANOTHER PERSPECTIVE</span><h3>รายงานในประเด็นเดียวกัน</h3>${related.map(other=>`<button data-open="${other.id}"><span>${esc(other.source)}</span><b>${esc(titleOf(other))}</b>${icon('arrow')}</button>`).join('')}</section>`:''}`;
  }
  function requestId(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}
  function nativeRequest(action,payload={}){return new Promise((resolve,reject)=>{const id=requestId(),timer=setTimeout(()=>{requests.delete(id);reject(new Error('การเชื่อมต่อใช้เวลานาน กรุณาลองอีกครั้ง'));},45000);requests.set(id,{resolve,reject,timer});NativeNews.request(id,JSON.stringify({action,...payload}));});}
  addEventListener('tdn-native-result',e=>{const item=requests.get(e.detail.requestId);if(!item)return;clearTimeout(item.timer);requests.delete(e.detail.requestId);item.resolve(e.detail.result);});
  function jsonp(action,params={}){return new Promise((resolve,reject)=>{const callback='tdn_'+requestId(),script=document.createElement('script'),timer=setTimeout(()=>finish(new Error('เชื่อมต่อข่าวยังไม่สำเร็จ')),25000);let settled=false;function finish(error,data){if(settled)return;settled=true;clearTimeout(timer);window[callback]=()=>{};setTimeout(()=>delete window[callback],120000);script.remove();error?reject(error):resolve(data);}window[callback]=data=>finish(null,data);script.onerror=()=>finish(new Error('ยังเชื่อมต่อไม่ได้'));script.src=C.api+'?'+new URLSearchParams({action,...params,callback,_:Math.floor(Date.now()/60000)});document.head.appendChild(script);});}
  function initBridge(){if(bridgePromise)return bridgePromise;bridgeToken=crypto.randomUUID().replace(/-/g,'');bridgePromise=new Promise((resolve,reject)=>{bridgeReady=resolve;const frame=document.createElement('iframe');frame.hidden=true;frame.title='เชื่อมต่อบริการข่าว';frame.src=C.api+'?bridge=1&token='+bridgeToken;document.body.appendChild(frame);setTimeout(()=>{if(!bridgeWindow){bridgePromise=null;frame.remove();reject(new Error('ยังเชื่อมต่อบริการไม่ได้ กรุณาลองอีกครั้ง'));}},30000);});return bridgePromise;}
  addEventListener('message',event=>{const data=event.data;if(!data||data.channel!=='tdn-bridge-v2'||data.token!==bridgeToken||!/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i.test(event.origin))return;if(data.ready){bridgeWindow=event.source;bridgeOrigin=event.origin;bridgeReady?.();return;}const item=requests.get(data.requestId);if(item){clearTimeout(item.timer);requests.delete(data.requestId);item.resolve(data.result);}});
  async function command(payload){
    if(native)return nativeRequest(payload.action,payload);
    if(window.google?.script?.run)return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).apiCommand(payload));
    await initBridge();return new Promise((resolve,reject)=>{const id=requestId(),timer=setTimeout(()=>{requests.delete(id);reject(new Error('บริการยังไม่ตอบกลับ กรุณาลองอีกครั้ง'));},45000);requests.set(id,{resolve,reject,timer});bridgeWindow.postMessage({channel:'tdn-bridge-v2',token:bridgeToken,requestId:id,payload},bridgeOrigin);});
  }
  async function readSnapshot(){if(native)return nativeRequest('snapshot');if(window.google?.script?.run)return new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).apiGetSnapshot());return jsonp('snapshot');}
  let pendingSnapshot=null;
  function useSnapshot(snapshot){state.snapshot=snapshot;pendingSnapshot=null;$('#newStoriesButton').hidden=true;save('tdn.snapshot',snapshot);render();if(state.pending){if(getItem(state.pending))openArticle(state.pending);else{state.pending=null;toast('ข่าวนี้ไม่อยู่ในชุดล่าสุดแล้ว เลือกอ่านข่าวรอบวันได้เลย');}}}
  async function refresh(silent=false){
    if(state.refreshing)return;state.refreshing=true;$('#refreshButton').classList.add('loading');$('#refreshButton').disabled=true;
    try{
      const data=await readSnapshot();if(!data.ok||!Array.isArray(data.snapshot?.items))throw new Error(data.error||'ข้อมูลข่าวยังไม่พร้อม');
      const oldIds=new Set((state.snapshot?.items||[]).map(it=>it.id)),changed=data.snapshot.updatedAt!==state.snapshot?.updatedAt||data.snapshot.version!==state.snapshot?.version;
      if(silent&&oldIds.size&&changed&&!state.pending&&(window.scrollY>420||state.selected||$('dialog[open]'))){
        pendingSnapshot=data.snapshot;save('tdn.snapshot',data.snapshot);
        const count=data.snapshot.items.filter(it=>!oldIds.has(it.id)).length;
        $('#newStoriesButton').lastElementChild.textContent=count?`มีข่าวใหม่ ${count} เรื่อง · แตะเพื่ออัปเดต`:'มีอัปเดตข่าวใหม่ · แตะเพื่อดู';
        $('#newStoriesButton').hidden=false;
      }else if(changed||!oldIds.size||!silent||state.pending){useSnapshot(data.snapshot);}
      else{renderFreshness();}
      if(!silent)toast(data.snapshot.items.length?'อัปเดตข่าวล่าสุดให้แล้ว':'กำลังรวบรวมข่าวให้คุณ');
    }catch(error){if(!state.snapshot)render();renderFreshness(true);if(!silent)toast(error.message||'ยังเชื่อมต่อไม่ได้ ข่าวที่บันทึกไว้ยังอ่านได้');}
    finally{state.refreshing=false;$('#refreshButton').classList.remove('loading');$('#refreshButton').disabled=false;}
  }
  const readingRequests=new Set();
  async function prepareReading(it){
    const cached=load('tdn.summary.'+it.id,null);
    if(cached?.hash===it.content_hash||readingRequests.has(it.id))return;
    if((it.reading_text||it.excerpt||'').length<80){$('#aiResult').textContent='ข้อมูลยังไม่พอสำหรับสรุป ระบบจะไม่เดารายละเอียดจากพาดหัว';$('#summarizeButton').hidden=true;return;}
    $('#aiResult').textContent='กำลังเตรียมใจความภาษาไทยให้อัตโนมัติ…';
    readingRequests.add(it.id);
    try{await summarize(it.id,true);}finally{readingRequests.delete(it.id);}
  }
  async function summarize(id,automatic=false){const button=$('#summarizeButton');if(!button)return;button.disabled=true;button.innerHTML=icon('refresh')+' กำลังเตรียมสรุป';try{const res=await command({action:'summary',id});if(!res.ok)throw new Error(res.error);save('tdn.summary.'+id,{hash:getItem(id).content_hash,text:res.summary});if(state.selected===id){$('#aiResult').textContent=res.summary;button.hidden=true;}}catch(error){if(state.selected===id){$('#aiResult').textContent=error.message||'ยังเตรียมสรุปไม่ได้ อ่านเนื้อหาจากสำนักข่าวด้านบนได้';if(!automatic)toast(error.message||'ยังสรุปไม่ได้ ลองอีกครั้งภายหลัง');}}finally{button.disabled=false;button.innerHTML=icon('sparkles')+' ช่วยแปลและสรุปข่าวนี้';}}
  function updateSettings(){
    $('#quietHours').checked=preferences.quietHours!==false;
    $$('[data-alert-mode]').forEach(el=>{el.classList.toggle('active',el.dataset.alertMode===preferences.alertMode);el.setAttribute('aria-pressed',String(el.dataset.alertMode===preferences.alertMode));});
    $('#notifyDot').hidden=!preferences.enabled;
    $('#enableNotifications').textContent=preferences.enabled?'เปิดแล้ว':'เปิดแจ้งเตือน';
    $('#notificationStatus').textContent=preferences.enabled?(native?'เปิดแล้ว · Android ตรวจข่าวเบื้องหลังและแยกช่องข่าวด่วนกับข่าวใหญ่':'เปิดแล้ว · พร้อมรับเฉพาะสัญญาณตามระดับที่เลือก'):'ปิดอยู่ · เปิดเมื่อพร้อมรับเฉพาะข่าวที่ผ่านเกณฑ์';
    $('#notifyCategories').innerHTML=`<button class="preference-chip ${!preferences.categories.length?'selected':''}" data-notify-category="all">ทุกหมวด</button>`+categories.map(c=>`<button class="preference-chip ${preferences.categories.includes(c.id)?'selected':''}" data-notify-category="${c.id}">${c.label}</button>`).join('');
    $$('[data-theme-choice]').forEach(el=>el.classList.toggle('active',el.dataset.themeChoice===document.documentElement.dataset.theme));
    if(native){$('#installButton').hidden=true;$('#installDescription').textContent='คุณกำลังใช้แอป Android พร้อมการแจ้งเตือนและวิดเจ็ต แตะขนาดวิดเจ็ตด้านบนเพื่อเพิ่มบนหน้าจอหลัก';$('#apkDownload').hidden=true;$('#desktopInstall').hidden=true;}
  }
  let settingsTimer;
  function persistPreferences(){preferences.timezoneOffset=new Date().getTimezoneOffset();save('tdn.preferences',preferences);updateSettings();if(native){NativeNews.setSettings(JSON.stringify(preferences));return;}swRegistration?.active?.postMessage({type:'preferences',preferences});clearTimeout(settingsTimer);if(preferences.enabled)settingsTimer=setTimeout(()=>registerPush(false).catch(error=>toast(error.message)),1200);}
  function setSettingsTab(tab){state.settingsTab=tab;$$('[data-settings-tab]').forEach(el=>{const active=el.dataset.settingsTab===tab;el.classList.toggle('active',active);el.setAttribute('aria-selected',String(active));el.tabIndex=active?0:-1;});$$('[data-settings-panel]').forEach(el=>el.hidden=el.dataset.settingsPanel!==tab);$('#settingsDialog').scrollTop=0;}
  function showSettings(tab='alerts'){updateSettings();setSettingsTab(tab);if(!$('#settingsDialog').open)$('#settingsDialog').showModal();renderSources();}
  function setTheme(theme){document.documentElement.dataset.theme=theme;save('tdn.theme',theme);$('meta[name="theme-color"]').content=theme==='dark'?'#10151f':'#f6f7f9';$('#themeButton').innerHTML=icon(theme==='dark'?'sun':'moon');$('#themeButton').setAttribute('aria-label',theme==='dark'?'เปลี่ยนเป็นธีมสว่าง':'เปลี่ยนเป็นธีมมืด');updateSettings();if(native)NativeNews.setTheme(theme);}
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
  addEventListener('tdn-open-article',event=>{$$('dialog[open]').forEach(dialog=>dialog.close());openArticle(event.detail.id);if(state.pending)refresh(true);});
  addEventListener('tdn-toast',event=>toast(event.detail.message));
  document.addEventListener('error',event=>{const image=event.target;if(!image.matches?.('img[data-news-image]'))return;state.failedImages.add(image.getAttribute('src'));const figure=image.closest('.story-photo');if(figure)figure.hidden=true;image.closest('.hero-card')?.classList.remove('has-image');image.closest('.story-open')?.classList.remove('has-photo');},true);
  document.addEventListener('click',async event=>{
    const el=event.target.closest('button,a,[data-open]');if(!el)return;
    if(el.hasAttribute('data-home')){event.preventDefault();setView('today');return;}
    if(el.hasAttribute('data-reset-filters')){resetFilters();return;}
    if(el.dataset.layout){state.layout=el.dataset.layout;save('tdn.layout',state.layout);render();return;}
    if(el.dataset.readerSize){setReaderSize(el.dataset.readerSize);return;}
    if(el.dataset.settingsTab){setSettingsTab(el.dataset.settingsTab);return;}
    if(el.dataset.view){setView(el.dataset.view);return;}
    if(el.dataset.category){if(el.closest('#categoryNav')){state.view='today';state.query='';$('#searchInput').value='';window.scrollTo({top:0,behavior:'smooth'});}state.category=el.dataset.category;state.limit=20;render();return;}
    if(el.dataset.open){openArticle(el.dataset.open);return;}
    if(el.dataset.save){saveStory(el.dataset.save);return;}
    if(el.dataset.summary){summarize(el.dataset.summary);return;}
    if(el.dataset.share){const it=getItem(el.dataset.share);try{if(native)NativeNews.share(titleOf(it),it.url);else if(navigator.share)await navigator.share({title:titleOf(it),url:it.url});else{await navigator.clipboard.writeText(it.url);toast('คัดลอกลิงก์ข่าวแล้ว');}}catch{}return;}
    if(el.dataset.action==='settings'){showSettings();return;}
    if(el.hasAttribute('data-close-dialog')){el.closest('dialog').close();return;}
    if(el.dataset.themeChoice){setTheme(el.dataset.themeChoice);return;}
    if(el.dataset.alertMode){preferences.alertMode=el.dataset.alertMode;persistPreferences();return;}
    if(el.dataset.notifyCategory){const cat=el.dataset.notifyCategory;if(cat==='all')preferences.categories=[];else if(preferences.categories.includes(cat)){if(preferences.categories.length===1){toast('เลือกอย่างน้อยหนึ่งหมวด หรือเลือกทุกหมวด');return;}preferences.categories=preferences.categories.filter(c=>c!==cat);}else preferences.categories=[...preferences.categories,cat];persistPreferences();return;}
    if(el.dataset.widget){if(native)NativeNews.pinWidget(el.dataset.widget);else{toast('วิดเจ็ตใช้ได้ในแอป Android ดาวน์โหลด APK ในหน้านี้ได้เลย');setSettingsTab('about');$('#apkDownload').scrollIntoView({behavior:'smooth',block:'center'});}return;}
    if(el.dataset.external&&native){event.preventDefault();NativeNews.openExternal(el.dataset.external);return;}
    if(el.tagName==='A'&&native&&/^https?:/.test(el.href)){event.preventDefault();NativeNews.openExternal(el.href);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeArticle();if(event.key==='/'&&!state.selected&&!$('dialog[open]')&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();document.body.classList.add('search-open');$('#searchToggle').setAttribute('aria-expanded','true');$('#searchInput').focus();}if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-open][role=button]')){event.preventDefault();openArticle(event.target.dataset.open);}if(event.key==='Tab'&&!$('#articleDrawer').hidden){const focusable=$$('#articleDrawer button:not([hidden]), #articleDrawer a'),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  $('#newStoriesButton').addEventListener('click',()=>{if(pendingSnapshot){useSnapshot(pendingSnapshot);window.scrollTo({top:0,behavior:'smooth'});}});
  $('#refreshButton').addEventListener('click',()=>refresh());$('#loadMore').addEventListener('click',()=>{state.limit+=20;render();});
  $('#searchInput').addEventListener('input',event=>{state.query=event.target.value.trim();state.limit=20;render();});$('#timeFilter').addEventListener('change',()=>{state.limit=20;render();});
  $('#closeArticle').addEventListener('click',closeArticle);$('#drawerBackdrop').addEventListener('click',closeArticle);
  $('#themeButton').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  $('#enableNotifications').addEventListener('click',enableNotifications);$('#disableNotifications').addEventListener('click',disableNotifications);$('#testNotification').addEventListener('click',testNotification);
  $('#quietHours').addEventListener('change',event=>{preferences.quietHours=event.target.checked;persistPreferences();});
  $('#installButton').addEventListener('click',showInstall);$('#desktopInstall').addEventListener('click',()=>{$('#settingsDialog').close();showInstall();});$('#installNow').addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;}});
  $('#sourcesButton').addEventListener('click',()=>{showSettings('about');$('.source-settings').open=true;$('.source-settings').scrollIntoView({behavior:'smooth',block:'start'});});
  $('#searchToggle').addEventListener('click',()=>{const open=!document.body.classList.contains('search-open');document.body.classList.toggle('search-open',open);$('#searchToggle').setAttribute('aria-expanded',String(open));if(open){window.scrollTo({top:0,behavior:'smooth'});$('#searchInput').focus({preventScroll:true});}else if(state.query){state.query='';$('#searchInput').value='';render();}});
  $('#backToTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  addEventListener('scroll',()=>{$('#backToTop').hidden=window.scrollY<750||!!state.selected;},{passive:true});
  $('#articleDrawer').addEventListener('scroll',()=>{const drawer=$('#articleDrawer'),total=drawer.scrollHeight-drawer.clientHeight;$('#readerProgress').style.width=(total>0?Math.min(100,drawer.scrollTop/total*100):0)+'%';},{passive:true});
  $('.settings-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('[data-settings-tab]'),index=tabs.findIndex(el=>el.dataset.settingsTab===state.settingsTab),next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setSettingsTab(tabs[next].dataset.settingsTab);tabs[next].focus();});
  $$('dialog').forEach(d=>d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}}));
  window.TDN_BACK=()=>{const dialog=$$('dialog').find(d=>d.open);if(dialog){dialog.close();return true;}if(state.selected){closeArticle();return true;}if(document.body.classList.contains('search-open')){document.body.classList.remove('search-open');$('#searchToggle').setAttribute('aria-expanded','false');state.query='';$('#searchInput').value='';render();return true;}if(state.view!=='today'||state.category!=='all'||state.query){state.category='all';state.query='';$('#searchInput').value='';setView('today');return true;}return false;};
  $('#editionDate').textContent=new Date().toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('#editionNumber').textContent=new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short'}).toUpperCase()+' / DAILY';
  detectFlexGap();paintIcons();setTheme(load('tdn.theme','light'));setReaderSize(state.readerSize);setSettingsTab('alerts');renderNavigation();updateSettings();
  try{state.snapshot=native?JSON.parse(NativeNews.getCachedSnapshot()):load('tdn.snapshot',null);if(state.snapshot?.items)render();else state.snapshot=null;}catch{state.snapshot=null;}
  const initialParams=new URLSearchParams(location.search),initialId=initialParams.get('article');if(initialId)state.pending=initialId;if(views.some(v=>v.id===initialParams.get('view')))state.view=initialParams.get('view');
  if(native){try{const id=NativeNews.getInitialArticle();if(id)state.pending=id;}catch{}}
  refresh(true);prepareSW();refreshTimer=setInterval(()=>{if(!document.hidden)refresh(true);},5*60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
  navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='open-article')openArticle(event.data.id);});
})();
